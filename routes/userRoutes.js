const express = require('express');
const router = express.Router();
const { authenticated, requiredRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const userValidation = require('../validations/userValidation');
const { userController } = require('../controllers');

router.get(
  '/user-existence',
  validate(userValidation.userExistence),
  userController.userExistence
);
router.get('/me', authenticated, userController.getUserProfile);
router.post(
  '/update-profile',
  validate(userValidation.updateProfile),
  authenticated,
  userController.updateProfile
);
router.get(
  '/get-all-users',
  validate(userValidation.getAllUsers),
  authenticated,
  requiredRole('admin'),
  userController.getAllUsers
);
router.post('/delete-account', authenticated, userController.deleteAccount);

module.exports = router;
