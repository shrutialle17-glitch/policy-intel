const prisma = require('../prismaClient');

exports.getStats = async (req, res) => {
  try {
    const [
      totalPolicies,
      policyStatuses,
      totalPolicyChunks,
      recentPolicies,
      totalUsers,
    ] = await Promise.all([
      prisma.policy.count(),
      prisma.policy.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.policyChunk.count(),
      prisma.policy.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { uploadedBy: { select: { name: true, email: true } } },
      }),
      prisma.user.count(),
    ]);

    const statusCounts = {
      DRAFT: 0,
      PROCESSING: 0,
      READY: 0,
      FAILED: 0,
      ARCHIVED: 0
    };

    policyStatuses.forEach(ps => {
      statusCounts[ps.status] = ps._count.status;
    });

    res.json({
      data: {
        policies: {
          total: totalPolicies,
          statusCounts,
          recent: recentPolicies,
        },
        aiProcessing: {
          successful: statusCounts.READY, // policies that went through automation and succeeded
          failed: statusCounts.FAILED,
        },
        chunks: {
          totalPolicyChunks
        },
        users: {
          total: totalUsers
        }
      }
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

exports.getProcessingJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = req.query.filter || 'ALL'; // ALL or FAILED

    const where = {};
    if (filter === 'FAILED') {
      where.status = 'FAILED';
    }

    const [policies, total] = await Promise.all([
      prisma.policy.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { chunks: true }
          }
        }
      }),
      prisma.policy.count({ where })
    ]);

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
    console.error('Error fetching processing jobs:', err);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      }),
      prisma.user.count()
    ]);

    res.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error listing users:', err);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};
