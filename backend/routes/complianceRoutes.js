const express = require('express');
const complianceController = require('../controllers/complianceController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, complianceController.listAllComplianceAnalyses);
router.get('/:id', verifyToken, complianceController.getComplianceAnalysis);
router.delete('/:id', verifyToken, complianceController.deleteComplianceAnalysis);

module.exports = router;
