const generateUniqueFileName = (file) => {
  const originalName = file.originalname;
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15); // Generates a random string

  // Combine the original filename, timestamp, and random string to create a unique name
  return `${originalName}-${timestamp}-${randomString}`;
};

module.exports = {
  generateUniqueFileName,
};
