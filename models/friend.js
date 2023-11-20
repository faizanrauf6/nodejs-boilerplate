const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const friendSchema = mongoose.Schema(
  {
    friendRequestBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    friendAcceptBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
    isAddedViaApp: {
      type: Boolean,
      default: false,
    },
    isAddedViaLink: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);

// add plugin that converts mongoose to json
friendSchema.plugin(toJSON);

// Index for the friendRequestBy, friendAcceptBy, and status field, as it's commonly used in queries
friendSchema.index({ friendRequestBy: 1, friendAcceptBy: 1, status: 1 });
friendSchema.index({ status: 1 });

module.exports = mongoose.model("Friend", friendSchema);
