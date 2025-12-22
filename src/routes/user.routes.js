// src/routes/user.routes.js (ESM)

import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deactivateUser,
  changeOwnPassword,
} from "../controllers/userController.js";
import {
  validateCreateUser,
  validateUpdateUser,
  validateChangePassword,
} from "../middleware/validators.js";
import { User } from "../models/User.js";
import { logAction } from "../utils/auditLogger.js";

const router = Router();

// ADMIN/PM can create staff or tenant accounts
router.post("/", auth(["ADMIN", "PM"]), validateCreateUser, createUser);

// ADMIN/PM/GM can list all users
router.get("/", auth(["ADMIN", "PM", "GM"]), listUsers);

// ADMIN/PM/GM can view single user
router.get("/:id", auth(["ADMIN", "PM", "GM"]), getUserById);

// ADMIN/PM can update user profile/role/status
router.patch(
  "/:id",
  auth(["ADMIN", "PM"]),
  validateUpdateUser,
  updateUser
);

// ADMIN can deactivate user (set status = SUSPENDED)
router.delete("/:id", auth(["ADMIN"]), deactivateUser);

// ADMIN can reactivate user (set status = ACTIVE)
router.post("/:id/reactivate", auth(["ADMIN"]), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = "ACTIVE";
    await user.save();

    await logAction({
      userId: req.user.id,
      action: "USER_REACTIVATE",
      entityType: "USER",
      entityId: user._id,
      details: { status: user.status },
    });

    return res.json({ message: "User reactivated successfully" });
  } catch (err) {
    console.error("reactivateUser error:", err);
    return res.status(500).json({ message: "Failed to reactivate user" });
  }
});

// any logged‑in user can change own password
router.post(
  "/me/change-password",
  auth(), // all roles
  validateChangePassword,
  changeOwnPassword
);

export default router;
