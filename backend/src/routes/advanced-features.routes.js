import { Router } from "express"
import multer from "multer"
import fs from "fs"
import os from "os"
import path from "path"
import { auth } from "../middleware/auth.js"
import { authOrApiKey } from "../middleware/apiKeyAuth.js"
import { createEndpointLimiter } from "../middleware/ddosProtection.js"
import {
  generateReconciliation,
  getReconciliationReport,
  resolveDiscrepancyEndpoint,
  listReconciliations,
} from "../controllers/reconciliationController.js"
import { handleStripeWebhook, handleChapaWebhook, handleFlutterwaveWebhook } from "../controllers/webhookController.js"
import { createInvoice, setupPaymentSchedule, listInvoices } from "../controllers/invoiceController.js"
import { createDispute, getDispute, resolveDispute, listDisputes } from "../controllers/disputeController.js"
import {
  validateCreateDispute,
  validateResolveDispute,
  validateCreateInvoice,
  validateCreatePaymentSchedule,
  validateListInvoices,
  validateLeaseIdParam,
  validateReconciliationId,
  validateResolveDiscrepancy,
  validateBulkUploadId,
  validatePagination,
  validateAnalyticsTrendQuery,
  validateAnalyticsPropertyQuery,
  validateObjectIdParam,
  validateInitiateMobileMoneyPayment,
  validateSendPaymentReminder,
  validateSendBulkReminders,
  validateSmsLogQuery,
} from "../middleware/validators.js"
import { uploadBulkPayments, getBulkUploadStatus } from "../controllers/bulkPaymentController.js"
import {
  getDashboardMetrics,
  getPaymentTrendChart,
  getPaymentMethodBreakdown,
  getPropertyPerformance,
} from "../controllers/analyticsController.js"
import { initiateMobileMoneyPayment, getMobileMoneyProviders } from "../controllers/mobilePaymentController.js"
import { sendPaymentReminderSMS, sendBulkReminders, getSMSLog } from "../controllers/notificationMessagingController.js"

const router = Router()

const bulkUploadDir = path.join(os.tmpdir(), "bulk-payments")
if (!fs.existsSync(bulkUploadDir)) {
  fs.mkdirSync(bulkUploadDir, { recursive: true })
}

const bulkStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, bulkUploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})

const bulkUpload = multer({
  storage: bulkStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type. Only CSV and XLSX allowed."))
    }
  },
})

const stripeWebhookLimiter = createEndpointLimiter(60 * 1000, 120, "webhook:stripe")
const chapaWebhookLimiter = createEndpointLimiter(60 * 1000, 120, "webhook:chapa")
const flutterwaveWebhookLimiter = createEndpointLimiter(60 * 1000, 120, "webhook:flutterwave")

// Reconciliation Routes (PM, ADMIN, FS)
router.post(
  "/reconciliation/:leaseId",
  authOrApiKey(["PM", "ADMIN", "FS"], { resource: "reconciliation", action: "write" }),
  validateLeaseIdParam,
  generateReconciliation,
)
router.get(
  "/reconciliation/:reconciliationId",
  authOrApiKey(["PM", "ADMIN", "FS"], { resource: "reconciliation", action: "read" }),
  validateReconciliationId,
  getReconciliationReport,
)
router.patch(
  "/reconciliation/:reconciliationId/discrepancy/:discrepancyIndex",
  authOrApiKey(["PM", "ADMIN"], { resource: "reconciliation", action: "write" }),
  validateResolveDiscrepancy,
  resolveDiscrepancyEndpoint,
)
router.get(
  "/reconciliations",
  authOrApiKey(["PM", "ADMIN", "FS"], { resource: "reconciliation", action: "read" }),
  validatePagination,
  listReconciliations,
)

// Webhook Routes (No auth required - verified via signature)
router.post("/webhooks/stripe", stripeWebhookLimiter, handleStripeWebhook)
router.post("/webhooks/chapa", chapaWebhookLimiter, handleChapaWebhook)
router.post("/webhooks/flutterwave", flutterwaveWebhookLimiter, handleFlutterwaveWebhook)

// Invoice & Payment Schedule Routes (PM, ADMIN)
router.post("/invoices/:leaseId", auth(["PM", "ADMIN", "FS"]), validateCreateInvoice, createInvoice)
router.post(
  "/payment-schedule/:leaseId",
  auth(["PM", "ADMIN"]),
  validateCreatePaymentSchedule,
  setupPaymentSchedule,
)
router.get("/invoices", auth(["PM", "ADMIN", "FS", "TENANT"]), validateListInvoices, listInvoices)

// Dispute Routes (All authenticated)
router.post("/disputes/:paymentId", auth(), validateCreateDispute, createDispute)
router.get("/disputes/:disputeId", auth(), validateObjectIdParam("disputeId", "dispute ID"), getDispute)
router.patch("/disputes/:disputeId/resolve", auth(["PM", "ADMIN"]), validateResolveDispute, resolveDispute)
router.get("/disputes", auth(), validatePagination, listDisputes)

// Bulk Upload Routes (PM, ADMIN, FS)
router.post(
  "/bulk-payments",
  authOrApiKey(["PM", "ADMIN", "FS"], { resource: "payments", action: "write" }),
  bulkUpload.single("file"),
  uploadBulkPayments,
)
router.get(
  "/bulk-payments/:uploadId",
  authOrApiKey(["PM", "ADMIN", "FS"], { resource: "payments", action: "read" }),
  validateBulkUploadId,
  getBulkUploadStatus,
)

// Analytics Routes (PM, ADMIN, FS, GM)
router.get(
  "/analytics/metrics",
  authOrApiKey(["PM", "ADMIN", "FS", "GM"], { resource: "analytics", action: "read" }),
  getDashboardMetrics,
)
router.get(
  "/analytics/trends",
  authOrApiKey(["PM", "ADMIN", "FS", "GM"], { resource: "analytics", action: "read" }),
  validateAnalyticsTrendQuery,
  getPaymentTrendChart,
)
router.get(
  "/analytics/payment-methods",
  authOrApiKey(["PM", "ADMIN", "FS", "GM"], { resource: "analytics", action: "read" }),
  getPaymentMethodBreakdown,
)
router.get(
  "/analytics/properties",
  authOrApiKey(["PM", "ADMIN", "GM"], { resource: "analytics", action: "read" }),
  validateAnalyticsPropertyQuery,
  getPropertyPerformance,
)

// Mobile Payment Routes (TENANT, ADMIN)
router.post(
  "/mobile-payments/initiate",
  auth(["TENANT", "ADMIN"]),
  validateInitiateMobileMoneyPayment,
  initiateMobileMoneyPayment,
)
router.get("/mobile-payments/providers", auth(), getMobileMoneyProviders)

// SMS/WhatsApp Routes (PM, ADMIN)

router.post(
  "/notifications/send-sms",
  auth(["PM", "ADMIN"]),
  validateSendPaymentReminder,
  sendPaymentReminderSMS,
)
router.post(
  "/notifications/bulk-reminders",
  auth(["ADMIN", "GM"]),
  validateSendBulkReminders,
  sendBulkReminders,
)
router.get("/notifications/sms-log", auth(["ADMIN", "GM"]), validateSmsLogQuery, getSMSLog)

export default router
