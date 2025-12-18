const express = require("express");
const router = express.Router();

const {
  createUnit,
  getUnits,
  getUnitById,
  updateUnit,
  softDeleteUnit,
} = require("../controllers/unitController");

const auth = require("../middleware/auth");

// Allowed roles for restricted operations
const ADMIN_PM = ["ADMIN", "PM"];

// CREATE UNIT
router.post("/", auth(ADMIN_PM), createUnit);

// GET ALL UNITS (public or adjust if needed)
router.get("/", auth(), getUnits);

// GET ONE UNIT
router.get("/:id", auth(), getUnitById);

// UPDATE UNIT
router.put("/:id", auth(ADMIN_PM), updateUnit);

// SOFT DELETE UNIT
router.delete("/:id", auth(ADMIN_PM), softDeleteUnit);

module.exports = router;
