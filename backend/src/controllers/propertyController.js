// src/controllers/propertyController.js (ESM)
import Property from "../models/Property.js";
import { buildPaginationMeta, getPagination } from "../utils/pagination.js";

export async function createProperty(req, res) {
  try {
    const property = await Property.create(req.body);
    return res.status(201).json({ success: true, data: property });
  } catch (err) {
    console.error("createProperty error:", err);
    return res
      .status(400)
      .json({
        success: false,
        message: err.message || "Failed to create property",
      });
  }
}

export async function listProperties(req, res) {
  try {
    const { page, limit, skip } = getPagination(req);
    const filter = { isActive: true };
    const [properties, total] = await Promise.all([
      Property.find(filter).skip(skip).limit(limit),
      Property.countDocuments(filter),
    ]);
    return res.json({
      success: true,
      data: properties,
      meta: buildPaginationMeta({ page, limit, total }),
    });
  } catch (err) {
    console.error("listProperties error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch properties" });
  }
}

export async function getPropertyById(req, res) {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }
    return res.json({ success: true, data: property });
  } catch (err) {
    console.error("getPropertyById error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch property" });
  }
}
