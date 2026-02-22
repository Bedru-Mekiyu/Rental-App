// src/controllers/authController.js (ESM)

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import { logAction } from "../utils/auditLogger.js";

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || "30m";
const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7);

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

async function issueRefreshToken(userId) {
  const rawToken = crypto.randomBytes(64).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  await RefreshToken.create({
    userId,
    tokenHash,
    expiresAt,
  });

  return rawToken;
}

function issueAccessToken(user) {
  const payload = { id: user._id, role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

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
      success: true,
      data: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("registerAdmin error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to register admin" });
  }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // block non‑active accounts
    if (user.status !== "ACTIVE") {
      return res
        .status(403)
        .json({ success: false, message: "Account not active" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = issueAccessToken(user);
    const refreshToken = await issueRefreshToken(user._id);

    await logAction({
      userId: user._id,
      action: "AUTH_LOGIN_SUCCESS",
      entityType: "USER",
      entityId: user._id,
      details: { email: user.email, role: user.role },
    });

    return res.json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    console.error("login error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to login" });
  }
}

export async function logout(req, res) {
  try {
    const { refreshToken } = req.body || {};

    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await RefreshToken.findOneAndUpdate(
        { tokenHash, revokedAt: null },
        { revokedAt: new Date() }
      );
    }

    return res.json({ success: true, message: "Logout successful" });
  } catch (err) {
    console.error("logout error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to logout" });
  }
}

export async function refreshAccessToken(req, res) {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
      return res
        .status(400)
        .json({ success: false, message: "refreshToken is required" });
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await RefreshToken.findOne({ tokenHash });

    if (!stored || stored.revokedAt) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }

    if (stored.expiresAt < new Date()) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token expired" });
    }

    const user = await User.findById(stored.userId);
    if (!user || user.status !== "ACTIVE") {
      return res
        .status(401)
        .json({ success: false, message: "User not active" });
    }

    const newAccessToken = issueAccessToken(user);
    const newRefreshToken = await issueRefreshToken(user._id);
    const newTokenHash = hashToken(newRefreshToken);

    stored.revokedAt = new Date();
    stored.replacedByTokenHash = newTokenHash;
    await stored.save();

    return res.json({
      success: true,
      data: {
        token: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (err) {
    console.error("refreshAccessToken error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to refresh token" });
  }
}
