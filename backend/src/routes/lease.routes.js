// src/routes/lease.routes.js (ESM) - Production routes with full authorization

import { Router } from "express"
import { auth } from "../middleware/auth-advanced.js"
import {
	validateCreateLease,
	validateUpdateLease,
	validatePagination,
	validateObjectIdParam,
} from "../middleware/validators.js"
import { createLease, listLeases, getLeaseById, terminateLease } from "../controllers/leaseController.js"

const router = Router()

// Only PM and ADMIN can create leases
router.post("/", auth(["PM", "ADMIN"]), validateCreateLease, createLease)

// All authenticated users can list (filtered by role)
router.get("/", auth(), validatePagination, listLeases)

// All authenticated users can view (if authorized)
router.get("/:id", auth(), validateObjectIdParam("id", "lease ID"), getLeaseById)

// Only PM and ADMIN can terminate
router.patch(
	"/:id/terminate",
	auth(["PM", "ADMIN"]),
	validateObjectIdParam("id", "lease ID"),
	validateUpdateLease,
	terminateLease,
)

export default router
