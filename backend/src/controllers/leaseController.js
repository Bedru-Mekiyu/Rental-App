// src/controllers/leaseController.js (ESM) - Production-ready with authorization

import Lease from "../models/Lease.js"
import Property from "../models/Property.js"
import { logAction } from "../utils/auditLogger.js"
import { createLeaseWithTransaction, terminateLeaseWithTransaction } from "../utils/transactionWrapper.js"
import { canManageProperty, canAccessLease } from "../middleware/authorization.js"

export async function createLease(req, res) {
  try {
    const { unitId, tenantId, propertyId, startDate, endDate, monthlyRentEtb, securityDepositEtb } = req.body
    const userId = req.user._id
    const userRole = req.user.role

    if (!["PM", "ADMIN"].includes(userRole)) {
      await logAction({
        userId,
        action: "LEASE_CREATE_DENIED",
        entityType: "Lease",
        entityId: unitId,
        details: { reason: "Insufficient permissions" },
      })
      return res.status(403).json({ status: 403, message: "Only PM/ADMIN can create leases" })
    }

    const canManage = await canManageProperty(userId, propertyId, userRole)
    if (!canManage) {
      return res.status(403).json({ status: 403, message: "You don't manage this property" })
    }

    // Create lease with transaction safety
    const lease = await createLeaseWithTransaction({
      unitId,
      tenantId,
      propertyId,
      startDate,
      endDate,
      monthlyRentEtb,
      securityDepositEtb,
    })

    await logAction({
      userId,
      action: "LEASE_CREATED",
      entityType: "Lease",
      entityId: lease._id,
      details: { unitId, tenantId, monthlyRentEtb },
    })

    res.status(201).json({
      status: 201,
      message: "Lease created successfully",
      data: lease,
    })
  } catch (err) {
    console.error("Lease creation error:", err.message)
    res.status(500).json({ status: 500, message: err.message || "Failed to create lease" })
  }
}

export async function listLeases(req, res) {
  try {
    const { page = 1, limit = 20, status } = req.query
    const pageNumber = Number.parseInt(page, 10) || 1
    const limitNumber = Number.parseInt(limit, 10) || 20
    const skip = (pageNumber - 1) * limitNumber

    const filter = status ? { status } : {}

    if (req.user.role === "TENANT") {
      filter.tenantId = req.user._id
    } else if (req.user.role === "PM") {
      // PM can only see leases for their properties
      const properties = await Property.find({ managerId: req.user._id }, { _id: 1 })
      filter.propertyId = { $in: properties.map((p) => p._id) }
    }
    // ADMIN sees all, GM/FS see all (data analytics roles)

    const leases = await Lease.find(filter).skip(skip).limit(limitNumber).populate("unitId tenantId propertyId")

    const total = await Lease.countDocuments(filter)

    res.json({
      status: 200,
      data: leases,
      pagination: { page: pageNumber, limit: limitNumber, total, pages: Math.ceil(total / limitNumber) },
    })
  } catch (err) {
    res.status(500).json({ status: 500, message: "Failed to fetch leases" })
  }
}

export async function getLeaseById(req, res) {
  try {
    const { id } = req.params
    const userId = req.user._id
    const userRole = req.user.role

    const lease = await Lease.findById(id).populate("unitId tenantId propertyId")
    if (!lease) {
      return res.status(404).json({ status: 404, message: "Lease not found" })
    }

    const canAccess = await canAccessLease(userId, id, userRole)
    if (!canAccess) {
      return res.status(403).json({ status: 403, message: "Forbidden" })
    }

    res.json({ status: 200, data: lease })
  } catch (err) {
    res.status(500).json({ status: 500, message: "Failed to fetch lease" })
  }
}

export async function terminateLease(req, res) {
  try {
    const { id } = req.params
    const userId = req.user._id
    const userRole = req.user.role

    if (!["PM", "ADMIN"].includes(userRole)) {
      return res.status(403).json({ status: 403, message: "Only PM/ADMIN can terminate leases" })
    }

    const lease = await Lease.findById(id)
    if (!lease) {
      return res.status(404).json({ status: 404, message: "Lease not found" })
    }

    const canAccess = await canAccessLease(userId, id, userRole)
    if (!canAccess) {
      return res.status(403).json({ status: 403, message: "Forbidden" })
    }

    const updated = await terminateLeaseWithTransaction(id, userId, userRole)

    await logAction({
      userId,
      action: "LEASE_TERMINATED",
      entityType: "Lease",
      entityId: id,
      details: { tenantId: lease.tenantId },
    })

    res.json({ status: 200, message: "Lease terminated", data: updated })
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message || "Failed to terminate lease" })
  }
}
