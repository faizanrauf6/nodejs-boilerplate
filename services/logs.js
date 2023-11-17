const path = require("path");
const { Log } = require("../models");
const consoleLogger = require("../config/logging");

const logSuccess = async (
  err = null,
  userId = null,
  req = null,
  res = null,
  fileName = "",
  functionName = ""
) => {
  try {
    // Extract relevant information for the success log
    functionName = functionName || "Unknown Function";
    fileName = fileName || "Unknown File";
    const message = "Success"; // You can customize this message based on your use case

    // Use async/await to save the success log
    const success = await Log.create({
      userId,
      functionName,
      file: fileName,
      message,
      request: req,
      response: res,
    });

    consoleLogger.info("Success log added successfully", success);
  } catch (error) {
    consoleLogger.error("Error on saving success log: ", error);
  }
};

const logFailure = async (
  err,
  userId = null,
  req = null,
  res = null,
  fileName = "",
  functionName = ""
) => {
  try {
    const stack = err.stack.split("\n");
    const firstStackLine = stack[1];
    functionName = functionName || firstStackLine.match(/at (.*) /)[1];
    fileName =
      fileName || path.basename(firstStackLine.match(/\(([^)]+)\)/)[1]);
    const lineNumber = firstStackLine.match(/:(\d+):\d+/)[1];
    const message = err.message;

    // Use async/await to save the failure log
    const failure = await Log.create({
      userId,
      functionName,
      file: fileName,
      lineNo: lineNumber,
      message,
      request: req,
      response: res,
    });

    consoleLogger.info("Error log added successfully", failure);
  } catch (error) {
    consoleLogger.error("Error on saving failure log: ", error);
  }
};

module.exports = {
  logSuccess,
  logFailure,
};
