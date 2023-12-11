const { Upload } = require("@aws-sdk/lib-storage");
const { s3Client } = require("../config/multer-aws");
const { Storage } = require("../models");
const config = require("../config/config");
const consoleLogger = require("../config/logging");

const uploadFileToAWS = async (file, fileName, userId) => {
  const Bucket = config.aws.bucketName;
  const Id = Date.now() + "-" + file.originalname;
  const Key = file.originalname;
  const Body = file.buffer;
  const target = { Bucket, Key, Body };

  const parallelUploads3 = new Upload({
    client: s3Client,
    queueSize: 4, // optional concurrency configuration
    partSize: 5242880, // optional size of each part e.g 5MB
    leavePartsOnError: false, // optional manually handle dropped parts
    params: target,
  });

  parallelUploads3.on("httpUploadProgress", (progress) => {
    consoleLogger.info(progress);
  });
  const uploaded = await parallelUploads3.done();
  if (uploaded) {
    const result = await Storage.create({
      userId,
      bucket: uploaded.Bucket,
      fileUrl: uploaded.Location,
      fileId: Id,
      fileName,
      fileSize: file.size,
      mimType: file.mimetype,
    });
    return result;
  }
};

module.exports = uploadFileToAWS;
