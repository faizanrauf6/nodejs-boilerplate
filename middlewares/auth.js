const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");
const { sendResponse } = require("../helpers/response");

const authenticated = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return sendResponse(res, 0, 401, "You are not authorized or token expired");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await UserModel.findById(decoded.id).select("-password -__v");
    next();
  } catch (error) {
    return sendResponse(res, 0, 401, "You are not authorized");
  }
};

const requiredRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return sendResponse(
        res,
        0,
        401,
        "You are not authorized to perform this action"
      );
    }
    next();
  };
};

module.exports = { authenticated, requiredRole };
