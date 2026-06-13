// src/routes/maintenance.routes.js (ESM) - Production routes with auth

import { Router } from "express"
import { auth } from "../middleware/auth-advanced.js"
import {
	validateCreateMaintenance,
	validateUpdateMaintenanceStatus,
	validateObjectIdParam,
} from "../middleware/validators.js"
import { createMaintenanceRequest, updateMaintenanceStatus } from "../controllers/maintenanceController.js"

const router = Router()

// Any authenticated user can request maintenance
router.post("/", auth(), validateCreateMaintenance, createMaintenanceRequest)

// Update status (PM, GM, ADMIN only)
router.patch(
	"/:id/status",
	auth(["PM", "GM", "ADMIN"]),
	validateObjectIdParam("id", "maintenance ID"),
	validateUpdateMaintenanceStatus,
	updateMaintenanceStatus,
)

export default router
