const createGCSInstance = require('../config/gcsInstance');
const { Storage } = require('../models');

async function uploadFileToGCS(
  file,
  fileName,
  userId,
  generateSignedUrl = false
) {
  const gcsInstance = createGCSInstance();
  const { bucket, bucketName } = gcsInstance;

  const Id = Date.now() + '-' + file.originalname;
  const files = bucket.file(fileName);
  const stream = files.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  try {
    await new Promise((resolve, reject) => {
      stream.on('error', (err) => {
        console.log('Error during GCS file upload:', err);
        reject(err);
      });

      stream.on('finish', resolve);

      stream.end(file.buffer);
    });

    const cloudStoragePublicUrl = `https://storage.cloud.google.com/${bucketName}/${fileName}`;
    console.log(
      'File uploaded successfully. File URL: ',
      cloudStoragePublicUrl
    );

    const result = generateSignedUrl
      ? {
          signedUrl: await files.getSignedUrl({
            action: 'read',
            expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          }),
          fileUploaded: await Storage.create({
            userId,
            bucket: bucketName,
            fileUrl: `gs://${bucketName}/${fileName}`,
            fileId: Id,
            fileName,
            fileSize: file.size,
            mimeType: file.mimetype,
          }),
        }
      : {
          fileUploaded: await Storage.create({
            userId,
            bucket: bucketName,
            fileUrl: cloudStoragePublicUrl,
            fileId: Id,
            fileName,
            fileSize: file.size,
            mimeType: file.mimetype,
          }),
        };

    return result;
  } catch (error) {
    console.error('Error during GCS file upload:', error);
    throw error; // Propagate the error for higher-level handling
  }
}

module.exports = uploadFileToGCS;
