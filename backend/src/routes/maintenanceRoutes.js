// src/routes/maintenanceRoutes.js
import express from "express";
import {
  createMaintenanceRequest,
  getMaintenanceRequests,
  getMaintenanceRequestsByTenant,
  updateMaintenanceStatus,
  softDeleteMaintenanceRequest,
} from "../controllers/maintenanceController.js";

const router = express.Router();

// Tenant creates a request
router.post("/", createMaintenanceRequest);

// Admin/PM: list all requests (with optional filters)
router.get("/", getMaintenanceRequests);

// Tenant: list requests by tenant id
router.get("/by-tenant/:tenantId", getMaintenanceRequestsByTenant);

// Admin/PM: update status
router.patch("/:id/status", updateMaintenanceStatus);

// Soft delete
router.delete("/:id", softDeleteMaintenanceRequest);

export default router;
