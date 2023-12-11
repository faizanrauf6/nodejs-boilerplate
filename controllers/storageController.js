const catchAsyncErrors = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandling");
const { User } = require("../models");
const { sendResponse } = require("../helpers/response");
const { logSuccess, logFailure } = require("../services/logs");
const helperMessages = require("../helpers/englishMessages");
const uploadFileToGCS = require("../services/fileUploadGCS");
const uploadFileToAWS = require("../services/fileUploadAWS");

// ! Upload file with storage on AWS S3 server /api/v1/storage/uploadFileAWS
const uploadFileAWS = catchAsyncErrors(async (req, res, next) => {
  /* 
    #swagger.tags = ['Storage']
    #swagger.summary = 'Upload File AWS.'
    #swagger.consumes = ['application/json']
    #swagger.produces = ['application/json']
    #swagger.security = [{
      BearerAuth: []
    }]
  */
  const { _id } = req.user;
  const file = req.file;
  let request = {
    url: req.originalUrl,
    method: req.originalMethod,
    body: req.body,
  };

  try {
    const user = await User.exists({ _id });
    if (!user) {
      return sendResponse(res, 0, 404, helperMessages.userNotFound);
    }
    if (!file) {
      return next(new ErrorHandler(helperMessages.noFile, 400));
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const result = await uploadFileToAWS(file, fileName, _id);

    await logSuccess(null, _id, request, result, __filename, "uploadFileAWS");
    return sendResponse(res, 1, 200, helperMessages.fileUploaded, result);
  } catch (error) {
    await logFailure(error, _id, request);
    return sendResponse(res, 1, 500, error.message);
  }
});

// ! Upload file with storage on GCS server /api/v1/storage/uploadFileGCS
const uploadFileGCS = catchAsyncErrors(async (req, res, next) => {
  /* 
    #swagger.tags = ['Storage']
    #swagger.summary = 'Upload File GCS.'
    #swagger.consumes = ['application/json']
    #swagger.produces = ['application/json']
    #swagger.security = [{
      BearerAuth: []
    }]
  */
  const { _id } = req.user;
  const file = req.file;
  let request = {
    url: req.originalUrl,
    method: req.originalMethod,
    body: req.body,
  };

  try {
    const user = await User.exists({ _id });
    if (!user) {
      return sendResponse(res, 0, 404, helperMessages.userNotFound);
    }
    if (!file) {
      return next(new ErrorHandler(helperMessages.noFile, 400));
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const result = await uploadFileToGCS(file, fileName, _id);

    await logSuccess(null, _id, request, result, __filename, "uploadFileGCS");
    return sendResponse(res, 1, 200, helperMessages.fileUploaded, result);
  } catch (error) {
    await logFailure(error, _id, request);
    return sendResponse(res, 1, 500, error.message);
  }
});

// ! Upload file Uri with storage on GCS server /api/v1/storage/uploadFileUriGCS
const uploadFileUriGCS = catchAsyncErrors(async (req, res, next) => {
  /* 
    #swagger.tags = ['Storage']
    #swagger.summary = 'Upload File Uri GCS.'
    #swagger.consumes = ['application/json']
    #swagger.produces = ['application/json']
    #swagger.security = [{
      BearerAuth: []
    }]
  */
  const { _id } = req.user;
  const file = req.file;
  let request = {
    url: req.originalUrl,
    method: req.originalMethod,
    body: req.body,
  };

  try {
    const user = await User.exists({ _id });
    if (!user) {
      return sendResponse(res, 0, 404, helperMessages.userNotFound);
    }
    if (!file) {
      return next(new ErrorHandler(helperMessages.noFile, 400));
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const result = await uploadFileToGCS(
      file,
      fileName,
      _id,
      (generateSignedUrl = true)
    );

    await logSuccess(
      null,
      _id,
      request,
      result,
      __filename,
      "uploadFileUriGCS"
    );
    return sendResponse(res, 1, 200, helperMessages.fileUploaded, result);
  } catch (error) {
    await logFailure(error, _id, request);
    return sendResponse(res, 1, 500, error.message);
  }
});

module.exports = {
  uploadFileGCS,
  uploadFileUriGCS,
  uploadFileAWS,
};
