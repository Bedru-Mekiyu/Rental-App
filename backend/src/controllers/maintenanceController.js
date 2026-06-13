// src/controllers/maintenanceController.js (ESM) - With authorization

import MaintenanceRequest from "../models/MaintenanceRequest.js"
import Unit from "../models/Unit.js"
import Lease from "../models/Lease.js"
import Property from "../models/Property.js"
import { logAction } from "../utils/auditLogger.js"

export async function createMaintenanceRequest(req, res) {
  try {
    const { unitId, description, priority, estimatedCostEtb } = req.body
    const userId = req.user._id
    const userRole = req.user.role

    const unit = await Unit.findById(unitId)
    if (!unit) {
      return res.status(404).json({ status: 404, message: "Unit not found" })
    }

    if (userRole === "PM") {
      const property = await Property.findById(unit.propertyId)
      if (!property || property.managerId?.toString() !== userId.toString()) {
        return res.status(403).json({ status: 403, message: "Access denied" })
      }
    }

    if (userRole === "TENANT") {
      const lease = await Lease.findOne({
        unitId,
        tenantId: userId,
        status: "ACTIVE",
      })
      if (!lease) {
        return res.status(403).json({ status: 403, message: "You're not assigned to this unit" })
      }
    }

    const request = await MaintenanceRequest.create({
      unitId,
      requestedBy: userId,
      description,
      priority,
      estimatedCostEtb,
      status: "PENDING",
    })

    await logAction({
      userId,
      action: "MAINTENANCE_REQUESTED",
      entityType: "MaintenanceRequest",
      entityId: request._id,
      details: { unitId, priority },
    })

    res.status(201).json({
      status: 201,
      message: "Maintenance request created",
      data: request,
    })
  } catch (err) {
    res.status(500).json({ status: 500, message: "Failed to create maintenance request" })
  }
}

export async function updateMaintenanceStatus(req, res) {
  try {
    const { id } = req.params
    const { status, completionNotes } = req.body
    const userId = req.user._id
    const userRole = req.user.role

    if (!["PM", "GM", "ADMIN"].includes(userRole)) {
      return res.status(403).json({ status: 403, message: "Insufficient permissions" })
    }

    if (status === "COMPLETED" && !completionNotes) {
      return res.status(400).json({ status: 400, message: "Completion notes required" })
    }

    const request = await MaintenanceRequest.findById(id)
    if (!request) {
      return res.status(404).json({ status: 404, message: "Maintenance request not found" })
    }

    if (userRole === "PM") {
      const unit = await Unit.findById(request.unitId)
      const property = unit ? await Property.findById(unit.propertyId) : null
      if (!property || property.managerId?.toString() !== userId.toString()) {
        return res.status(403).json({ status: 403, message: "Access denied" })
      }
    }

    request.status = status
    request.completionNotes = completionNotes
    request.updatedBy = userId
    await request.save()

    await logAction({
      userId,
      action: "MAINTENANCE_STATUS_UPDATED",
      entityType: "MaintenanceRequest",
      entityId: id,
      details: { newStatus: status },
    })

    res.json({ status: 200, message: "Status updated", data: request })
  } catch (err) {
    res.status(500).json({ status: 500, message: "Failed to update status" })
  }
}
