const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const interestSchema = mongoose.Schema(
  {
    languageCode: {
      type: String,
      required: true,
    },
    interest: {
      type: String,
      required: true,
      index: true,
    },
    translatedInterest: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// add plugin that converts mongoose to json
interestSchema.plugin(toJSON);

// add index for unique interest
interestSchema.index({ interest: 1 });

module.exports = mongoose.model("Interest", interestSchema);
