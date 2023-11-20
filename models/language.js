const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const languageSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    languageCode: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// add plugin that converts mongoose to json
languageSchema.plugin(toJSON);

// add index for unique language code
languageSchema.index({ languageCode: 1 });

module.exports = mongoose.model("Language", languageSchema);
