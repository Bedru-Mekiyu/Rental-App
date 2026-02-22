// src/controllers/financeController.js (ESM)

import { getLeaseFinancialSummary, getPortfolioFinancialSummary, getTenantFinancialSummary } from "../services/financialSummaryService.js";

export async function getLeaseSummary(req, res) {
  try {
    const { leaseId } = req.params;
    const summary = await getLeaseFinancialSummary(leaseId);
    return res.json(summary);
  } catch (err) {
    console.error("getLeaseSummary error:", err);
    if (err.message === "Lease not found") {
      return res.status(404).json({ message: "Lease not found" });
    }
    return res
      .status(500)
      .json({ message: "Failed to compute financial summary" });
  }
}

export async function getPortfolioSummary(req, res) {
  try {
    const summary = await getPortfolioFinancialSummary();
    return res.json(summary);
  } catch (err) {
    console.error("getPortfolioSummary error:", err);
    return res
      .status(500)
      .json({ message: "Failed to compute portfolio summary" });
  }
}

export async function getTenantSummary(req, res) {
  try {
    const { tenantId } = req.params;
    const summary = await getTenantFinancialSummary(tenantId);
    return res.json(summary);
  } catch (err) {
    console.error("getTenantSummary error:", err);
    if (err.message === "No active leases found for this tenant") {
      return res.status(404).json({ message: "No active leases found for this tenant" });
    }
    return res
      .status(500)
      .json({ message: "Failed to compute tenant financial summary" });
  }
}
