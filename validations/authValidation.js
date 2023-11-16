const Joi = require("joi");
const { password } = require("./customValidation");

const register = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  params: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const updatePassword = {
  body: Joi.object().keys({
    currentPassword: Joi.string().required().custom(password),
    newPassword: Joi.string().required().custom(password),
  }),
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
};
