const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const dotenv = require("dotenv");
const { generateUniqueFileName } = require("../helpers/generateUniqueFileName");
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = (folder = "general") => {
  const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder, // Specify the folder in your Cloudinary account
      public_id: (req, file) => generateUniqueFileName(file), // Rename the file on upload
      // format: async (req, file) => "png", // supports promises as well
    },
  });

  return multer({
    storage: cloudinaryStorage,
  });
};

module.exports = storage;
