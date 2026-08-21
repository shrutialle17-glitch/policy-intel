const prisma = require('../prismaClient');
const { processTender } = require('../services/tenderProcessingService');
const supabase = require('../config/supabase'); // Or wherever it's initialized

// Make sure we have a function to upload file in supabaseService
const { uploadFile, getFileUrl, deleteFile } = require('../services/supabaseService');

exports.createTender = async (req, res) => {
  try {
    const { title } = req.body;
    const file = req.file;

    if (!title || !file) {
      return res.status(400).json({ error: { message: 'Title and file are required', code: 'BAD_REQUEST' } });
    }

    const fileExt = file.originalname.split('.').pop();
    const filePath = `tenders/${req.user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    console.log(`[Tender Upload] User: ${req.user.id}, File: ${file.originalname}, Size: ${file.size}, Path: ${filePath}`);

    const fileUrl = await uploadFile(file.buffer, filePath, file.mimetype);
    console.log(`[Tender Upload] Success, URL: ${fileUrl}`);

    const tender = await prisma.tenderDocument.create({
      data: {
        userId: req.user.id,
        title,
        originalFileName: file.originalname,
        fileUrl: fileUrl,
        fileSizeBytes: file.size,
        status: 'UPLOADED'
      }
    });

    // Fire and forget
    processTender(tender.id).catch(console.error);

    res.status(201).json({ data: tender });
  } catch (err) {
    console.error('Error in createTender:', err);
    res.status(500).json({ error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
};

exports.listTenders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [tenders, total] = await Promise.all([
      prisma.tenderDocument.findMany({
        where: { userId: req.user.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.tenderDocument.count({ where: { userId: req.user.id } })
    ]);

    res.json({
      data: tenders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error listing tenders:', err);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

exports.getTender = async (req, res) => {
  try {
    const tender = await prisma.tenderDocument.findUnique({
      where: { id: req.params.id }
    });

    if (!tender || tender.userId !== req.user.id) {
      return res.status(404).json({ error: { message: 'Tender not found' } });
    }

    res.json({ data: tender });
  } catch (err) {
    console.error('Error getting tender:', err);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

exports.getTenderFileUrl = async (req, res) => {
  try {
    const tender = await prisma.tenderDocument.findUnique({
      where: { id: req.params.id }
    });

    if (!tender || tender.userId !== req.user.id) {
      return res.status(404).json({ error: { message: 'Tender not found' } });
    }

    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(tender.fileUrl, 3600); // 1 hour valid

    if (error) throw error;

    res.json({ data: { signedUrl: data.signedUrl } });
  } catch (err) {
    console.error('Error generating signed URL:', err);
    res.status(500).json({ error: { message: 'Failed to generate signed URL' } });
  }
};

exports.updateTender = async (req, res) => {
  try {
    const { title } = req.body;
    
    const tender = await prisma.tenderDocument.findUnique({ where: { id: req.params.id } });
    if (!tender || tender.userId !== req.user.id) {
      return res.status(404).json({ error: { message: 'Tender not found' } });
    }

    const updated = await prisma.tenderDocument.update({
      where: { id: req.params.id },
      data: { title }
    });

    res.json({ data: updated });
  } catch (err) {
    console.error('Error updating tender:', err);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

exports.retryTender = async (req, res) => {
  try {
    const tender = await prisma.tenderDocument.findUnique({ where: { id: req.params.id } });
    if (!tender || tender.userId !== req.user.id) {
      return res.status(404).json({ error: { message: 'Tender not found' } });
    }

    if (tender.status !== 'FAILED') {
      return res.status(400).json({ error: { message: 'Only failed tenders can be retried' } });
    }

    // Delete existing chunks just to be sure (service does this too, but better safe)
    await prisma.$executeRaw`DELETE FROM "TenderChunk" WHERE "tenderId" = ${tender.id}`;

    const updated = await prisma.tenderDocument.update({
      where: { id: req.params.id },
      data: { status: 'PROCESSING', processingError: null }
    });

    // Fire and forget
    processTender(tender.id).catch(console.error);

    res.json({ data: updated });
  } catch (err) {
    console.error('Error retrying tender:', err);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

exports.deleteTender = async (req, res) => {
  try {
    const tender = await prisma.tenderDocument.findUnique({ where: { id: req.params.id } });
    if (!tender || tender.userId !== req.user.id) {
      return res.status(404).json({ error: { message: 'Tender not found' } });
    }

    // Delete chunks (handled by cascade on schema, but we can do it explicitly or let Prisma handle it)
    await prisma.$executeRaw`DELETE FROM "TenderChunk" WHERE "tenderId" = ${tender.id}`;

    // Delete file
    try {
      await deleteFile('documents', [tender.fileUrl]);
    } catch (e) {
      console.error(`[Orphaned File] Failed to delete file ${tender.fileUrl} in Supabase:`, e);
    }

    // Delete record
    await prisma.tenderDocument.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting tender:', err);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

const ragService = require('../services/ragService');

exports.askTenderQuestion = async (req, res) => {
  try {
    const tenderId = req.params.id;
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: { message: 'Question is required' } });
    }

    // 1. Verify ownership and status
    const tender = await prisma.tenderDocument.findUnique({ where: { id: tenderId } });
    if (!tender || tender.userId !== req.user.id) {
      return res.status(404).json({ error: { message: 'Tender not found' } });
    }

    if (tender.status !== 'READY') {
      return res.status(400).json({ error: { message: 'Tender is not ready for querying' } });
    }

    // 2. Query RAG service with isolated context
    const result = await ragService.answerQuestion({
      question,
      source: 'tender',
      tenderId: tender.id,
      userId: req.user.id
    });

    res.json({ data: result });
  } catch (err) {
    console.error('Error in askTenderQuestion:', err);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

const complianceService = require('../services/complianceService');

exports.startComplianceAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const { categories } = req.body;

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ error: { message: 'At least one policy category must be specified' } });
    }

    const tender = await prisma.tenderDocument.findUnique({
      where: { id }
    });

    if (!tender || tender.userId !== req.user.id) {
      return res.status(404).json({ error: { message: 'Tender not found' } });
    }

    if (tender.status !== 'READY') {
      return res.status(400).json({ error: { message: 'Tender is not ready' } });
    }

    const analysis = await prisma.complianceAnalysis.create({
      data: {
        tenderId: tender.id,
        status: 'PENDING',
        policyScopeCategories: JSON.stringify(categories)
      }
    });

    complianceService.runComplianceAnalysis(analysis.id, tender.id, req.user.id, categories)
      .catch(err => console.error('[Compliance] Async execution error:', err));

    res.json({ data: { id: analysis.id, status: analysis.status } });
  } catch (err) {
    console.error('Error starting compliance analysis:', err);
    res.status(500).json({ error: { message: 'Failed to start analysis' } });
  }
};

exports.listComplianceAnalyses = async (req, res) => {
  try {
    const { id } = req.params;

    const tender = await prisma.tenderDocument.findUnique({
      where: { id }
    });

    if (!tender || tender.userId !== req.user.id) {
      return res.status(404).json({ error: { message: 'Tender not found' } });
    }

    const analyses = await prisma.complianceAnalysis.findMany({
      where: { tenderId: tender.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ data: analyses });
  } catch (err) {
    console.error('Error listing compliance analyses:', err);
    res.status(500).json({ error: { message: 'Failed to list analyses' } });
  }
};

