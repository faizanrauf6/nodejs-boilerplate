const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const roomSchema = mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    roomTitle: {
      type: String,
      default: null,
    },
    roomDescription: {
      type: String,
      default: null,
    },
    roomPic: {
      type: String,
      default: `https://ui-avatars.com/api/?name=Default&background=random`,
    },
    roomLeftBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// add plugin that converts mongoose to json
roomSchema.plugin(toJSON);

// Index for the createdBy, members field, as it's commonly used in queries
roomSchema.index({ createdBy: 1 });
roomSchema.index({ members: 1 });

module.exports = mongoose.model("Room", roomSchema);
