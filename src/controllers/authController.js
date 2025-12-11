const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { logAction } = require("../utils/auditLogger");

exports.registerAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingAdmin = await User.findOne({ role: "ADMIN" });
    if (existingAdmin) {
      return res.status(403).json({ message: "Admin already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await User.create({
      fullName,
      email,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    });

    await logAction({
      userId: admin._id,
      action: "REGISTER_ADMIN",
      entityType: "USER",
      entityId: admin._id,
      details: { email: admin.email, role: admin.role },
    });

    return res.status(201).json({
      id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role,
    });
  } catch (err) {
    console.error("registerAdmin error:", err);
    return res.status(500).json({ message: "Failed to register admin" });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "30m", // matches 30-minute inactivity requirement roughly
    });

    await logAction({
      userId: user._id,
      action: "AUTH_LOGIN_SUCCESS",
      entityType: "USER",
      entityId: user._id,
      details: { email: user.email, role: user.role },
    });

    return res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Failed to login" });
  }
};
exports.logout = async (req, res) => {
  try {
    return res.json({ message: "Logout successful" });
  } catch (err) {
    console.error("logout error:", err);
    return res.status(500).json({ message: "Failed to login" });
  }
};
