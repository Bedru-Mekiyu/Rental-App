const Unit = require("../models/Unit");

exports.createUnit = async (req, res) => {
  try {
    const data = req.body;
    const unit = await Unit.create(data);
    res.status(201).json({ success: true, data: unit });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getUnits = async (req, res) => {
  try {
    const filters = {
      isDeleted: false,
      ...req.query,
    };

    if (filters.floor) filters.floor = Number(filters.floor);
    if (filters.basePriceEtb) filters.basePriceEtb = Number(filters.basePriceEtb);

    const units = await Unit.find(filters);
    res.json({ success: true, data: units });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUnitById = async (req, res) => {
  try {
    const unit = await Unit.findOne({ _id: req.params.id, isDeleted: false });
    if (!unit) return res.status(404).json({ success: false, message: "Unit not found" });

    res.json({ success: true, data: unit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUnit = async (req, res) => {
  try {
    const unit = await Unit.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true }
    );

    if (!unit) return res.status(404).json({ success: false, message: "Unit not found" });

    res.json({ success: true, data: unit });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.softDeleteUnit = async (req, res) => {
  try {
    const unit = await Unit.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true }
    );

    if (!unit) return res.status(404).json({ success: false, message: "Unit not found" });

    res.json({ success: true, message: "Unit soft deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
