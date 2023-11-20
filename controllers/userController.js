const catchAsyncErrors = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../utils/errorHandling');
const { User, Address } = require('../models');
const { sendResponse } = require('../helpers/response');
const { logSuccess, logFailure } = require('../services/logs');
const helperMessages = require('../helpers/englishMessages');
const consoleLogger = require('../config/logging');

// ! User Existence /api/v1/user/user-existence
const userExistence = catchAsyncErrors(async (req, res, next) => {
  /* 
      #swagger.tags = ['User']
      #swagger.summary = 'User Existence'
      #swagger.consumes = ['application/json']
      #swagger.produces = ['application/json']
    */
  const { username } = req.body;
  const lowercasedUsername = username.toLowerCase(); // Convert username to lowercase
  let request = {
    url: req.originalUrl,
    method: req.originalMethod,
    body: req.body,
  };

  try {
    const userExists = await User.exists({
      username: lowercasedUsername,
      isDisabled: false,
    });
    const user = userExists ? 1 : 0;
    if (user) {
      return next(new ErrorHandler(helperMessages.userExists, 400));
    }
    // log data in the try block (success case)
    await logSuccess(null, null, request, user, __filename, 'userExistence');
    // send response
    return sendResponse(res, 1, 200, helperMessages.usernameAvailable);
  } catch (error) {
    await logFailure(error, req.user._id, request);
    return sendResponse(res, 1, 500, error.message);
  }
});

// ! Get User Profile /api/v1/user/profile
const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  /* 
      #swagger.tags = ['User']
      #swagger.summary = 'Get User Profile.'
      #swagger.consumes = ['application/json']
      #swagger.produces = ['application/json']
      #swagger.security = [{
      BearerAuth: []
    }]
    */
  const { _id } = req.user;
  let request = {
    url: req.originalUrl,
    method: req.originalMethod,
    body: req.body,
  };
  try {
    const user = await User.findById(_id)
      .select('-password -previousPasswords')
      .populate({
        path: 'interests',
        model: 'Interest',
        select: 'interest',
      })
      .lean();
    // log data in the try block (success case)
    await logSuccess(
      null,
      _id,
      request,
      req.user,
      __filename,
      'getUserProfile'
    );
    // send response
    return sendResponse(res, 1, 200, helperMessages.fetchSingleUser, user);
  } catch (error) {
    await logFailure(error, _id, request);
    return sendResponse(res, 1, 500, error.message);
  }
});

// ! Update Profile /api/v1/user/update-profile
const updateProfile = catchAsyncErrors(async (req, res, next) => {
  /* 
      #swagger.tags = ['User']
      #swagger.summary = 'Update Profile.'
      #swagger.consumes = ['application/json']
      #swagger.produces = ['application/json']
      #swagger.security = [{
      BearerAuth: []
    }]
    */
  const {
    firstName,
    lastName,
    email,
    phoneNo,
    address,
    latitude,
    longitude,
    city,
    state,
    zipCode,
    country,
    avatar,
    interests,
    spokenLang,
  } = req.body;
  const { _id } = req.user;
  let userDetails = {};
  let request = {
    url: req.originalUrl,
    method: req.originalMethod,
    body: req.body,
  };
  try {
    let userExists = await User.findById(_id);
    // ! Check if user exists
    if (!userExists) {
      return next(new ErrorHandler('User not found', 404));
    }

    // ! Check if user has an address already
    const userAddressExists = await Address.findOne({
      userId: _id,
      $or: [{ address }, { latitude, longitude }],
    });

    if (userAddressExists) {
      consoleLogger.info(helperMessages.addressExists);
    } else {
      // ! Saving user address in database
      await Address.create({
        userId: _id,
        address,
        latitude,
        longitude,
        state,
        city,
        country,
        zipCode,
      });
      consoleLogger.info('Address has been created');
    }
    // add spoken languages
    if (!spokenLang || spokenLang.length === 0) {
      consoleLogger.info('No spoken languages found');
    } else {
      const previousSpokenLangs = userExists.spokenLangs || [];
      const newSpokenLang = spokenLang.filter(
        (lang) => !previousSpokenLangs.includes(lang)
      );
      userDetails.spokenLangs = [...previousSpokenLangs, ...newSpokenLang];
    }
    // add interests
    if (!interests || interests.length === 0) {
      consoleLogger.info('No interests found');
    } else {
      const previousInterests = userExists.interests || [];
      const newInterest = interests.filter(
        (int) => !previousInterests.includes(int)
      );
      userDetails.interests = [...previousInterests, ...newInterest];
    }

    // ! Update user
    if (avatar) {
      userDetails.avatar = avatar;
    }
    if (email) {
      userDetails.email = email;
    }
    userDetails.firstName = firstName;
    userDetails.lastName = lastName;
    userDetails.phoneNo = phoneNo;

    // saving new users details in database
    const profileSetup = await User.findByIdAndUpdate(
      { _id },
      { $set: userDetails },
      { new: true }
    )
      .select('-password -previousPasswords')
      .populate({
        path: 'interests',
        model: 'Interest',
        select: 'interest',
      });

    // log data in the try block (success case)
    await logSuccess(
      null,
      userExists._id,
      request,
      profileSetup,
      __filename,
      'updateProfile'
    );
    // send response
    return sendResponse(res, 1, 200, helperMessages.userUpdated, profileSetup);
  } catch (error) {
    await logFailure(error, _id, request);
    return sendResponse(res, 1, 500, error.message);
  }
});

// ! Get All Users /api/v1/user/all-users
const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  /*
      #swagger.tags = ['User']
      #swagger.summary = 'Get Users by email with Pagination.'
      #swagger.consumes = ['application/json']
      #swagger.produces = ['application/json']
      #swagger.security = [{
        BearerAuth: []
      }]
      #swagger.parameters['email'] = {
        in: 'query',
        description: 'The email of the user to search for',
        required: false,
        type: 'string',
      }
      #swagger.parameters['page'] = {
        in: 'query',
        description: 'The page number for pagination',
        required: false,
        type: 'integer',
      }
      #swagger.parameters['limit'] = {
        in: 'query',
        description: 'The limit of users per page',
        required: false,
        type: 'integer',
      }
     */
  const { email, page, limit } = req.query;
  const { _id } = req.user;
  let request = {
    url: req.originalUrl,
    method: req.originalMethod,
    body: req.body,
  };
  try {
    // Define default values for page and limit
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10; // Adjust this limit to your preference.
    // Calculate the skip value for pagination
    const skip = (pageNum - 1) * limitNum;

    // Define a filter object to filter users by email (if provided)
    const filter = {};
    if (email) {
      filter.email = email;
    }

    // Query the database using Mongoose to fetch users based on the filter and apply pagination.
    const users = await User.find(filter)
      .skip(skip)
      .limit(limitNum)
      .select('-password -previousPasswords')
      .populate({
        path: 'interests',
        model: 'Interest',
        select: 'interest',
      });

    // Count the total number of users matching the filter for pagination information.
    const count = await User.countDocuments(filter);
    const totalPages = Math.ceil(count / limitNum);

    let pagination = {
      page: pageNum,
      totalPages,
      totalUsers: count,
    };

    // log data in the try block (success case)
    await logSuccess(null, _id, request, users, __filename, 'getAllUsers');

    // send response
    return sendResponse(
      res,
      1,
      200,
      users.length > 0
        ? helperMessages.fetchUsers
        : helperMessages.userNotFound,
      users,
      pagination
    );
  } catch (error) {
    await logFailure(error, _id, request);
    return sendResponse(res, 1, 500, error.message);
  }
});

// ! Delete Account /api/v1/user/delete-account
const deleteAccount = catchAsyncErrors(async (req, res, next) => {
  /* 
      #swagger.tags = ['User']
      #swagger.summary = 'Delete Account.'
      #swagger.consumes = ['application/json']
      #swagger.produces = ['application/json']
      #swagger.security = [{
      BearerAuth: []
    }]
    */
  const { _id } = req.user;
  let request = {
    url: req.originalUrl,
    method: req.originalMethod,
    body: req.body,
  };
  try {
    const user = await User.findByIdAndUpdate(_id, { isDisabled: true });
    // log data in the try block (success case)
    await logSuccess(null, _id, request, user, __filename, 'deleteAccount');
    // send response
    return sendResponse(res, 1, 200, helperMessages.accountDeleted);
  } catch (error) {
    await logFailure(error, _id, request);
    return sendResponse(res, 1, 500, error.message);
  }
});

module.exports = {
  userExistence,
  getUserProfile,
  updateProfile,
  getAllUsers,
  deleteAccount,
};
