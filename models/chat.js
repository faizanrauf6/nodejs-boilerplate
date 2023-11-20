const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const chatSchema = mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    message: {
      type: String,
      default: null,
    },
    translatedMessage: {
      type: String,
      default: null,
    },
    messageType: {
      type: String,
      default: "text",
      enum: ["text", "image", "video", "audio", "location", "document"],
    },
    isSenderRead: {
      type: Boolean,
      default: true,
    },
    isReceiverRead: {
      type: Boolean,
      default: false,
    },
    receiverReadAt: {
      type: Date,
      default: null,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    socketId: { type: String },
    messageDeletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
      },
    ],
    repliesCount: {
      type: Number,
      default: 0,
    },
    repliesBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// add plugin that converts mongoose to json
chatSchema.plugin(toJSON);

// Index for the roomId field, as it's commonly used in queries
chatSchema.index({ roomId: 1 });

module.exports = mongoose.model("Chat", chatSchema);
