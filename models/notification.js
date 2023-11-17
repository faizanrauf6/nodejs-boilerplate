const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const notificationSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isChatNotification: {
      type: Boolean,
      default: false,
    },
    notificationTitle: {
      type: String,
      required: true,
    },
    notificationBody: {
      type: String,
      required: true,
    },
    notificationDataArray: {
      type: Object,
      required: true,
    },
    notificationSlug: {
      type: String,
      default: null,
    },
    notificationType: {
      type: String,
      default: null,
    },
    isViewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// add plugin that converts mongoose to json
notificationSchema.plugin(toJSON);

// Index for the userId field, as it's commonly used in queries
notificationSchema.index({ userId: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
