const { body } = require("express-validator");

const validateRegisterAdmin = [
  body("fullName")
    .notEmpty().withMessage("Full name is required")
    .isLength({ min: 2 }).withMessage("Full name must be at least 2 characters"),
  body("email")
    .isEmail().withMessage("Invalid email address")
    .normalizeEmail(),
];

module.exports = { validateRegisterAdmin, validateLogin };