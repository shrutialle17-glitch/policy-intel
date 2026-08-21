const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/auth');
const authorizeRole = require('../middleware/role');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', verifyToken, authController.getMe);
router.get('/admin-only', verifyToken, authorizeRole('ADMIN'), (req, res) => {
  res.json({ status: 'success', message: 'You have accessed an ADMIN-only route.' });
});

module.exports = router;
