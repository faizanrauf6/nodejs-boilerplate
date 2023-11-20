const { generatePassword, comparePassword } = require('../config/bcrypt');
const { generateToken, validateToken } = require('../config/jwt');
const catchAsyncErrors = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../utils/errorHandling');
const { User } = require('../models');
const { sendResponse } = require('../helpers/response');
const { logSuccess, logFailure } = require('../services/logs');
const helperMessages = require('../helpers/englishMessages');
const sendMail = require('../config/mailer');
const config = require('../config/config');

// ! Register User /api/v1/auth/register
const registerUser = catchAsyncErrors(async (req, res, next) => {
  /* 
      #swagger.tags = ['Auth']
      #swagger.summary = 'Register User.'
      #swagger.consumes = ['application/json']
      #swagger.produces = ['application/json']
  */
  const {
    username,
    email,
    password,
    language,
    fcmToken,
    role = 'user',
  } = req.body;
  const request = {
    url: req.originalUrl,
    method: req.originalMethod,
    body: req.body,
  };
  try {
    // ! Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ErrorHandler(helperMessages.userExists, 400));
    }
    // ! Hashing password
    const hashPassword = await generatePassword(password);
    // ! Generate avatar
    const avatar = `https://ui-avatars.com/api/?name=${username.replace(
      ' ',
      '+'
    )}&background=random`;

    // ! Saving hash password into previously stored password array
    let newPassword = [];
    newPassword.push(hashPassword);

    // ! Create user
    await User.create({
      username,
      email,
      avatar,
      role,
      language,
      fcmToken,
      password: hashPassword,
      previousPasswords: newPassword,
    });

    // log data in the try block (success case)
    await logSuccess(null, null, request, null, __filename, 'registerUser');

    // send response
    return sendResponse(res, 1, 201, helperMessages.userCreated);
  } catch (error) {
    await logFailure(error, null, request);
    return sendResponse(res, 1, 500, error.message);
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
  const { email, password, fcmToken } = req.body;
  const request = {
    url: req.originalUrl,
    method: req.originalMethod,
    body: req.body,
  };
  try {
    // ! Check if user exists
    const userExists = await User.findOne({ email, isDisabled: false }).select(
      '+password'
    );
    if (!userExists) {
      return next(new ErrorHandler(helperMessages.userNotFound, 404));
    }
    // ! Compare password
    const isPasswordMatched = await comparePassword(
      password,
      userExists.password
    );
    if (!isPasswordMatched) {
      return next(new ErrorHandler(helperMessages.invalidCred, 401));
    }

    let token;
    if (userExists.isLoggedIn) {
      // ! Generate token
      token = await generateToken(userExists._id);
      userExists.jwtToken = token;
    } else {
      // ! Generate token
      token = await generateToken(userExists._id);
      userExists.isLoggedIn = true;
      userExists.jwtToken = token;
    }

    // ! Updating user details
    userExists.fcmToken = fcmToken;
    await User.updateOne({ _id: userExists._id }, userExists);

    // ! Create a sanitized user object without the password
    const sanitizedUser = {
      _id: userExists._id,
      email: userExists.email,
      username: userExists.username,
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
      'loginUser'
    );

    // send response
    return sendResponse(
      res,
      1,
      200,
      helperMessages.loggedIn,
      sanitizedUser,
      token
    );
  } catch (error) {
    await logFailure(error, null, request);
    return sendResponse(res, 1, 500, error.message);
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
  const { _id } = req.user;
  const request = {
    url: req.originalUrl,
    method: req.originalMethod,
    body: req.body,
  };
  try {
    // Update user's FCM token and JWT token to null
    await User.findByIdAndUpdate(_id, {
      $set: {
        fcmToken: null,
        jwtToken: null,
      },
    });
    // log data in the try block (success case)
    await logSuccess(null, _id, request, null, __filename, 'logoutUser');
    // send response
    return sendResponse(res, 1, 200, helperMessages.logout);
  } catch (error) {
    await logFailure(error, _id, request);
    return sendResponse(res, 1, 500, error.message);
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
  const { _id } = req.user;
  const request = {
    url: req.originalUrl,
    method: req.originalMethod,
    body: req.body,
  };
  try {
    const newToken = await generateToken(_id);
    // log data in the try block (success case)
    await logSuccess(null, _id, request, newToken, __filename, 'refreshToken');
    // send response
    return sendResponse(
      res,
      1,
      200,
      helperMessages.refreshTokenGenerated,
      null,
      newToken
    );
  } catch (error) {
    await logFailure(error, _id, request);
    return sendResponse(res, 1, 401, helperMessages.notAuthorized);
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
      return next(new ErrorHandler('User not found', 404));
    }
    // ! Generate token
    const token = await generateToken(userExists._id, '10m');

    // ! Create reset password url
    const resetUrl = `http://localhost:${config.port}/password/reset/${token}`;

    // Send the password reset email
    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: 'Password Reset',
      text: `Click the following link to reset your password: ${resetUrl}`,
    };
    await sendMail(mailOptions);

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
      'forgotPassword'
    );
    // send response
    return sendResponse(res, 1, 200, helperMessages.resetEmailSent, resetUrl);
  } catch (error) {
    await logFailure(error, null, request);
    return sendResponse(res, 1, 500, error.message);
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
      return next(new ErrorHandler('Invalid token', 400));
    }
    // ! Check if user exists
    const userExists = await User.findById(decoded.id).select('+password');
    if (!userExists) {
      return next(new ErrorHandler('User not found', 404));
    }

    // ! Check if token is valid
    if (token !== userExists.resetPasswordToken) {
      return next(new ErrorHandler('Invalid token', 400));
    }
    // ! Hashing password
    const hashPassword = await generatePassword(password);
    // ! Update password
    userExists.password = hashPassword;
    // ! Invalidate token after reset password
    userExists.resetPasswordToken = null;
    await userExists.save();

    // log data in the try block (success case)
    await logSuccess(
      null,
      userExists._id,
      request,
      userExists,
      __filename,
      'resetPassword'
    );
    // send response
    return sendResponse(res, 1, 200, helperMessages.passwordReset);
  } catch (error) {
    await logFailure(error, null, request);
    return sendResponse(res, 1, 500, error.message);
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
  const { _id } = req.user;
  let request = {
    url: req.originalUrl,
    method: req.originalMethod,
    body: req.body,
  };
  try {
    let userExists = await User.findById(_id).select('+password');
    // ! Compare password
    const isPasswordMatched = await comparePassword(
      currentPassword,
      userExists.password
    );

    if (!isPasswordMatched) {
      return next(new ErrorHandler(helperMessages.invalidOldPass, 401));
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
      'updatePassword'
    );
    // send response
    return sendResponse(res, 1, 200, helperMessages.passwordChanged);
  } catch (error) {
    await logFailure(error, _id, request);
    return sendResponse(res, 1, 500, error.message);
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
