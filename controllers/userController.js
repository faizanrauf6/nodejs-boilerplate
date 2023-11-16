const catchAsyncErrors = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandling");
const { User } = require("../models");
const { sendResponse } = require("../helpers/response");

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

  // send response
  return sendResponse(res, 1, 200, "User profile fetched successfully", {
    user: req.user ? req.user : null,
  });
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
  const { name, email } = req.body;

  let userExists = await User.findById(req.user._id);
  // ! Check if user exists
  if (!userExists) {
    return next(new ErrorHandler("User not found", 404));
  }
  // ! Update user
  userExists.name = name;
  userExists.email = email;
  // ! If user change name then update avatar
  if (req.body.name) {
    userExists.avatar = `https://ui-avatars.com/api/?name=${name.replace(
      " ",
      "+"
    )}&background=random`;
  }
  await userExists.save();

  // send response
  return sendResponse(res, 1, 200, "Profile updated successfully");
});

// ! Update Role /api/v1/user/update-role
const updateRole = catchAsyncErrors(async (req, res, next) => {
  /* 
      #swagger.tags = ['User']
      #swagger.summary = 'Update Role.'
      #swagger.consumes = ['application/json']
      #swagger.produces = ['application/json']
      #swagger.security = [{
      BearerAuth: []
    }]
    */
  const { role, email } = req.body;

  if (req.user.email === email) {
    return next(new ErrorHandler("You can not change your role", 400));
  }
  let userExists = await User.findOne({ email });
  // ! Check if user exists
  if (!userExists) {
    return next(new ErrorHandler("User not found", 404));
  }
  // ! Update user
  userExists.role = role;
  await userExists.save();

  // send response
  return sendResponse(res, 1, 200, "Role updated successfully");
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
    .select("-__v");

  // Count the total number of users matching the filter for pagination information.
  const count = await User.countDocuments(filter);
  const totalPages = Math.ceil(count / limitNum);

  let pagination = {
    page: pageNum,
    totalPages,
    totalUsers: count,
  };

  // send response
  return sendResponse(
    res,
    1,
    200,
    users.length > 0 ? "Users fetched successfully" : "No user found",
    users,
    pagination
  );
});

module.exports = {
  updateProfile,
  updateRole,
  getAllUsers,
  getUserProfile,
};
