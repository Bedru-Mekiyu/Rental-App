// src/routes/lease.routes.js (ESM)

import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  createLease,
  getLeaseById,
  listLeasesByTenant,
  endLease,
  listAllLeases,
} from "../controllers/leaseController.js";

const router = Router();

// adjust allowed roles if needed
const MANAGE_ROLES = ["PM", "ADMIN"];
const VIEW_ROLES = ["PM", "ADMIN", "FS", "GM", "TENANT"];

// List all leases (no TENANT here)
router.get("/", auth(["PM", "ADMIN", "FS", "GM"]), listAllLeases);

// Create lease
router.post("/", auth(MANAGE_ROLES), createLease);

// List leases by tenant
router.get("/by-tenant/:tenantId", auth(VIEW_ROLES), listLeasesByTenant);

// Get lease by id
router.get("/:id", auth(VIEW_ROLES), getLeaseById);

// End lease
router.patch("/:id/end", auth(MANAGE_ROLES), endLease);

export default router;
