const express = require('express');
const multer = require('multer');
const policyController = require('../controllers/policyController');
const verifyToken = require('../middleware/auth');
const authorizeRole = require('../middleware/role');

const router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

// ANY routes
router.get('/', verifyToken, policyController.listPolicies);
router.get('/:id', verifyToken, policyController.getPolicy);
router.get('/:id/file', verifyToken, policyController.getPolicyFileUrl);

// ADMIN routes
router.post('/', verifyToken, authorizeRole('ADMIN'), upload.single('file'), policyController.createPolicy);
router.patch('/:id/reprocess', verifyToken, authorizeRole('ADMIN'), policyController.reprocessPolicy);
router.patch('/:id', verifyToken, authorizeRole('ADMIN'), policyController.updatePolicyMetadata);
router.patch('/:id/status', verifyToken, authorizeRole('ADMIN'), policyController.updatePolicyStatus);
router.delete('/:id', verifyToken, authorizeRole('ADMIN'), policyController.deletePolicy);

module.exports = router;
