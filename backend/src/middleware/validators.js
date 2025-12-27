// src/middleware/validators.js (ESM)

import { body, validationResult } from "express-validator";
import { USER_ROLES } from "../models/User.js";

const handleValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  next();
};

// existing: register admin
export const validateRegisterAdmin = [
  body("fullName")
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2 })
    .withMessage("Full name must be at least 2 characters"),
  body("email").isEmail().withMessage("Invalid email address").normalizeEmail(),
  body("phone")
    .optional()
    .matches(/^\+?[0-9]{7,15}$/)
    .withMessage("invalid phone number"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters"),
  handleValidationResult,
];

// existing: login
export const validateLogin = [
  body("email").isEmail().withMessage("Invalid email address").normalizeEmail(),
  body("password").notEmpty().withMessage("password is required"),
  handleValidationResult,
];

// new: create user
export const validateCreateUser = [
  body("fullName")
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2 })
    .withMessage("Full name must be at least 2 characters"),
  body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
  body("phone")
    .optional()
    .matches(/^\+?[0-9]{7,15}$/)
    .withMessage("invalid phone number"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters"),
  body("role")
    .isIn(USER_ROLES)
    .withMessage("Invalid role"),
  handleValidationResult,
];

// new: update user
export const validateUpdateUser = [
  body("fullName")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Full name must be at least 2 characters"),
  body("phone")
    .optional()
    .matches(/^\+?[0-9]{7,15}$/)
    .withMessage("invalid phone number"),
  body("role")
    .optional()
    .isIn(USER_ROLES)
    .withMessage("Invalid role"),
  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Invalid status"),
  handleValidationResult,
];

// new: change password
export const validateChangePassword = [
  body("currentPassword")
    .notEmpty()
    .withMessage("currentPassword is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("newPassword must be at least 8 characters"),
  handleValidationResult,
];
