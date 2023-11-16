const express = require("express");
const router = express.Router();
const { authenticated, requiredRole } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const userValidation = require("../validations/userValidation");
const { userController } = require("../controllers");

router.get("/me", authenticated, userController.getUserProfile);
router.post(
  "/update-profile",
  validate(userValidation.updateProfile),
  authenticated,
  userController.updateProfile
);
router.post(
  "/update-role",
  validate(userValidation.updateRole),
  authenticated,
  requiredRole("admin"),
  userController.updateRole
);

router.get(
  "/get-all-users",
  validate(userValidation.getAllUsers),
  authenticated,
  requiredRole("admin"),
  userController.getAllUsers
);

module.exports = router;
