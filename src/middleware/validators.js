const { body, validationResult } = require("express-validator");
const { USER_ROLES } = require("../models/User");

const validateRegisterAdmin = [
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
  body("role")
    .equals("ADMIN")
    .withMessage("Role must be ADMIN for register-admin route"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

const validateLogin = [
  body("email").isEmail().withMessage("Invalid email address").normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

module.exports = { validateRegisterAdmin, validateLogin };
