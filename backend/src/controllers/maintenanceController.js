// src/controllers/maintenanceController.js

import MaintenanceRequest from "../models/MaintenanceRequest.js";

// Tenant creates a maintenance request
export async function createMaintenanceRequest(req, res) {
  try {
    const data = req.body;

    // Ensure tenantId comes from the authenticated user
    if (req.user?.id) {
      data.tenantId = req.user.id;
    }

    // Basic safety: unitId must be provided by frontend
    if (!data.unitId) {
      return res
        .status(400)
        .json({ success: false, message: "unitId is required" });
    }

    const request = await MaintenanceRequest.create(data);
    return res.status(201).json({ success: true, data: request });
  } catch (err) {
    console.error("createMaintenanceRequest error:", err);
    return res
      .status(400)
      .json({ success: false, message: err.message });
  }
}

// Get all maintenance requests (admin/PM)
export async function getMaintenanceRequests(req, res) {
  try {
    const filters = {
      isDeleted: false,
      ...req.query,
    };

    const requests = await MaintenanceRequest.find(filters)
      .populate("tenantId")
      .populate("unitId")
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: requests });
  } catch (err) {
    console.error("getMaintenanceRequests error:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message });
  }
}

// Get maintenance requests by tenant (tenant dashboard)
export async function getMaintenanceRequestsByTenant(req, res) {
  try {
    const tenantId = req.params.tenantId;

    const requests = await MaintenanceRequest.find({
      tenantId,
      isDeleted: false,
    })
      .populate("unitId")
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: requests });
  } catch (err) {
    console.error("getMaintenanceRequestsByTenant error:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message });
  }
}

// Update status (PM/admin)
export async function updateMaintenanceStatus(req, res) {
  try {
    const { status } = req.body;

    const request = await MaintenanceRequest.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Maintenance request not found",
      });
    }

    return res.json({ success: true, data: request });
  } catch (err) {
    console.error("updateMaintenanceStatus error:", err);
    return res
      .status(400)
      .json({ success: false, message: err.message });
  }
}

// Soft delete
export async function softDeleteMaintenanceRequest(req, res) {
  try {
    const request = await MaintenanceRequest.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Maintenance request not found",
      });
    }

    return res.json({
      success: true,
      message: "Maintenance request soft deleted",
    });
  } catch (err) {
    console.error("softDeleteMaintenanceRequest error:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message });
  }
}
