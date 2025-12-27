// src/routes/payment.routes.js (ESM)

import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  createPayment,
  updatePaymentStatus,
  listByLease,
  listByTenant,
} from "../controllers/paymentController.js";

const router = Router();

const ALLOWED_ROLES = ["PM", "ADMIN"];

router.post("/", auth(ALLOWED_ROLES), createPayment);

router.patch("/:id/status", auth(ALLOWED_ROLES), updatePaymentStatus);

router.get("/by-lease/:leaseId", auth(ALLOWED_ROLES), listByLease);

router.get("/by-tenant/:tenantId", auth(ALLOWED_ROLES), listByTenant);

export default router;
