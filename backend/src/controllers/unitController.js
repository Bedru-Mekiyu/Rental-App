import Unit from "../models/Unit.js"
import Property from "../models/Property.js"
import { logAction } from "../utils/auditLogger.js"

async function ensurePropertyAccess(userId, userRole, propertyId) {
  if (userRole !== "PM") {
    return true
  }
  const property = await Property.findOne({ _id: propertyId, isDeleted: false })
  return property && property.managerId?.toString() === userId.toString()
}

export async function createUnit(req, res) {
  try {
    const userId = req.user._id
    const userRole = req.user.role
    const { propertyId, unitNumber, floor, bedrooms, bathrooms, squareMeters, monthlyRentEtb } = req.body

    const allowed = await ensurePropertyAccess(userId, userRole, propertyId)
    if (!allowed) {
      return res.status(403).json({ status: 403, message: "Forbidden" })
    }

    const unit = await Unit.create({
      propertyId,
      unitNumber,
      floor,
      bedrooms,
      bathrooms,
      squareMeters,
      monthlyRentEtb,
    })

    await Property.findByIdAndUpdate(propertyId, { $addToSet: { units: unit._id } })

    await logAction({
      userId,
      action: "UNIT_CREATED",
      entityType: "Unit",
      entityId: unit._id,
      details: { propertyId, unitNumber },
    })

    res.status(201).json({ status: 201, data: unit })
  } catch (err) {
    res.status(500).json({ status: 500, message: "Failed to create unit" })
  }
}

export async function listUnits(req, res) {
  try {
    const { page = 1, limit = 20, propertyId } = req.query
    const pageNumber = Number.parseInt(page, 10) || 1
    const limitNumber = Number.parseInt(limit, 10) || 20
    const skip = (pageNumber - 1) * limitNumber
    const userId = req.user._id
    const userRole = req.user.role

    const filter = { isDeleted: false }

    if (userRole === "PM") {
      const properties = await Property.find({ managerId: userId, isDeleted: false }, { _id: 1 }).lean()
      const managedPropertyIds = properties.map((p) => p._id)

      if (propertyId) {
        const requestedPropertyId = propertyId.toString()
        const hasAccess = managedPropertyIds.some((managedId) => managedId.toString() === requestedPropertyId)
        if (!hasAccess) {
          return res.status(403).json({ status: 403, message: "Forbidden" })
        }
        filter.propertyId = propertyId
      } else {
        filter.propertyId = { $in: managedPropertyIds }
      }
    } else if (propertyId) {
      filter.propertyId = propertyId
    }

    const [units, total] = await Promise.all([
      Unit.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNumber).lean(),
      Unit.countDocuments(filter),
    ])

    res.json({
      status: 200,
      data: units,
      pagination: { page: pageNumber, limit: limitNumber, total, pages: Math.ceil(total / limitNumber) },
    })
  } catch (err) {
    res.status(500).json({ status: 500, message: "Failed to fetch units" })
  }
}

export async function getUnitById(req, res) {
  try {
    const { id } = req.params
    const userId = req.user._id
    const userRole = req.user.role

    const unit = await Unit.findOne({ _id: id, isDeleted: false })
    if (!unit) {
      return res.status(404).json({ status: 404, message: "Unit not found" })
    }

    const allowed = await ensurePropertyAccess(userId, userRole, unit.propertyId)
    if (!allowed) {
      return res.status(403).json({ status: 403, message: "Forbidden" })
    }

    res.json({ status: 200, data: unit })
  } catch (err) {
    res.status(500).json({ status: 500, message: "Failed to fetch unit" })
  }
}

export async function updateUnit(req, res) {
  try {
    const { id } = req.params
    const userId = req.user._id
    const userRole = req.user.role

    const unit = await Unit.findOne({ _id: id, isDeleted: false })
    if (!unit) {
      return res.status(404).json({ status: 404, message: "Unit not found" })
    }

    const allowed = await ensurePropertyAccess(userId, userRole, unit.propertyId)
    if (!allowed) {
      return res.status(403).json({ status: 403, message: "Forbidden" })
    }

    const updates = (({ status, monthlyRentEtb, floor, bedrooms, bathrooms, squareMeters }) => ({
      status,
      monthlyRentEtb,
      floor,
      bedrooms,
      bathrooms,
      squareMeters,
    }))(req.body)

    Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key])

    const updated = await Unit.findByIdAndUpdate(id, updates, { new: true })

    await logAction({
      userId,
      action: "UNIT_UPDATED",
      entityType: "Unit",
      entityId: id,
      details: updates,
    })

    res.json({ status: 200, data: updated })
  } catch (err) {
    res.status(500).json({ status: 500, message: "Failed to update unit" })
  }
}

export async function deleteUnit(req, res) {
  try {
    const { id } = req.params
    const userId = req.user._id
    const userRole = req.user.role

    const unit = await Unit.findOne({ _id: id, isDeleted: false })
    if (!unit) {
      return res.status(404).json({ status: 404, message: "Unit not found" })
    }

    const allowed = await ensurePropertyAccess(userId, userRole, unit.propertyId)
    if (!allowed) {
      return res.status(403).json({ status: 403, message: "Forbidden" })
    }

    await Unit.findByIdAndUpdate(id, { isDeleted: true })
    await Property.findByIdAndUpdate(unit.propertyId, { $pull: { units: unit._id } })

    await logAction({
      userId,
      action: "UNIT_DELETED",
      entityType: "Unit",
      entityId: id,
    })

    res.json({ status: 200, message: "Unit deleted" })
  } catch (err) {
    res.status(500).json({ status: 500, message: "Failed to delete unit" })
  }
}

export default {
  createUnit,
  listUnits,
  getUnitById,
  updateUnit,
  deleteUnit,
}
