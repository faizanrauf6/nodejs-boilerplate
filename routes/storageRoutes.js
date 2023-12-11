const express = require('express');
const multer = require('multer');
const router = express.Router();
const { authenticated } = require('../middlewares/auth');
const { storageController } = require('../controllers');

// configure multer to use the S3 bucket for file storage
const upload = multer({
  storage: multer.memoryStorage(),
});

router.post(
  '/upload-file-aws',
  authenticated,
  upload.single('file'),
  storageController.uploadFileAWS
);
router.post(
  '/upload-file-gcs',
  authenticated,
  upload.single('file'),
  storageController.uploadFileGCS
);
router.post(
  '/upload-file-uri-gcs',
  authenticated,
  upload.single('file'),
  storageController.uploadFileUriGCS
);

module.exports = router;
