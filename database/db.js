const mongoose = require("mongoose");
const consoleLogger = require("../config/logging");
const config = require("../config/config");

// ! starting the DataBase
const dataBaseConnect = function () {
  mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
    consoleLogger.info("Connected to MongoDB Atlas");
  });
};

module.exports = dataBaseConnect;
