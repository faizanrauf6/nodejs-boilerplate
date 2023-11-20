const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendResponse } = require('../helpers/response');
const helperMessages = require('../helpers/englishMessages');

const authenticated = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return sendResponse(res, 0, 401, helperMessages.jwtTokenInvalid);
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const foundUser = await User.findById(decoded.id).select(
      '-password -previousPasswords -__v'
    );
    if (!foundUser) {
      return sendResponse(res, 0, 404, helperMessages.userNotFound);
    }
    // if (token !== foundUser.jwtToken) {
    //   return sendResponse(res, 0, 401, helperMessages.jwtTokenExpired);
    // }
    req.user = foundUser;
    next();
  } catch (error) {
    return sendResponse(res, 0, 401, helperMessages.jwtAuthIssue);
  }
};

const requiredRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return sendResponse(res, 0, 401, helperMessages.notAuthorized);
    }
    next();
  };
};

module.exports = { authenticated, requiredRole };
