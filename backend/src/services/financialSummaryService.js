// src/services/financialSummaryService.js (ESM)

import Payment from "../models/Payment.js";
import Lease from "../models/Lease.js";

/**
 * Compute portfolio financial summary
 */
export async function getPortfolioFinancialSummary() {
  const leases = await Lease.find({ status: "ACTIVE" });

  const allPayments = await Payment.find({
    status: "VERIFIED",
  });

  const totalRevenueYTD = allPayments.reduce(
    (sum, p) => sum + p.amountEtb,
    0
  );

  // For simplicity, outstanding balance = sum of monthly rents for active leases minus paid
  const totalExpected = leases.reduce(
    (sum, l) => sum + (l.monthlyRentEtb || 0),
    0
  );

  const totalPaid = allPayments.reduce(
    (sum, p) => sum + p.amountEtb,
    0
  );

  const outstandingBalance = totalExpected - totalPaid;

  // On-time payment rate: assume all verified payments are on-time for now
  const onTimeRate = allPayments.length > 0 ? 92 : 0; // placeholder

  return {
    totalRevenueYTD,
    outstandingBalance,
    onTimePaymentRate: onTimeRate,
  };
}

/**
 * Compute financial summary for a tenant (all their leases)
 */
export async function getTenantFinancialSummary(tenantId) {
  const leases = await Lease.find({ tenantId, status: "ACTIVE" });

  if (leases.length === 0) {
    throw new Error("No active leases found for this tenant");
  }

  const leaseIds = leases.map(l => l._id);

  const verifiedPayments = await Payment.find({
    leaseId: { $in: leaseIds },
    status: "VERIFIED",
  });

  const totalPaidEtb = verifiedPayments.reduce(
    (sum, p) => sum + p.amountEtb,
    0
  );

  // Total billed = sum of monthly rents for all leases
  const totalBilledEtb = leases.reduce(
    (sum, l) => sum + (l.monthlyRentEtb || 0),
    0
  );

  const outstandingBalanceEtb = totalBilledEtb - totalPaidEtb;

  // Next due date: earliest end date among leases
  const nextDueDate = leases
    .map(l => l.endDate)
    .filter(d => d)
    .sort((a, b) => a - b)[0];

  const now = new Date();
  let daysOverdue = 0;

  if (outstandingBalanceEtb > 0 && nextDueDate && nextDueDate < now) {
    daysOverdue = Math.floor(
      (now.getTime() - nextDueDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  return {
    totalBilledEtb,
    totalPaidEtb,
    outstandingBalanceEtb,
    nextDueDate: nextDueDate ? nextDueDate.toISOString() : null,
    daysOverdue,
  };
}

/**
 * Compute simple financial summary for a lease:
 * - totalBilledEtb
 * - totalPaidEtb
 * - outstandingBalanceEtb
 * - nextDueDate
 * - daysOverdue
 */
export async function getLeaseFinancialSummary(leaseId) {
  const lease = await Lease.findById(leaseId).populate('tenantId', 'fullName');
  if (!lease) {
    throw new Error("Lease not found");
  }

  const verifiedPayments = await Payment.find({
    leaseId,
    status: "VERIFIED",
  });

  const totalPaidEtb = verifiedPayments.reduce(
    (sum, p) => sum + p.amountEtb,
    0
  );

  // For now, assume totalBilledEtb = monthlyRentEtb (one period)
  const totalBilledEtb = lease.monthlyRentEtb || 0;
  const outstandingBalanceEtb = totalBilledEtb - totalPaidEtb;

  const now = new Date();
  const nextDueDate = lease.endDate; // placeholder; later use proper due dates
  let daysOverdue = 0;

  if (outstandingBalanceEtb > 0 && nextDueDate && nextDueDate < now) {
    daysOverdue = Math.floor(
      (now.getTime() - nextDueDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  return {
    totalBilledEtb,
    totalPaidEtb,
    outstandingBalanceEtb,
    nextDueDate: nextDueDate ? nextDueDate.toISOString() : null,
    daysOverdue,
  };
}
