const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyToken = require('../middleware/auth');
const authorizeRole = require('../middleware/role');

router.use(verifyToken);
router.use(authorizeRole('ADMIN')); // Server-side admin verification

router.get('/stats', adminController.getStats);
router.get('/processing-jobs', adminController.getProcessingJobs);
router.get('/users', adminController.listUsers);

module.exports = router;
