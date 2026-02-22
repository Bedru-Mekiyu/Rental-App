// src/routes/property.routes.js (ESM)
import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  createProperty,
  listProperties,
  getPropertyById,
} from "../controllers/propertyController.js";

const router = Router();

// PM, ADMIN manage properties
const MANAGE_ROLES = ["PM", "ADMIN"];

// Create one property
router.post("/", auth(MANAGE_ROLES), createProperty);

// List active properties
router.get("/", auth(MANAGE_ROLES), listProperties);

// Get one property
router.get("/:id", auth(MANAGE_ROLES), getPropertyById);

export default router;
