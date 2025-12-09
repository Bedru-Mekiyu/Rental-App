// src/services/financialSummaryService.js

const Payment = require('../models/Payment');
const Lease = require('../models/Lease');

/**
 * Compute simple financial summary for a lease:
 * - totalPaid
 * - expected (currently one month; extend later to multiple periods)
 * - balance
 * - overdue bucket (CURRENT, 0-30, 31-60, 61-90, 90+)
 */
async function getLeaseFinancialSummary(leaseId) {
  const lease = await Lease.findById(leaseId);
  if (!lease) {
    throw new Error('Lease not found');
  }

  const verifiedPayments = await Payment.find({
    leaseId,
    status: 'VERIFIED',
  });

  const totalPaid = verifiedPayments.reduce(
    (sum, p) => sum + p.amountEtb,
    0
  );

  // For now, assume expected amount = monthlyRentEtb (one period)
  const expected = lease.monthlyRentEtb || 0;
  const balance = expected - totalPaid;

  const now = new Date();
  const dueDate = lease.endDate; // placeholder; later you can use invoice due dates
  let overdueDays = 0;
  let bucket = 'CURRENT';

  if (balance > 0 && dueDate && dueDate < now) {
    overdueDays = Math.floor(
      (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (overdueDays <= 30) bucket = '0-30';
    else if (overdueDays <= 60) bucket = '31-60';
    else if (overdueDays <= 90) bucket = '61-90';
    else bucket = '90+';
  }

  return {
    leaseId,
    totalPaid,
    expected,
    balance,
    overdueDays,
    bucket,
  };
}

module.exports = { getLeaseFinancialSummary };
