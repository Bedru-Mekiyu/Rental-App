// src/controllers/unitController.js (ESM)

import Unit from "../models/Unit.js";
import { buildPaginationMeta, getPagination } from "../utils/pagination.js";

export async function createUnit(req, res) {
  try {
    const data = req.body;
    const unit = await Unit.create(data);
    res.status(201).json({ success: true, data: unit });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: err.message });
  }
}

export async function getUnits(req, res) {
  try {
    const { page, limit, skip } = getPagination(req);
    const { page: _page, limit: _limit, ...rest } = req.query;
    const filters = {
      isDeleted: false,
      ...rest,
    };

    if (filters.floor) filters.floor = Number(filters.floor);
    if (filters.basePriceEtb) filters.basePriceEtb = Number(filters.basePriceEtb);

    const [units, total] = await Promise.all([
      Unit.find(filters).skip(skip).limit(limit),
      Unit.countDocuments(filters),
    ]);
    res.json({
      success: true,
      data: units,
      meta: buildPaginationMeta({ page, limit, total }),
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err.message });
  }
}

export async function getUnitById(req, res) {
  try {
    const unit = await Unit.findOne({ _id: req.params.id, isDeleted: false });
    if (!unit)
      return res
        .status(404)
        .json({ success: false, message: "Unit not found" });

    res.json({ success: true, data: unit });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err.message });
  }
}

export async function updateUnit(req, res) {
  try {
    const unit = await Unit.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true }
    );

    if (!unit)
      return res
        .status(404)
        .json({ success: false, message: "Unit not found" });

    res.json({ success: true, data: unit });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: err.message });
  }
}

export async function softDeleteUnit(req, res) {
  try {
    const unit = await Unit.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true }
    );

    if (!unit)
      return res
        .status(404)
        .json({ success: false, message: "Unit not found" });

    res.json({ success: true, message: "Unit soft deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err.message });
  }
}
