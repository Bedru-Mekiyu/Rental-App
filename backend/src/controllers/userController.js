// src/controllers/userController.js (ESM)

import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { logAction } from "../utils/auditLogger.js";

// POST /api/users
export async function createUser(req, res) {
  try {
    const { fullName, email, phone, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      phone,
      passwordHash,
      role,
      status: "ACTIVE",
    });

    await logAction({
      userId: req.user.id,
      action: "USER_CREATE",
      entityType: "USER",
      entityId: user._id,
      details: { email: user.email, role: user.role },
    });

    return res.status(201).json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    });
  } catch (err) {
    console.error("createUser error:", err);
    return res.status(500).json({ message: "Failed to create user" });
  }
}

// GET /api/users
export async function listUsers(req, res) {
  try {
    const { role, status } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    const users = await User.find(filter).select(
      "fullName email phone role status createdAt"
    );

    return res.json(users);
  } catch (err) {
    console.error("listUsers error:", err);
    return res.status(500).json({ message: "Failed to list users" });
  }
}

// GET /api/users/:id
export async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.id).select(
      "fullName email phone role status createdAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    console.error("getUserById error:", err);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
}

// PATCH /api/users/:id
export async function updateUser(req, res) {
  try {
    const { fullName, phone, role, status } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;

    await user.save();

    await logAction({
      userId: req.user.id,
      action: "USER_UPDATE",
      entityType: "USER",
      entityId: user._id,
      details: { role: user.role, status: user.status },
    });

    return res.json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    });
  } catch (err) {
    console.error("updateUser error:", err);
    return res.status(500).json({ message: "Failed to update user" });
  }
}

// DELETE /api/users/:id (soft delete -> INACTIVE)
export async function deactivateUser(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

  user.status = "SUSPENDED"; 
    await user.save();

    await logAction({
      userId: req.user.id,
      action: "USER_DEACTIVATE",
      entityType: "USER",
      entityId: user._id,
      details: { status: user.status },
    });

    return res.json({ message: "User deactivated successfully" });
  } catch (err) {
    console.error("deactivateUser error:", err);
    return res.status(500).json({ message: "Failed to deactivate user" });
  }
}

// POST /api/users/me/change-password
export async function changeOwnPassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    await logAction({
      userId: user._id,
      action: "USER_CHANGE_PASSWORD",
      entityType: "USER",
      entityId: user._id,
      details: {},
    });

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("changeOwnPassword error:", err);
    return res.status(500).json({ message: "Failed to change password" });
  }
}
