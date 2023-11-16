const { sendResponse } = require("../helpers/response");
const ErrorHandler = require("../utils/errorHandling");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // MongoDB error
  if (err.name === "CastError") {
    const message = `Resource not found: ${req.path}`;
    err = new ErrorHandler(message, 400);
  }
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate field value: ${Object.keys(err.keyValue)[0]}`;
    err = new ErrorHandler(message, 400);
  }

  // Jsonwebtoken error
  if (err.name === "JsonWebTokenError") {
    const message = `Invalid token: ${err.message}`;
    err = new ErrorHandler(message, 401);
  }
  // JWT expired error
  if (err.name === "TokenExpiredError") {
    const message = `Token expired: ${err.message}`;
    err = new ErrorHandler(message, 401);
  }
  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = `Validation error: ${err.message}`;
    err = new ErrorHandler(message, 400);
  }

  // Send error response
  return sendResponse(res, 0, err.statusCode, err.message);
};
