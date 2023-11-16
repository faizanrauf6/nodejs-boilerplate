const Joi = require("joi");

const updateProfile = {
  body: Joi.object().keys({
    name: Joi.string(),
    name: Joi.string(),
  }),
};

const updateRole = {
  body: Joi.object().keys({
    role: Joi.string(),
    name: Joi.string(),
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
  updateProfile,
  updateRole,
  getAllUsers,
};
