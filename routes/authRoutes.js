const express = require("express");
const router = express.Router();
const { authenticated } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const authValidation = require("../validations/authValidation");
const {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require("../controllers/authController");

router.post("/register", validate(authValidation.register), registerUser);
router.post("/login", validate(authValidation.login), loginUser);
router.get("/logout", authenticated, logoutUser);

router.get("/refresh-token", authenticated, refreshToken);

router.post(
  "/forgot-password",
  validate(authValidation.forgotPassword),
  forgotPassword
);
router.post(
  "/reset-password/:token",
  validate(authValidation.resetPassword),
  resetPassword
);

router.post(
  "/update-password",
  validate(authValidation.updatePassword),
  authenticated,
  updatePassword
);

module.exports = router;
