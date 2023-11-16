const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 8,
      select: false, // ! this will not show the password in the response
      private: true, // used by the toJSON plugin
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },
    avatar: {
      type: String,
      default: `https://ui-avatars.com/api/?name=Default&background=random`,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "banned"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

/**
 * @typedef User
 */
module.exports = mongoose.model("User", userSchema);
