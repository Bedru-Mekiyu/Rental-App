// src/controllers/authController.js (ESM)

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { logAction } from "../utils/auditLogger.js";

export async function registerAdmin(req, res) {
  try {
    const { fullName, email, password } = req.body;

    // const existingAdmin = await User.findOne({ role: "ADMIN" });
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(403).json({ message: "Admin already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await User.create({
      fullName,
      email,
      passwordHash,
      role: "TENANT",
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
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // block non‑active accounts
    if (user.status !== "ACTIVE") {
      return res.status(403).json({ message: "Account not active" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "30m", // ~30 minutes
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
}

export async function logout(req, res) {
  try {
    // stateless JWT: client just discards token
    return res.json({ message: "Logout successful" });
  } catch (err) {
    console.error("logout error:", err);
    return res.status(500).json({ message: "Failed to logout" });
  }
}
