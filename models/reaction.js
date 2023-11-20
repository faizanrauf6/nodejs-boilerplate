const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const reactionsSchema = mongoose.Schema(
  {
    reaction: {
      type: String,
      required: true,
    },
    reactionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    messageOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
  },
  { timestamps: true }
);

// add plugin that converts mongoose to json
reactionsSchema.plugin(toJSON);

// add index for unique room and message
reactionsSchema.index({ roomId: 1, messageId: 1 }, { unique: true });
reactionsSchema.index({ reactionBy: 1 });

module.exports = mongoose.model("Reaction", reactionsSchema);
