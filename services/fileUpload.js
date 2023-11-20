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

  return new Promise((resolve, reject) => {
    const Id = Date.now() + '-' + file.originalname;
    const files = bucket.file(fileName);
    const stream = files.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    stream.on('error', (err) => {
      console.log('Error during GCS file upload:', err);
      reject(err);
    });

    stream.on('finish', async () => {
      let result;
      if (generateSignedUrl) {
        // Get signed URL
        const [signedUrl] = await files.getSignedUrl({
          action: 'read',
          expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        });

        console.log('File signed URL', signedUrl);
        const cloudStoragePublicUrl = `gs://${bucketName}/${fileName}`;
        console.log(
          'File uploaded successfully. File URL: ',
          cloudStoragePublicUrl
        );
        const fileUploaded = await Storage.create({
          userId,
          bucket: bucketName,
          fileUrl: cloudStoragePublicUrl,
          fileId: Id,
          fileName,
          fileSize: file.size,
          mimType: file.mimetype,
        });
        result = {
          signedUrl,
          fileUploaded,
        };
      } else {
        const cloudStoragePublicUrl = `https://storage.cloud.google.com/${bucketName}/${fileName}`;
        console.log(
          'File uploaded successfully. File URL: ',
          cloudStoragePublicUrl
        );
        const fileUploaded = await Storage.create({
          userId,
          bucket: bucketName,
          fileUrl: cloudStoragePublicUrl,
          fileId: Id,
          fileName,
          fileSize: file.size,
          mimType: file.mimetype,
        });
        result = {
          fileUploaded,
        };
      }

      resolve(result);
    });

    stream.end(file.buffer);
  });
}

module.exports = uploadFileToGCS;
