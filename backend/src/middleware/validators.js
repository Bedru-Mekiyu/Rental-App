// src/middleware/validators.js (ESM)

import { body, validationResult } from "express-validator";
import { USER_ROLES } from "../models/User.js";

const handleValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
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
    .isIn(["ACTIVE", "SUSPENDED"])
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

export const validateCreateLease = [
  body("unitId").notEmpty().withMessage("unitId is required"),
  body("tenantId").notEmpty().withMessage("tenantId is required"),
  body("startDate").isISO8601().withMessage("startDate must be a valid date"),
  body("endDate").isISO8601().withMessage("endDate must be a valid date"),
  body("taxRate")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("taxRate must be >= 0"),
  handleValidationResult,
];

export const validateCreatePayment = [
  body("leaseId").notEmpty().withMessage("leaseId is required"),
  body("amountEtb")
    .isFloat({ gt: 0 })
    .withMessage("amountEtb must be > 0"),
  body("transactionDate")
    .isISO8601()
    .withMessage("transactionDate must be a valid date"),
  body("paymentMethod")
    .notEmpty()
    .withMessage("paymentMethod is required"),
  handleValidationResult,
];

export const validateMaintenanceRequest = [
  body("unitId").notEmpty().withMessage("unitId is required"),
  body("description")
    .isLength({ min: 5 })
    .withMessage("description must be at least 5 characters"),
  body("urgency")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("urgency must be low, medium, or high"),
  handleValidationResult,
];

export const validateRefreshToken = [
  body("refreshToken")
    .notEmpty()
    .withMessage("refreshToken is required"),
  handleValidationResult,
];
