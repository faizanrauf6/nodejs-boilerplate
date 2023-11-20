const { Storage } = require('@google-cloud/storage');
const config = require('./config');

function createGCSInstance() {
  const GCS_CREDENTIALS = JSON.parse(config.gcs.gcsCredentials);
  const projectId = config.gcs.gcsProjectId; // Replace with your project ID
  const bucketName = config.gcs.gcsBucketName; // Replace with your bucket

  const storage = new Storage({
    credentials: GCS_CREDENTIALS,
    projectId,
  });

  const bucket = storage.bucket(bucketName);

  return {
    bucket,
    bucketName,
  };
}

module.exports = createGCSInstance;
