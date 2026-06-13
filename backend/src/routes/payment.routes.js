// src/routes/payment.routes.js (ESM) - Production routes with PM/ADMIN verification

import { Router } from "express"
import multer from "multer"
import { auth, verificationLimiter } from "../middleware/auth-advanced.js"
import {
  validateCreatePayment,
  validateVerifyPayment,
  validateRejectPayment,
  validatePagination,
  validateUploadPaymentProof,
  validateVerifyPaymentWithProof,
  validateObjectIdParam,
  generateIdempotencyKey,
} from "../middleware/validators.js"
import { createPayment, verifyPayment, rejectPayment, listPayments } from "../controllers/paymentController.js"
import {
  uploadPaymentProof,
  getPaymentProof,
  verifyPaymentWithProof,
} from "../controllers/paymentController-Enhanced.js"

const router = Router()

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, WebP allowed."))
    }
  },
})

// All authenticated users can create payments (idempotency protected)
router.post("/", auth(), generateIdempotencyKey, validateCreatePayment, createPayment)

// List payments (role-filtered)
router.get("/", auth(), validatePagination, listPayments)

// Only PM and ADMIN can verify payments
router.patch("/:id/verify", auth(["PM", "ADMIN"]), verificationLimiter, validateVerifyPayment, verifyPayment)

// Only PM and ADMIN can reject payments
router.patch("/:id/reject", auth(["PM", "ADMIN"]), verificationLimiter, validateRejectPayment, rejectPayment)

// Payment proof flows
router.post(
  "/:paymentId/proof",
  auth(),
  validateUploadPaymentProof,
  upload.single("proofImage"),
  uploadPaymentProof,
)

router.get(
  "/:paymentId/proof",
  auth(["PM", "ADMIN"]),
  validateObjectIdParam("paymentId", "payment ID"),
  getPaymentProof,
)

router.patch(
  "/:paymentId/verify-with-proof",
  auth(["PM", "ADMIN"]),
  verificationLimiter,
  validateVerifyPaymentWithProof,
  verifyPaymentWithProof,
)

export default router
