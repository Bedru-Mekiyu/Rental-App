// src/middleware/validators.js (ESM) - Complete input validation

import { body, param, query, validationResult } from "express-validator"
import crypto from "crypto"

/**
 * Validation error handler middleware
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 400,
      message: "Validation error",
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    })
  }
  next()
}

/**
 * Generic MongoId param validator
 */
export const validateObjectIdParam = (paramName, label = "ID") => [
  param(paramName).isMongoId().withMessage(`Invalid ${label}`),
  handleValidationErrors,
]

/**
 * Generate idempotency key from request
 */
export const generateIdempotencyKey = (req, res, next) => {
  const rawKey = req.headers["idempotency-key"]
  if (Array.isArray(rawKey)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid idempotency key",
    })
  }

  if (rawKey && (typeof rawKey !== "string" || rawKey.length > 128)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid idempotency key",
    })
  }

  const idempotencyKey = rawKey || crypto.randomUUID()
  req.idempotencyKey = idempotencyKey
  next()
}

// ========== AUTH VALIDATORS ==========

export const validateRegisterAdmin = [
  body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
  body("password").isString().isLength({ min: 12, max: 128 }).withMessage("Invalid password length"),
  body("name").isString().trim().isLength({ min: 2, max: 100 }).withMessage("Invalid name"),
  body("phone")
    .optional()
    .isString()
    .trim()
    .matches(/^[+\d][\d\s().-]{6,20}$/)
    .withMessage("Invalid phone number"),
  handleValidationErrors,
]

export const validateLogin = [
  body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
  body("password").isString().isLength({ min: 8, max: 128 }).withMessage("Invalid password"),
  handleValidationErrors,
]

export const validateVerifyTwoFactor = [
  body("tempSessionId").isString().isLength({ min: 10 }).withMessage("Invalid 2FA session"),
  body("code").isString().trim().isLength({ min: 6, max: 10 }).withMessage("Invalid 2FA code"),
  body("method")
    .isIn(["TOTP", "EMAIL", "BACKUP"])
    .withMessage("Invalid 2FA method"),
  handleValidationErrors,
]

export const validateRefreshToken = [
  body("refreshToken").isString().isLength({ min: 20, max: 512 }).withMessage("Invalid refresh token"),
  handleValidationErrors,
]

// ========== API KEY VALIDATORS ==========

const isIpOrCidr = (value) => /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(value)

export const validateCreateApiKey = [
  body("name").optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage("Invalid name"),
  body("allowedIps")
    .optional()
    .isArray()
    .withMessage("allowedIps must be an array"),
  body("allowedIps.*")
    .optional()
    .custom((value) => isIpOrCidr(value))
    .withMessage("allowedIps entries must be valid IP/CIDR"),
  body("allowedEndpoints")
    .optional()
    .isArray()
    .withMessage("allowedEndpoints must be an array"),
  body("allowedEndpoints.*")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("allowedEndpoints entries must be valid strings"),
  body("expiresAt").optional().isISO8601().withMessage("expiresAt must be a valid ISO date"),
  body("scopes")
    .optional()
    .isArray()
    .withMessage("scopes must be an array"),
  body("scopes.*")
    .optional()
    .isIn(["read", "write", "delete"])
    .withMessage("Invalid scope"),
  body("permissions")
    .optional()
    .isArray()
    .withMessage("permissions must be an array"),
  body("permissions.*.resource")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Invalid permission resource"),
  body("permissions.*.actions")
    .optional()
    .isArray()
    .withMessage("permission actions must be an array"),
  body("permissions.*.actions.*")
    .optional()
    .isIn(["read", "write", "delete"])
    .withMessage("Invalid permission action"),
  body("rateLimit.requests")
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage("rateLimit.requests must be 1-10000"),
  body("rateLimit.period")
    .optional()
    .isIn(["hour", "day", "month"])
    .withMessage("Invalid rateLimit.period"),
  handleValidationErrors,
]

export const validateListApiKeys = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be >= 1").toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100").toInt(),
  query("userId").optional().isMongoId().withMessage("Invalid userId"),
  handleValidationErrors,
]

export const validateRevokeApiKey = [
  param("id").isMongoId().withMessage("Invalid API key ID"),
  handleValidationErrors,
]

// ========== LEASE VALIDATORS ==========

export const validateCreateLease = [
  body("unitId").isMongoId().withMessage("Invalid unit ID"),
  body("tenantId").isMongoId().withMessage("Invalid tenant ID"),
  body("startDate")
    .isISO8601()
    .withMessage("Start date must be valid ISO date")
    .custom((value) => new Date(value) > new Date())
    .withMessage("Start date must be in future"),
  body("endDate")
    .isISO8601()
    .withMessage("End date must be valid ISO date")
    .custom((value, { req }) => new Date(value) > new Date(req.body.startDate))
    .withMessage("End date must be after start date"),
  body("monthlyRentEtb").isInt({ min: 1 }).withMessage("Monthly rent must be positive integer"),
  body("securityDepositEtb").optional().isInt({ min: 0 }).withMessage("Security deposit must be non-negative"),
  handleValidationErrors,
]

export const validateUpdateLease = [
  param("id").isMongoId().withMessage("Invalid lease ID"),
  body("status").optional().isIn(["ACTIVE", "TERMINATED", "PENDING"]).withMessage("Invalid status"),
  body("monthlyRentEtb").optional().isInt({ min: 1 }).withMessage("Monthly rent must be positive"),
  handleValidationErrors,
]

// ========== PROPERTY VALIDATORS ==========

export const validateCreateProperty = [
  body("name").isString().trim().isLength({ min: 2, max: 200 }).withMessage("Invalid name"),
  body("address").isString().trim().isLength({ min: 5, max: 300 }).withMessage("Invalid address"),
  body("city").optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage("Invalid city"),
  body("state").optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage("Invalid state"),
  body("country").optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage("Invalid country"),
  body("managerId").optional().isMongoId().withMessage("Invalid manager ID"),
  handleValidationErrors,
]

export const validateUpdateProperty = [
  param("id").isMongoId().withMessage("Invalid property ID"),
  body("name").optional().isString().trim().isLength({ min: 2, max: 200 }).withMessage("Invalid name"),
  body("address").optional().isString().trim().isLength({ min: 5, max: 300 }).withMessage("Invalid address"),
  body("city").optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage("Invalid city"),
  body("state").optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage("Invalid state"),
  body("country").optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage("Invalid country"),
  body("managerId").optional().isMongoId().withMessage("Invalid manager ID"),
  handleValidationErrors,
]

// ========== PAYMENT VALIDATORS ==========

export const validateCreatePayment = [
  body("leaseId").isMongoId().withMessage("Invalid lease ID"),
  body("amountEtb").isFloat({ min: 0.01 }).withMessage("Amount must be positive number"),
  body("paymentMethod")
    .isIn(["BANK_TRANSFER", "MOBILE_MONEY", "CASH", "CHECK", "CHAPA", "TELEBIRR", "BELL"])
    .withMessage("Invalid payment method"),
  body("externalTransactionId")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 128 })
    .withMessage("Transaction ID cannot be empty if provided"),
  handleValidationErrors,
]

export const validateVerifyPayment = [
  param("id").isMongoId().withMessage("Invalid payment ID"),
  body("verificationNotes").optional().isString(),
  handleValidationErrors,
]

export const validateRejectPayment = [
  param("id").isMongoId().withMessage("Invalid payment ID"),
  body("rejectionReason")
    .isString()
    .trim()
    .isLength({ min: 5 })
    .withMessage("Rejection reason must be at least 5 characters"),
  handleValidationErrors,
]

export const validateUploadPaymentProof = [
  param("paymentId").isMongoId().withMessage("Invalid payment ID"),
  body("proofType")
    .isIn(["BANK_RECEIPT", "MOBILE_TRANSFER", "CHECK_PHOTO", "OTHER"])
    .withMessage("Invalid proof type"),
  handleValidationErrors,
]

export const validateVerifyPaymentWithProof = [
  param("paymentId").isMongoId().withMessage("Invalid payment ID"),
  body("verificationComments").optional().isString().trim().isLength({ max: 2000 }).withMessage("Invalid comments"),
  handleValidationErrors,
]

// ========== RECONCILIATION VALIDATORS ==========

export const validateReconciliationId = validateObjectIdParam("reconciliationId", "reconciliation ID")
export const validateLeaseIdParam = validateObjectIdParam("leaseId", "lease ID")

export const validateResolveDiscrepancy = [
  param("reconciliationId").isMongoId().withMessage("Invalid reconciliation ID"),
  param("discrepancyIndex").isInt({ min: 0 }).withMessage("Invalid discrepancy index"),
  body("resolution").isString().trim().isLength({ min: 2, max: 2000 }).withMessage("Invalid resolution"),
  handleValidationErrors,
]

// ========== INVOICE VALIDATORS ==========

export const validateCreateInvoice = validateLeaseIdParam

export const validateCreatePaymentSchedule = [
  param("leaseId").isMongoId().withMessage("Invalid lease ID"),
  body("billingCycle")
    .optional()
    .isIn(["MONTHLY", "QUARTERLY", "ANNUALLY"])
    .withMessage("Invalid billing cycle"),
  body("billingDay").optional().isInt({ min: 1, max: 31 }).withMessage("Invalid billing day"),
  handleValidationErrors,
]

export const validateListInvoices = [
  query("leaseId").optional().isMongoId().withMessage("Invalid lease ID"),
  query("status")
    .optional()
    .isIn(["DRAFT", "ISSUED", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"])
    .withMessage("Invalid status"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be >= 1").toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100").toInt(),
  handleValidationErrors,
]

// ========== BULK UPLOAD VALIDATORS ==========

export const validateBulkUploadId = validateObjectIdParam("uploadId", "upload ID")

// ========== NOTIFICATION VALIDATORS ==========

export const validateNotificationPreferences = [
  body("paymentAlerts").optional().isBoolean().withMessage("paymentAlerts must be boolean"),
  body("leaseAlerts").optional().isBoolean().withMessage("leaseAlerts must be boolean"),
  body("maintenanceAlerts").optional().isBoolean().withMessage("maintenanceAlerts must be boolean"),
  handleValidationErrors,
]

export const validateJobId = validateObjectIdParam("jobId", "job ID")
export const validateEmailLogId = validateObjectIdParam("emailLogId", "email log ID")

// ========== ANALYTICS VALIDATORS ==========

export const validateAnalyticsTrendQuery = [
  query("months").optional().isInt({ min: 1, max: 24 }).withMessage("Months must be 1-24").toInt(),
  handleValidationErrors,
]

export const validateAnalyticsPropertyQuery = [
  query("propertyId").optional().isMongoId().withMessage("Invalid property ID"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be >= 1").toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100").toInt(),
  handleValidationErrors,
]

// ========== DISPUTE VALIDATORS ==========

export const validateCreateDispute = [
  param("paymentId").isMongoId().withMessage("Invalid payment ID"),
  body("reason")
    .isIn(["DUPLICATE_CHARGE", "INCORRECT_AMOUNT", "UNAUTHORIZED", "TECHNICAL_ERROR", "OTHER"])
    .withMessage("Invalid dispute reason"),
  body("description").isString().trim().isLength({ min: 10, max: 1000 }).withMessage("Invalid description"),
  body("evidence").optional().isArray().withMessage("Evidence must be an array"),
  handleValidationErrors,
]

export const validateResolveDispute = [
  param("disputeId").isMongoId().withMessage("Invalid dispute ID"),
  body("resolutionAction")
    .isIn(["REFUND", "CREDIT", "REVERSAL", "NO_ACTION"])
    .withMessage("Invalid resolution action"),
  body("refundAmount").optional().isFloat({ min: 0 }).withMessage("Invalid refund amount"),
  body("resolutionNotes").optional().isString().trim().isLength({ max: 2000 }).withMessage("Invalid notes"),
  handleValidationErrors,
]

// ========== UNIT VALIDATORS ==========

export const validateCreateUnit = [
  body("propertyId").isMongoId().withMessage("Invalid property ID"),
  body("unitNumber").isString().trim().isLength({ min: 1, max: 10 }).withMessage("Unit number must be 1-10 characters"),
  body("bedrooms").isInt({ min: 0, max: 10 }).withMessage("Bedrooms must be 0-10"),
  body("bathrooms").isInt({ min: 0, max: 10 }).withMessage("Bathrooms must be 0-10"),
  body("squareMeters").isFloat({ min: 1 }).withMessage("Square meters must be positive"),
  body("monthlyRentEtb").isInt({ min: 1 }).withMessage("Rent must be positive integer"),
  handleValidationErrors,
]

export const validateUpdateUnit = [
  param("id").isMongoId().withMessage("Invalid unit ID"),
  body("status").optional().isIn(["VACANT", "OCCUPIED", "MAINTENANCE", "UNAVAILABLE"]).withMessage("Invalid status"),
  body("monthlyRentEtb").optional().isInt({ min: 1 }).withMessage("Rent must be positive"),
  body("floor").optional().isInt({ min: 0, max: 200 }).withMessage("Invalid floor"),
  body("bedrooms").optional().isInt({ min: 0, max: 10 }).withMessage("Invalid bedrooms"),
  body("bathrooms").optional().isInt({ min: 0, max: 10 }).withMessage("Invalid bathrooms"),
  body("squareMeters").optional().isFloat({ min: 1 }).withMessage("Invalid square meters"),
  handleValidationErrors,
]

export const validateListUnits = [
  query("propertyId").optional().isMongoId().withMessage("Invalid property ID"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be >= 1").toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100").toInt(),
  handleValidationErrors,
]

// ========== MAINTENANCE VALIDATORS ==========

export const validateCreateMaintenance = [
  body("unitId").isMongoId().withMessage("Invalid unit ID"),
  body("description")
    .isString()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be 10-500 characters"),
  body("priority").isIn(["LOW", "MEDIUM", "HIGH", "URGENT"]).withMessage("Invalid priority"),
  body("estimatedCostEtb").optional().isFloat({ min: 0 }).withMessage("Cost must be non-negative"),
  handleValidationErrors,
]

export const validateUpdateMaintenanceStatus = [
  param("id").isMongoId().withMessage("Invalid maintenance ID"),
  body("status").isIn(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).withMessage("Invalid status"),
  body("completionNotes").optional().isString().trim().isLength({ max: 2000 }).withMessage("Invalid notes"),
  handleValidationErrors,
]

// ========== MOBILE PAYMENT VALIDATORS ==========

export const validateInitiateMobileMoneyPayment = [
  body("leaseId").isMongoId().withMessage("Invalid lease ID"),
  body("paymentMethod").isIn(["CHAPA", "TELEBIRR", "BELL"]).withMessage("Invalid payment method"),
  body("amount").isFloat({ min: 0.01 }).withMessage("Invalid amount"),
  handleValidationErrors,
]

// ========== SMS NOTIFICATION VALIDATORS ==========

export const validateSendPaymentReminder = [
  body("leaseId").isMongoId().withMessage("Invalid lease ID"),
  body("channel").optional().isIn(["SMS", "WHATSAPP"]).withMessage("Invalid channel"),
  handleValidationErrors,
]

export const validateSendBulkReminders = [
  body("reminderType")
    .isIn(["LEASE_EXPIRING", "PAYMENT_OVERDUE"])
    .withMessage("Invalid reminder type"),
  body("channel").optional().isIn(["SMS", "WHATSAPP"]).withMessage("Invalid channel"),
  handleValidationErrors,
]

export const validateSmsLogQuery = [
  query("status").optional().isIn(["SENT", "FAILED", "PENDING"]).withMessage("Invalid status"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be >= 1").toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100").toInt(),
  handleValidationErrors,
]

// ========== PAGINATION VALIDATORS ==========

export const validatePagination = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be >= 1").toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100").toInt(),
  handleValidationErrors,
]

// ========== QUERY SANITIZATION ==========

export const sanitizeQuery = [
  query("status").optional().isString().withMessage("Invalid status").trim().escape(),
  query("search").optional().isString().withMessage("Invalid search term").trim().escape(),
  handleValidationErrors,
]
