const { answerQuestion } = require('../services/ragService');
const prisma = require('../prismaClient');

exports.askPolicyQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: { message: 'Question is required', code: 'BAD_REQUEST' } });
    }

    // Call Phase 5 RAG Service exactly as-is
    const response = await answerQuestion({
      question,
      source: 'policy',
      userId: req.user.id
    });

    // Save chat history to the database
    const savedChat = await prisma.chatHistory.create({
      data: {
        userId: req.user.id,
        question: question,
        answer: response.answer,
        citations: response.citations,
        grounded: response.grounded || false,
      }
    });

    res.json({ data: { ...response, id: savedChat.id } });
  } catch (err) {
    console.error('Error in askPolicyQuestion:', err);
    res.status(500).json({ error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const history = await prisma.chatHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to recent 50
    });
    res.json({ data: history });
  } catch (err) {
    console.error('Error fetching chat history:', err);
    res.status(500).json({ error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
};

exports.deleteChatHistoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.chatHistory.deleteMany({
      where: { 
        id,
        userId: req.user.id // ensure user owns the item
      }
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting chat history item:', err);
    res.status(500).json({ error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
};

exports.clearChatHistory = async (req, res) => {
  try {
    await prisma.chatHistory.deleteMany({
      where: { userId: req.user.id }
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Error clearing chat history:', err);
    res.status(500).json({ error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } });
  }
};
