import Property from "../models/Property.js"
import Unit from "../models/Unit.js"
import { logAction } from "../utils/auditLogger.js"

export async function createProperty(req, res) {
  try {
    const userId = req.user._id
    const userRole = req.user.role
    const { name, address, city, state, country, managerId } = req.body

    if (!name || !address) {
      return res.status(400).json({ status: 400, message: "Name and address are required" })
    }

    const assignedManagerId = userRole === "ADMIN" && managerId ? managerId : userId

    const property = await Property.create({
      name,
      address,
      city,
      state,
      country,
      managerId: assignedManagerId,
    })

    await logAction({
      userId,
      action: "PROPERTY_CREATED",
      entityType: "Property",
      entityId: property._id,
      details: { name, address },
    })

    res.status(201).json({ status: 201, data: property })
  } catch (err) {
    res.status(500).json({ status: 500, message: "Failed to create property" })
  }
}

export async function listProperties(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query
    const pageNumber = Number.parseInt(page, 10) || 1
    const limitNumber = Number.parseInt(limit, 10) || 20
    const skip = (pageNumber - 1) * limitNumber
    const userId = req.user._id
    const userRole = req.user.role

    const filter = { isDeleted: false }
    if (userRole === "PM") {
      filter.managerId = userId
    }

    const [properties, total] = await Promise.all([
      Property.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNumber).lean(),
      Property.countDocuments(filter),
    ])

    res.json({
      status: 200,
      data: properties,
      pagination: { page: pageNumber, limit: limitNumber, total, pages: Math.ceil(total / limitNumber) },
    })
  } catch (err) {
    res.status(500).json({ status: 500, message: "Failed to fetch properties" })
  }
}

export async function getPropertyById(req, res) {
  try {
    const { id } = req.params
    const userId = req.user._id
    const userRole = req.user.role

    const property = await Property.findOne({ _id: id, isDeleted: false })
    if (!property) {
      return res.status(404).json({ status: 404, message: "Property not found" })
    }

    if (userRole === "PM" && property.managerId?.toString() !== userId.toString()) {
      return res.status(403).json({ status: 403, message: "Forbidden" })
    }

    res.json({ status: 200, data: property })
  } catch (err) {
    res.status(500).json({ status: 500, message: "Failed to fetch property" })
  }
}

export async function updateProperty(req, res) {
  try {
    const { id } = req.params
    const userId = req.user._id
    const userRole = req.user.role

    const property = await Property.findOne({ _id: id, isDeleted: false })
    if (!property) {
      return res.status(404).json({ status: 404, message: "Property not found" })
    }

    if (userRole === "PM" && property.managerId?.toString() !== userId.toString()) {
      return res.status(403).json({ status: 403, message: "Forbidden" })
    }

    const updates = (({ name, address, city, state, country, managerId }) => ({
      name,
      address,
      city,
      state,
      country,
      managerId: userRole === "ADMIN" ? managerId : property.managerId,
    }))(req.body)

    Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key])

    const updated = await Property.findByIdAndUpdate(id, updates, { new: true })

    await logAction({
      userId,
      action: "PROPERTY_UPDATED",
      entityType: "Property",
      entityId: id,
      details: updates,
    })

    res.json({ status: 200, data: updated })
  } catch (err) {
    res.status(500).json({ status: 500, message: "Failed to update property" })
  }
}

export async function deleteProperty(req, res) {
  try {
    const { id } = req.params
    const userId = req.user._id
    const userRole = req.user.role

    const property = await Property.findOne({ _id: id, isDeleted: false })
    if (!property) {
      return res.status(404).json({ status: 404, message: "Property not found" })
    }

    if (userRole === "PM" && property.managerId?.toString() !== userId.toString()) {
      return res.status(403).json({ status: 403, message: "Forbidden" })
    }

    await Property.findByIdAndUpdate(id, { isDeleted: true })
    await Unit.updateMany({ propertyId: id }, { isDeleted: true })

    await logAction({
      userId,
      action: "PROPERTY_DELETED",
      entityType: "Property",
      entityId: id,
    })

    res.json({ status: 200, message: "Property deleted" })
  } catch (err) {
    res.status(500).json({ status: 500, message: "Failed to delete property" })
  }
}

export default {
  createProperty,
  listProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
}
