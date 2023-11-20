// User controller Response Messages
exports.notAuthorized = "You are not authorized to perform this action";
exports.userExists = "Username is already taken";
exports.userCreated = "User created successfully";
exports.userNotFound = "User not found";
exports.loggedIn = "User logged in successfully";
exports.invalidCred = "Invalid credentials";
exports.logout = "User logged out successfully";
exports.resetEmailSent = "Reset password url sent successfully";
exports.passwordReset = "Password reset successful";
exports.invalidOldPass = "Invalid old password";
exports.passwordChanged = "Password changed successfully";
exports.usernameRequired = "Username is required";
exports.usernameAvailable = "Username is available";
exports.userNotExists = "Username does not exists";
exports.fetchSingleUser = "User fetched successfully";
exports.addressExists = "User already has this address";
exports.userUpdated = "User updated successfully";
exports.fetchUsers = "Users fetched successfully";
exports.accountDeleted = "Account deleted successfully";

// Server Response Messages
exports.serverError = "Internal server error";
exports.userIdRequired = "Please send userId in request body";
exports.jwtTokenMissing = "JWT token is missing";
exports.jwtTokenInvalid = "JWT token is not valid or has expired";
exports.jwtAuthIssue = "JWT token verification error";
exports.jwtTokenExpired = "JWT token has been expired";
exports.jwtTokenIsValid = "JWT token is not expired yet, please use the same";
exports.refreshTokenGenerated = "JWT new token generated successfully";
exports.noAccessToken = "Access token is required";
exports.pinLocationSent = "Pin location sent successfully";
