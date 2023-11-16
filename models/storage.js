const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const storageSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bucket: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileId: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: null,
    },
    mimType: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
storageSchema.plugin(toJSON);

/**
 * @typedef Storage
 */
const Storage = mongoose.model("Storage", storageSchema);

module.exports = Storage;
