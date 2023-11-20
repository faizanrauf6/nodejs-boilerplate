const Joi = require('joi');

const userExistence = {
  body: Joi.object().keys({
    username: Joi.string(),
  }),
};

const updateProfile = {
  body: Joi.object().keys({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string(),
    phoneNo: Joi.string(),
    address: Joi.string(),
    latitude: Joi.string(),
    longitude: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    zipCode: Joi.number(),
    country: Joi.string(),
    avatar: Joi.string(),
    interests: Joi.array(),
    spokenLang: Joi.array(),
  }),
};

const getAllUsers = {
  query: Joi.object().keys({
    email: Joi.string(),
    page: Joi.number().integer(),
    limit: Joi.number().integer(),
  }),
};

module.exports = {
  userExistence,
  updateProfile,
  getAllUsers,
};
