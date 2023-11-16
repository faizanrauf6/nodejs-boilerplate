const jwt = require("jsonwebtoken");
const config = require("./config");

const generateToken = (id, expire) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: expire || config.jwt.accessExpirationDays,
  });
};

const validateToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

module.exports = { generateToken, validateToken };
