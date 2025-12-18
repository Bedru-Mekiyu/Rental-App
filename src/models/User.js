const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const USER_ROLES = ["ADMIN", "PM", "GM", "FS", "TENANT"];

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "invalid email format"],
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[0-9]{7,15}$/, "invalid phone number"],
    },
    passwordHash: {
      type: String,
      required: true,
      min: 8,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
    },
    mfaEnabled: {
      type: Boolean,
      default: false,
    },
    mfaMethod: {
      type: String,
      enum: ["SMS", "EMAIL", "NONE"],
      default: "NONE",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

// helper for password check
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);
module.exports.USER_ROLES = USER_ROLES;
