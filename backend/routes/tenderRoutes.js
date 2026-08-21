const express = require('express');
const multer = require('multer');
const tenderController = require('../controllers/tenderController');
const verifyToken = require('../middleware/auth');

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


router.post('/', verifyToken, upload.single('file'), tenderController.createTender);
router.get('/', verifyToken, tenderController.listTenders);
router.get('/:id', verifyToken, tenderController.getTender);
router.get('/:id/file', verifyToken, tenderController.getTenderFileUrl);
router.patch('/:id', verifyToken, tenderController.updateTender);
router.patch('/:id/retry', verifyToken, tenderController.retryTender);
router.delete('/:id', verifyToken, tenderController.deleteTender);
router.post('/:id/ask', verifyToken, tenderController.askTenderQuestion);
router.post('/:id/compliance-analysis', verifyToken, tenderController.startComplianceAnalysis);
router.get('/:id/compliance-analysis', verifyToken, tenderController.listComplianceAnalyses);

module.exports = router;
