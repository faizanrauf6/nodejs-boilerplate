const catchAsyncErrors = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandling");
const { Storage } = require("../models");
const { sendResponse } = require("../helpers/response");
const { logSuccess, logFailure } = require("../services/logs");

// ! Upload file with storage server /api/v1/storage/uploadFile
const uploadFile = catchAsyncErrors(async (req, res) => {
  /* 
    #swagger.tags = ['Storage']
    #swagger.summary = 'Upload File.'
    #swagger.consumes = ['application/json']
    #swagger.produces = ['application/json']
    #swagger.security = [{
      BearerAuth: []
    }]
  */
  const file = req.file;
  const userId = req.user._id;
  let request = {
    url: req.originalUrl,
    method: req.originalMethod,
    body: req.body,
  };

  try {
    // ! check if file exists
    if (!file) {
      return next(new ErrorHandler("Please upload a file", 400));
    }

    // ! Create a new file record in the database
    const newFile = new Storage({
      userId,
      bucket: config.aws.bucketName,
      fileUrl: config.aws.awsUrl + file.key,
      fileId: file.key,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    });

    // Save the file information to the database
    const result = await newFile.save();

    // log data in the try block (success case)
    await logSuccess(
      null,
      req.user._id,
      request,
      result,
      __filename,
      "uploadFile"
    );
    // send response
    return sendResponse(res, 1, 200, "File uploaded successfully", result);
  } catch (error) {
    await logFailure(error, req.user._id, request);
    return next(new ErrorHandler(error.message, 500));
  }
});

module.exports = {
  uploadFile,
};
