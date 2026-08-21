const express = require('express');
const cors = require('cors');
require('dotenv').config();
const prisma = require('./prismaClient');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', message: 'Backend is running with Supabase setup!', database: 'connected' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'error', message: 'Backend is running, but database connection failed', error: error.message });
  }
});

// Public stats route
app.get('/api/public/stats', async (req, res) => {
  try {
    const [activePolicies, indexedChunks, complianceChecks] = await Promise.all([
      prisma.policy.count({ where: { status: 'READY' } }),
      prisma.policyChunk.count(),
      prisma.complianceAnalysis.count(),
    ]);
    res.json({ data: { activePolicies, indexedChunks, complianceChecks } });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch stats' });
  }
});

// Mount modular routes
const authRoutes = require('./routes/auth.routes');
const policyRoutes = require('./routes/policyRoutes');
const tenderRoutes = require('./routes/tenderRoutes');
const policyAiRoutes = require('./routes/policyAiRoutes');
const complianceRoutes = require('./routes/complianceRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/policy-ai', policyAiRoutes);
app.use('/api/compliance-analysis', complianceRoutes);
app.use('/api/admin', adminRoutes);

// Debug RAG route (ADMIN only)
const verifyToken = require('./middleware/auth');
const authorizeRole = require('./middleware/role');
const { generateEmbedding } = require('./services/embeddingService');
const { retrieveRelevantChunks } = require('./services/vectorRetrievalService');

app.post('/api/debug/rag-test', verifyToken, authorizeRole('ADMIN'), async (req, res) => {
  try {
    const { question, source = 'policy', tenderId } = req.body;
    const queryEmbedding = await generateEmbedding(question);
    const chunks = await retrieveRelevantChunks({ 
      queryEmbedding, 
      source, 
      tenderId, 
      userId: req.user.id,
      topK: 8,
      minSimilarity: 0.7
    });
    res.json({ data: { chunks } });
  } catch (err) {
    console.error('Debug RAG Test Error:', err);
    res.status(500).json({ error: { message: err.message } });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
