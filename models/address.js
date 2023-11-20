const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const addressSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      type: String,
      required: false,
      default: null,
    },
    latitude: {
      type: String,
      required: false,
      default: null,
    },
    longitude: {
      type: String,
      required: false,
      default: null,
    },
    city: {
      type: String,
      required: false,
      default: null,
      index: true,
    },
    state: {
      type: String,
      required: false,
      default: null,
    },
    country: {
      type: String,
      required: false,
      default: null,
    },
    zipCode: {
      type: String,
      required: false,
      default: null,
    },
  },
  { timestamps: true }
);

// add plugin that converts mongoose to json
addressSchema.plugin(toJSON);

// Index for the city field, as it's commonly used in queries
addressSchema.index({ city: 1 });

module.exports = mongoose.model("Address", addressSchema);
