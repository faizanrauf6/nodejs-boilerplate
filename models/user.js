const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      default: 'user',
      enum: ['user', 'admin'],
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    firstName: {
      type: String,
      required: false,
      default: null,
    },
    lastName: {
      type: String,
      required: false,
      default: null,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 8,
      select: false,
      private: true,
    },
    phoneNo: {
      type: String,
      trim: true,
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    previousPasswords: [{ type: String }],
    gender: {
      type: String,
      default: 'male',
      enum: ['male', 'female', 'other'],
    },
    language: {
      type: String,
      required: false,
      default: null,
    },
    spokenLangs: [{ type: String }],
    interests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interest',
      },
    ],
    nationality: {
      type: String,
      trim: true,
      default: null,
    },
    dob: {
      type: Date,
      required: false,
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      required: false,
      default: null,
    },
    availability: {
      type: Boolean,
      default: false,
    },
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    jwtToken: {
      type: String,
      default: null,
    },
    fcmToken: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: 'active',
      enum: ['active', 'banned'],
      index: true,
    },
    avatar: {
      type: String,
      default: `https://ui-avatars.com/api/?name=Default&background=random`,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual property for the full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

// add index for unique email, status, interests, friends, and username field, as it's commonly used in queries
userSchema.index({ username: 1 });
userSchema.index({ status: 1 });
userSchema.index({ email: 1 });
userSchema.index({ interests: 1 });
userSchema.index({ friends: 1 });

/**
 * @typedef User
 */
module.exports = mongoose.model('User', userSchema);
