// src/controllers/propertyController.js (ESM)
import Property from "../models/Property.js";

export async function createProperty(req, res) {
  try {
    const property = await Property.create(req.body);
    return res.status(201).json(property);
  } catch (err) {
    console.error("createProperty error:", err);
    return res
      .status(400)
      .json({ message: err.message || "Failed to create property" });
  }
}

export async function listProperties(req, res) {
  try {
    const properties = await Property.find({ isActive: true });
    return res.json(properties);
  } catch (err) {
    console.error("listProperties error:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch properties" });
  }
}

export async function getPropertyById(req, res) {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    return res.json(property);
  } catch (err) {
    console.error("getPropertyById error:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch property" });
  }
}
