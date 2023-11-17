const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const logSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    functionName: {
      type: String,
      required: true,
    },
    file: {
      type: String,
      required: true,
    },
    lineNo: {
      type: Number,
      required: false,
    },
    message: {
      type: String,
      required: false,
    },
    request: {
      type: Object,
      required: false,
    },
    response: {
      type: Object,
      required: false,
    },
    loggingTime: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 60 * 60 * 1000), // Set the default value to the current time with UTC+5 offset
      // default: Date.now, // Set the default value to the current time
    },
  },
  { timestamps: true }
);

// add plugin that converts mongoose to json
logSchema.plugin(toJSON);

module.exports = mongoose.model("Log", logSchema);
