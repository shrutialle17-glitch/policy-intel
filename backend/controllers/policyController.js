const prisma = require('../prismaClient');
const { uploadFile, getSignedUrl } = require('../services/supabaseService');

exports.createPolicy = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'PDF file is required', code: 'FILE_MISSING' } });
    }

    const { title, description, category, issuingAuthority, documentType, publicationDate, effectiveDate, version } = req.body;
    
    if (!title || !category) {
      return res.status(400).json({ error: { message: 'Title and category are required', code: 'VALIDATION_ERROR' } });
    }

    const fileUrl = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);

    const policy = await prisma.policy.create({
      data: {
        title,
        description,
        category,
        issuingAuthority,
        documentType,
        publicationDate: publicationDate ? new Date(publicationDate) : null,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
        version,
        fileUrl,
        fileSizeBytes: req.file.size,
        status: 'PROCESSING',
        uploadedById: req.user.id
      }
    });

    // Fire and forget asynchronous processing
    const { processPolicy } = require('../services/policyProcessingService');
    processPolicy(policy.id).catch(err => console.error('Background processing failed deeply:', err));

    res.status(201).json({ data: policy });
  } catch (err) {
    console.error('Error creating policy:', err);
    res.status(500).json({ error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
};

exports.listPolicies = async (req, res) => {
  try {
    let { page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc', search, category, issuingAuthority, documentType, status } = req.query;
    
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const where = {};

    // Role-based visibility logic
    if (req.user.role === 'ADMIN') {
      if (status) {
        where.status = status;
      }
    } else {
      // USER can only see READY policies
      where.status = 'READY';
      // If user tries to filter by status, ignore or override it, or return error. We override it.
    }

    if (category) where.category = category;
    if (issuingAuthority) where.issuingAuthority = issuingAuthority;
    if (documentType) where.documentType = documentType;

    let policies = [];
    let total = 0;

    if (search && search.trim() !== '') {
      // Full text search requires raw query
      const tsQuery = search.trim().split(/\s+/).map(term => term + ':*').join(' & ');
      
      // Construct raw WHERE clause for filters
      const conditions = [];
      const values = [];
      let paramCount = 1;

      conditions.push(`"Policy"."status" = $${paramCount++}`);
      values.push(where.status || (req.user.role === 'ADMIN' && !status ? 'READY' : status || 'READY')); // Wait, if admin and no status provided, we want to allow all except ARCHIVED maybe? Wait, user asked: "only show status=READY policies unless a status filter is explicitly applied by an ADMIN. ARCHIVED policies are hidden from USER search entirely". If admin doesn't apply filter, show all except ARCHIVED? "ARCHIVED policies are hidden from USER search entirely, visible to ADMIN only via an explicit 'show archived' filter toggle". So if no status filter, even for ADMIN, don't show ARCHIVED. Let's make it simple: if no status, status NOT ARCHIVED (or just DRAFT, PROCESSING, READY, FAILED). But for FTS raw query, it's easier to use Prisma's extensions or just construct the query. Let's use standard Prisma for filters, and raw for search.
      
      // Better approach for FTS with Prisma is using a raw query to get IDs, then Prisma findMany, OR just doing it all in raw.
      const searchResult = await prisma.$queryRaw`
        SELECT id FROM "Policy"
        WHERE to_tsvector('english', title || ' ' || coalesce(description, '')) @@ to_tsquery('english', ${tsQuery})
      `;
      const matchedIds = searchResult.map(r => r.id);
      
      if (matchedIds.length === 0) {
        return res.json({
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0 }
        });
      }
      
      where.id = { in: matchedIds };
    }

    // Role visibility refinement
    if (req.user.role === 'ADMIN' && !status) {
       where.status = { not: 'ARCHIVED' };
    }

    total = await prisma.policy.count({ where });
    policies = await prisma.policy.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      include: {
        uploadedBy: { select: { name: true, email: true } }
      }
    });

    res.json({
      data: policies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error listing policies:', err);
    res.status(500).json({ error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
};

exports.getPolicy = async (req, res) => {
  try {
    const policy = await prisma.policy.findUnique({
      where: { id: req.params.id },
      include: {
        uploadedBy: { select: { name: true, email: true } }
      }
    });

    if (!policy) {
      return res.status(404).json({ error: { message: 'Policy not found', code: 'NOT_FOUND' } });
    }

    // Check visibility
    if (req.user.role !== 'ADMIN' && policy.status !== 'READY') {
      return res.status(403).json({ error: { message: 'Access denied', code: 'FORBIDDEN' } });
    }

    res.json({ data: policy });
  } catch (err) {
    console.error('Error getting policy:', err);
    res.status(500).json({ error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
};

exports.updatePolicyMetadata = async (req, res) => {
  try {
    const { title, description, category, issuingAuthority, documentType, publicationDate, effectiveDate, version } = req.body;
    
    const policy = await prisma.policy.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        category,
        issuingAuthority,
        documentType,
        publicationDate: publicationDate ? new Date(publicationDate) : null,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
        version,
      }
    });

    res.json({ data: policy });
  } catch (err) {
    console.error('Error updating policy:', err);
    res.status(500).json({ error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
};

exports.updatePolicyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['DRAFT', 'PROCESSING', 'READY', 'FAILED', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({ error: { message: 'Invalid status', code: 'VALIDATION_ERROR' } });
    }

    const policy = await prisma.policy.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json({ data: policy });
  } catch (err) {
    console.error('Error updating policy status:', err);
    res.status(500).json({ error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
};

exports.getPolicyFileUrl = async (req, res) => {
  try {
    const policy = await prisma.policy.findUnique({
      where: { id: req.params.id }
    });

    if (!policy) {
      return res.status(404).json({ error: { message: 'Policy not found', code: 'NOT_FOUND' } });
    }

    if (req.user.role !== 'ADMIN' && policy.status !== 'READY') {
      return res.status(403).json({ error: { message: 'Access denied', code: 'FORBIDDEN' } });
    }

    const signedUrl = await getSignedUrl(policy.fileUrl, 300);
    res.json({ data: { signedUrl } });
  } catch (err) {
    console.error('Error getting signed URL:', err);
    res.status(500).json({ error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
};

exports.reprocessPolicy = async (req, res) => {
  try {
    const policy = await prisma.policy.findUnique({ where: { id: req.params.id } });
    if (!policy) {
      return res.status(404).json({ error: { message: 'Policy not found', code: 'NOT_FOUND' } });
    }

    // Delete existing chunks
    await prisma.policyChunk.deleteMany({
      where: { policyId: policy.id }
    });

    // Reset status to PROCESSING
    const updatedPolicy = await prisma.policy.update({
      where: { id: policy.id },
      data: { status: 'PROCESSING', errorMessage: null }
    });

    // Trigger async processing
    const { processPolicy } = require('../services/policyProcessingService');
    processPolicy(policy.id).catch(err => console.error('Background reprocessing failed deeply:', err));

    res.json({ data: updatedPolicy });
  } catch (err) {
    console.error('Error reprocessing policy:', err);
    res.status(500).json({ error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
};

exports.deletePolicy = async (req, res) => {
  try {
    const policy = await prisma.policy.findUnique({ where: { id: req.params.id } });
    if (!policy) {
      return res.status(404).json({ error: { message: 'Policy not found', code: 'NOT_FOUND' } });
    }

    // Delete existing chunks
    await prisma.policyChunk.deleteMany({
      where: { policyId: policy.id }
    });

    // Delete policy (we don't delete the file from Supabase as per standard soft-delete or simple implementation, but deleting the DB record is enough)
    await prisma.policy.delete({
      where: { id: policy.id }
    });

    res.json({ message: 'Policy deleted successfully' });
  } catch (err) {
    console.error('Error deleting policy:', err);
    res.status(500).json({ error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
};

