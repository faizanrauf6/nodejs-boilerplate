const FCM = require("fcm-node");
const consoleLogger = require("./logging");
require("dotenv").config({ path: "../.env" });
// require("dotenv").config({ path: "/home/ubuntu/HSW-Backend/.env" });

// Initialize FCM with your server key
const serverKey = process.env.FCM_SERVER_KEY; // Replace with your FCM server key
const fcm = new FCM(serverKey);

// Helper function to send FCM notifications
const sendNotification = async (data) => {
  const {
    token,
    title,
    body,
    sound = "default",
    androidChannelId = "default_channel",
    dataArray,
  } = data;

  try {
    const message = {
      to: token,
      notification: {
        title,
        body,
        sound,
        android_channel_id: androidChannelId,
      },
      data: {
        data: dataArray,
      },
      apns: {
        payload: {
          aps: {
            content_available: 1,
          },
        },
      },
    };

    const response = await fcm.send(message);
    consoleLogger.info(response);
    return response;
  } catch (error) {
    consoleLogger.error(error);
    return error;
  }
};

module.exports = { sendNotification };
