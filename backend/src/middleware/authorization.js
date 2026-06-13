// src/middleware/authorization.js (ESM)
// Enhanced authorization with resource ownership checks

import Unit from "../models/Unit.js"
import Property from "../models/Property.js"
import Lease from "../models/Lease.js"

/**
 * Check if user owns/manages a property
 * PM can manage their assigned properties
 * ADMIN can manage all properties
 */
export async function canManageProperty(userId, propertyId, userRole) {
  if (userRole === "ADMIN") return true
  if (userRole !== "PM") return false

  const property = await Property.findById(propertyId)
  return property && property.managerId?.toString() === userId.toString()
}

/**
 * Check if user can manage a unit
 * Must own the parent property
 */
export async function canManageUnit(userId, unitId, userRole) {
  if (userRole === "ADMIN") return true

  const unit = await Unit.findById(unitId).populate("propertyId")
  if (!unit) return false

  return canManageProperty(userId, unit.propertyId._id, userRole)
}

/**
 * Check if tenant can access a lease
 * Only their own leases
 */
export async function canAccessLease(userId, leaseId, userRole) {
  if (userRole === "ADMIN") return true

  const lease = await Lease.findById(leaseId)
  if (!lease) return false

  if (userRole === "TENANT") {
    return lease.tenantId?.toString() === userId.toString()
  }

  // PM/GM/FS can access if they manage the property
  if (userRole === "PM" || userRole === "GM" || userRole === "FS") {
    const unit = await Unit.findById(lease.unitId).populate("propertyId")
    return unit && (await canManageProperty(userId, unit.propertyId._id, userRole))
  }

  return false
}

/**
 * Only PM and ADMIN can verify leases and payments
 */
export function canVerifyPayments(userRole) {
  return ["PM", "ADMIN"].includes(userRole)
}

/**
 * Authorization middleware factory
 */
export function authorize(checker) {
  return async (req, res, next) => {
    try {
      const authorized = await checker(req.user._id, req.params, req.user.role)
      if (!authorized) {
        return res.status(403).json({
          status: 403,
          message: "Forbidden: insufficient permissions",
        })
      }
      next()
    } catch (err) {
      res.status(500).json({ status: 500, message: "Authorization error" })
    }
  }
}
