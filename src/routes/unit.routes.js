// src/routes/unit.routes.js (ESM)

import { Router } from "express";
import {
  createUnit,
  getUnits,
  getUnitById,
  updateUnit,
  softDeleteUnit,
} from "../controllers/unitController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

// Allowed roles for restricted operations
const ADMIN_PM = ["ADMIN", "PM"];

// CREATE UNIT
router.post("/", auth(ADMIN_PM), createUnit);

// GET ALL UNITS
router.get("/", auth(), getUnits);

// GET ONE UNIT
router.get("/:id", auth(), getUnitById);

// UPDATE UNIT
router.put("/:id", auth(ADMIN_PM), updateUnit);

// SOFT DELETE UNIT
router.delete("/:id", auth(ADMIN_PM), softDeleteUnit);

export default router;
