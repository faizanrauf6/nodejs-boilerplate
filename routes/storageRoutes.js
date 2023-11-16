const express = require("express");
const router = express.Router();
const { authenticated } = require("../middlewares/auth");
const { storageController } = require("../controllers");

router.post("/upload-file", authenticated, storageController.uploadFile);

module.exports = router;
