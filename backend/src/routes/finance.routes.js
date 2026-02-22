// src/routes/finance.routes.js (ESM)

import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { getLeaseSummary, getPortfolioSummary, getTenantSummary } from "../controllers/financeController.js";

const router = Router();

// FS, PM, GM, ADMIN can view summaries
const ALLOWED_ROLES = ["FS", "PM", "GM", "ADMIN"];

router.get(
  "/portfolio/summary",
  auth(ALLOWED_ROLES),
  getPortfolioSummary
);

router.get(
  "/tenant/:tenantId/summary",
  auth(ALLOWED_ROLES),
  getTenantSummary
);

router.get(
  "/lease/:leaseId/summary",
  auth(ALLOWED_ROLES),
  getLeaseSummary
);

export default router;
