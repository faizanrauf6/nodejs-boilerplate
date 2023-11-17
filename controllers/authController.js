const { generatePassword, comparePassword } = require("../config/bcrypt");
const { generateToken, validateToken } = require("../config/jwt");
const catchAsyncErrors = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandling");
const { User } = require("../models");
const { sendResponse } = require("../helpers/response");
const { logSuccess, logFailure } = require("../services/logs");

// ! Register User /api/v1/auth/register
const registerUser = catchAsyncErrors(async (req, res, next) => {
  /* 
      #swagger.tags = ['Auth']
      #swagger.summary = 'Register User.'
      #swagger.consumes = ['application/json']
      #swagger.produces = ['application/json']
  */
  const { name, email, password, role = "user" } = req.body;
  const request = {
    url: req.originalUrl,
    method: req.originalMethod,
    body: req.body,
  };
  try {
    // ! Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ErrorHandler("User already exists", 400));
    }
    // ! Hashing password
    const hashPassword = await generatePassword(password);
    // ! Generate avatar
    const avatar = `https://ui-avatars.com/api/?name=${name.replace(
      " ",
      "+"
    )}&background=random`;
    // ! Create user
    await User.create({
      name,
      email,
      avatar,
      role,
      password: hashPassword,
    });

    // log data in the try block (success case)
    await logSuccess(null, null, request, null, __filename, "registerUser");

    // send response
    return sendResponse(res, 1, 201, "User created successfully");
  } catch (error) {
    await logFailure(error, null, request);
    return next(new ErrorHandler(error.message, 500));
  }
});

// ! Login User /api/v1/auth/login
const loginUser = catchAsyncErrors(async (req, res, next) => {
  /* 
    #swagger.tags = ['Auth']
    #swagger.summary = 'Login User.'
    #swagger.consumes = ['application/json']
    #swagger.produces = ['application/json']
    #swagger.security = [{
      BearerAuth: []
    }]
  */
  const { email, password } = req.body;
  const request = {
    url: req.originalUrl,
    method: req.originalMethod,
    body: req.body,
  };
  try {
    // ! Check if user exists
    const userExists = await User.findOne({ email }).select("+password");
    if (!userExists) {
      return next(new ErrorHandler("Invalid credentials", 401));
    }
    // ! Compare password
    const isPasswordMatched = await comparePassword(
      password,
      userExists.password
    );

    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid credentials", 401));
    }

    // ! Generate token
    const token = await generateToken(userExists._id);

    // ! Create a sanitized user object without the password
    const sanitizedUser = {
      _id: userExists._id,
      email: userExists.email,
      role: userExists.role,
      avatar: userExists.avatar,
    };

    // log data in the try block (success case)
    await logSuccess(
      null,
      null,
      request,
      sanitizedUser,
      __filename,
      "loginUser"
    );

    // send response
    return sendResponse(
      res,
      1,
      200,
      "User logged in successfully",
      sanitizedUser,
      token
    );
  } catch (error) {
    await logFailure(error, null, request);
    return next(new ErrorHandler(error.message, 500));
  }
});

// ! Logout User /api/v1/auth/logout
const logoutUser = catchAsyncErrors(async (req, res, next) => {
  /* 
    #swagger.tags = ['Auth']
    #swagger.summary = 'Logout User.'
    #swagger.consumes = ['application/json']
    #swagger.produces = ['application/json']
    #swagger.security = [{
    BearerAuth: []
  }]
  */
  const request = {
    url: req.originalUrl,
    method: req.originalMethod,
    body: req.body,
  };
  try {
    // log data in the try block (success case)
    await logSuccess(null, null, request, null, __filename, "logoutUser");
    // send response
    return sendResponse(res, 1, 200, "User logged out successfully");
  } catch (error) {
    await logFailure(error, null, request);
    return next(new ErrorHandler(error.message, 500));
  }
});

// ! Refresh Token /api/v1/auth/refresh-token
const refreshToken = catchAsyncErrors(async (req, res, next) => {
  /* 
    #swagger.tags = ['Auth']
    #swagger.summary = 'Refresh Token.'
    #swagger.consumes = ['application/json']
    #swagger.produces = ['application/json']
    #swagger.security = [{
    BearerAuth: []
  }]
  */
  const request = {
    url: req.originalUrl,
    method: req.originalMethod,
    body: req.body,
  };
  try {
    const newToken = await generateToken(req.user._id);
    // log data in the try block (success case)
    await logSuccess(
      null,
      req.user._id,
      request,
      newToken,
      __filename,
      "refreshToken"
    );
    // send response
    return sendResponse(
      res,
      1,
      200,
      "Token refreshed successfully",
      null,
      newToken
    );
  } catch (error) {
    await logFailure(error, req.user._id, request);
    return next(new ErrorHandler("You are not authorized", 401));
  }
});

// ! Forgot Password /api/v1/auth/forgot-password
const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  /* 
    #swagger.tags = ['Auth']
    #swagger.summary = 'Forgot Password.'
    #swagger.consumes = ['application/json']
    #swagger.produces = ['application/json']
  */
  const { email } = req.body;
  const request = {
    url: req.originalUrl,
    method: req.originalMethod,
    body: req.body,
  };
  try {
    // ! Check if user exists
    const userExists = await User.findOne({ email });
    if (!userExists) {
      return next(new ErrorHandler("User not found", 404));
    }
    // ! Generate token
    const token = await generateToken(userExists._id, "10m");

    // ! Create reset password url
    const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${token}`;

    // ! Add reset password token to user
    userExists.resetPasswordToken = token;
    await userExists.save();

    // log data in the try block (success case)
    await logSuccess(
      null,
      userExists._id,
      request,
      userExists,
      __filename,
      "forgotPassword"
    );
    // send response
    return sendResponse(
      res,
      1,
      200,
      "Reset password url sent successfully",
      resetUrl,
      token
    );
  } catch (error) {
    await logFailure(error, null, request);
    return next(new ErrorHandler(error.message, 500));
  }
});

// ! Reset Password /api/v1/auth/reset-password/:token
const resetPassword = catchAsyncErrors(async (req, res, next) => {
  /* 
    #swagger.tags = ['Auth']
    #swagger.summary = 'Reset Password.'
    #swagger.consumes = ['application/json']
    #swagger.produces = ['application/json']
    #swagger.parameters['token'] = {
      in: 'path',
      description: 'The token of the user',
      required: true,
      type: 'string',
    }
    #swagger.parameters['password'] = {
      in: 'body',
      description: 'The password of the user',
      required: true,
      type: 'string',
    }
  */

  const { password } = req.body;
  const token = req.params.token;
  let request = {
    url: req.originalUrl,
    method: req.originalMethod,
    body: req.body,
  };
  try {
    // ! Check user by token
    const decoded = await validateToken(token);
    if (!decoded) {
      return next(new ErrorHandler("Invalid token", 400));
    }
    // ! Check if user exists
    const userExists = await User.findById(decoded.id).select("+password");
    if (!userExists) {
      return next(new ErrorHandler("User not found", 404));
    }

    // ! Check if token is valid
    if (token !== userExists.resetPasswordToken) {
      return next(new ErrorHandler("Invalid token", 400));
    }
    // ! Hashing password
    const hashPassword = await generatePassword(password);
    // ! Update password
    userExists.password = hashPassword;
    // ! Invalidate token after reset password
    userExists.resetPasswordToken = undefined;
    await userExists.save();

    // log data in the try block (success case)
    await logSuccess(
      null,
      userExists._id,
      request,
      userExists,
      __filename,
      "resetPassword"
    );
    // send response
    return sendResponse(res, 1, 200, "Password reset successfully");
  } catch (error) {
    await logFailure(error, null, request);
    return next(new ErrorHandler(error.message, 500));
  }
});

// ! Update Password /api/v1/auth/update-password
const updatePassword = catchAsyncErrors(async (req, res, next) => {
  /* 
    #swagger.tags = ['Auth']
    #swagger.summary = 'Update Password.'
    #swagger.security = [{
    BearerAuth: []
  }]
  */
  const { currentPassword, newPassword } = req.body;
  let request = {
    url: req.originalUrl,
    method: req.originalMethod,
    body: req.body,
  };
  try {
    let userExists = await User.findById(req.user._id).select("+password");
    // ! Compare password
    const isPasswordMatched = await comparePassword(
      currentPassword,
      userExists.password
    );

    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid password", 401));
    }
    // ! Hashing password
    const hashPassword = await generatePassword(newPassword);
    // ! Update password
    userExists.password = hashPassword;
    await userExists.save();

    // log data in the try block (success case)
    await logSuccess(
      null,
      userExists._id,
      request,
      userExists,
      __filename,
      "updatePassword"
    );
    // send response
    return sendResponse(res, 1, 200, "Password updated successfully");
  } catch (error) {
    await logFailure(error, req.user._id, request);
    return next(new ErrorHandler(error.message, 500));
  }
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  forgotPassword,
  resetPassword,
  updatePassword,
};
