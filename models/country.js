const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const countriesSchema = mongoose.Schema(
  {
    languageCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
      index: true,
    },
    translatedCountry: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// add plugin that converts mongoose to json
countriesSchema.plugin(toJSON);

// add index for unique country
countriesSchema.index({ country: 1 });

module.exports = mongoose.model("Country", countriesSchema);
