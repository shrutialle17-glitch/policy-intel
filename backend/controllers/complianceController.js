const prisma = require('../prismaClient');

exports.getComplianceAnalysis = async (req, res) => {
  try {
    const analysisId = req.params.id;

    const analysis = await prisma.complianceAnalysis.findUnique({
      where: { id: analysisId },
      include: { 
        tender: true,
        findings: {
          orderBy: { status: 'asc' } // Will order by COMPLIANT, MISSING, NEEDS_REVIEW (since enum is C, M, N) or string based. Wait, COMPLIANT, MISSING, NEEDS_REVIEW. M before N.
        }
      }
    });

    if (!analysis) {
      return res.status(404).json({ error: { message: 'Analysis not found' } });
    }

    if (analysis.tender.userId !== req.user.id) {
      return res.status(404).json({ error: { message: 'Analysis not found' } }); // Enforce ownership
    }

    // Remove nested tender object to avoid sending large object if not needed, just send tenderId
    const { tender, ...analysisData } = analysis;

    res.json({ data: analysisData });
  } catch (err) {
    console.error('Error fetching compliance analysis:', err);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

exports.listAllComplianceAnalyses = async (req, res) => {
  try {
    const analyses = await prisma.complianceAnalysis.findMany({
      where: { tender: { userId: req.user.id } },
      include: { 
        tender: { select: { title: true } },
        findings: { select: { status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ data: analyses });
  } catch (err) {
    console.error('Error listing compliance analyses:', err);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

exports.deleteComplianceAnalysis = async (req, res) => {
  try {
    const analysisId = req.params.id;
    
    // First, verify ownership
    const analysis = await prisma.complianceAnalysis.findUnique({
      where: { id: analysisId },
      include: { tender: true }
    });

    if (!analysis) {
      return res.status(404).json({ error: { message: 'Analysis not found' } });
    }

    if (analysis.tender.userId !== req.user.id) {
      return res.status(403).json({ error: { message: 'Forbidden' } });
    }

    // Delete associated findings first (Prisma might handle this if cascade is set, but let's be safe or just delete analysis if it cascades)
    // Looking at schema, normally we'd delete findings then analysis, but Prisma cascade delete is usually enabled. Let's explicitly delete findings first to be safe.
    await prisma.complianceFinding.deleteMany({
      where: { analysisId: analysisId }
    });

    await prisma.complianceAnalysis.delete({
      where: { id: analysisId }
    });

    res.json({ data: { success: true } });
  } catch (err) {
    console.error('Error deleting compliance analysis:', err);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};
