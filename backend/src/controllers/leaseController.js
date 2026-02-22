// src/controllers/leaseController.js (ESM)

import mongoose from "mongoose";
import Lease from "../models/Lease.js";
import Unit from "../models/Unit.js";
import { logAction } from "../utils/auditLogger.js";
import { calculateUnitPrice } from "../services/pricingService.js";

/**
 * POST /api/leases
 * Roles: PM, ADMIN
 * Create a lease linking unit + tenant, computing monthly rent
 */
export async function createLease(req, res) {
  try {
    const { unitId, tenantId, startDate, endDate, taxRate } = req.body;

    if (!unitId || !tenantId || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const unit = await Unit.findById(unitId);
    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    // use pricing engine
    const monthlyRentEtb = calculateUnitPrice(unit);

    const lease = await Lease.create({
      unitId,
      tenantId,
      managerId: req.user.id, // the PM creating this lease
      startDate,
      endDate,
      monthlyRentEtb,
      taxRate: taxRate || 0,
      status: "ACTIVE",
    });

    // update unit status to OCCUPIED
    unit.status = "OCCUPIED";
    await unit.save();

    await logAction({
      userId: req.user.id,
      action: "LEASE_CREATE",
      entityType: "LEASE",
      entityId: lease._id,
      details: { unitId: lease.unitId, tenantId: lease.tenantId },
    });

    return res.status(201).json(lease);
  } catch (err) {
    console.error("createLease error:", err);
    return res.status(500).json({ message: "Failed to create lease" });
  }
}

/**
 * GET /api/leases
 * Roles: PM, ADMIN, FS, GM
 * List all leases with optional filters
 */
export async function listAllLeases(req, res) {
  try {
    const { status, tenantId, managerId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (tenantId) filter.tenantId = tenantId;
    if (managerId) filter.managerId = managerId;

    const leases = await Lease.find(filter)
      .populate("unitId")
      .populate("tenantId", "fullName email");

    return res.json(leases);
  } catch (err) {
    console.error("listAllLeases error:", err);
    return res.status(500).json({ message: "Failed to fetch leases" });
  }
}

/**
 * GET /api/leases/:id
 * Roles: PM, ADMIN, FS, GM, TENANT
 */
export async function getLeaseById(req, res) {
  try {
    if (!req.params.id || req.params.id === 'undefined' || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid lease ID" });
    }

    const lease = await Lease.findById(req.params.id)
      .populate("unitId")
      .populate("tenantId", "fullName email");

    if (!lease) {
      return res.status(404).json({ message: "Lease not found" });
    }

    // Tenant can only see own lease
    if (
      req.user.role === "TENANT" &&
      String(lease.tenantId._id || lease.tenantId) !== String(req.user.id)
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json(lease);
  } catch (err) {
    console.error("getLeaseById error:", err);
    return res.status(500).json({ message: "Failed to fetch lease" });
  }
}

/**
 * GET /api/leases/by-tenant/:tenantId
 * Roles: PM, ADMIN, FS, GM, TENANT
 */
export async function listLeasesByTenant(req, res) {
  try {
    const { tenantId } = req.params;

    // Tenant can only list their own leases
    if (
      req.user.role === "TENANT" &&
      String(tenantId) !== String(req.user.id)
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const leases = await Lease.find({ tenantId }).populate("unitId");

    return res.json(leases);
  } catch (err) {
    console.error("listLeasesByTenant error:", err);
    return res.status(500).json({ message: "Failed to fetch leases" });
  }
}

/**
 * PATCH /api/leases/:id/end
 * Roles: PM, ADMIN
 * Mark lease as ENDED and free the unit
 */
export async function endLease(req, res) {
  try {
    const lease = await Lease.findById(req.params.id);
    if (!lease) {
      return res.status(404).json({ message: "Lease not found" });
    }

    lease.status = "ENDED";
    await lease.save();

    // set unit back to VACANT
    const unit = await Unit.findById(lease.unitId);
    if (unit) {
      unit.status = "VACANT";
      await unit.save();
    }

    await logAction({
      userId: req.user.id,
      action: "LEASE_END",
      entityType: "LEASE",
      entityId: lease._id,
      details: { unitId: lease.unitId, tenantId: lease.tenantId },
    });

    return res.json(lease);
  } catch (err) {
    console.error("endLease error:", err);
    return res.status(500).json({ message: "Failed to end lease" });
  }
}
