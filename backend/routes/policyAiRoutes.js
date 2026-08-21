const express = require('express');
const router = express.Router();
const { askPolicyQuestion, getChatHistory, deleteChatHistoryItem, clearChatHistory } = require('../controllers/policyAiController');
const verifyToken = require('../middleware/auth');

router.post('/ask', verifyToken, askPolicyQuestion);
router.get('/history', verifyToken, getChatHistory);
router.delete('/history', verifyToken, clearChatHistory);
router.delete('/history/:id', verifyToken, deleteChatHistoryItem);

module.exports = router;
