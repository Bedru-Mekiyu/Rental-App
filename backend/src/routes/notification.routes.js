// Notification Routes - Email preferences and job queue management

import { Router } from "express"
import { auth } from "../middleware/auth.js"
import {
  validateNotificationPreferences,
  validateJobId,
  validateEmailLogId,
  validatePagination,
} from "../middleware/validators.js"
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  getEmailHistory,
  getJobQueueStatus,
  retryFailedJob,
  resendEmailNotification,
} from "../controllers/notificationController.js"

const router = Router()

// All notification endpoints require authentication
router.use(auth())

// Notification preferences
router.get("/preferences", getNotificationPreferences)
router.patch("/preferences", validateNotificationPreferences, updateNotificationPreferences)

// Email history (accessible to all authenticated users)
router.get("/emails", validatePagination, getEmailHistory)

// Job queue management (ADMIN/PM/FS only)
router.get("/jobs", auth(["ADMIN", "PM", "FS"]), validatePagination, getJobQueueStatus)
router.post("/jobs/:jobId/retry", auth(["ADMIN", "PM", "FS"]), validateJobId, retryFailedJob)
router.post("/emails/:emailLogId/resend", auth(["ADMIN", "PM", "FS"]), validateEmailLogId, resendEmailNotification)

export default router
