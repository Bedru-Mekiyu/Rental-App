// src/controllers/financeController.js

const { getLeaseFinancialSummary } = require('../services/financialSummaryService');

exports.getLeaseSummary = async (req, res) => {
  try {
    const { leaseId } = req.params;
    const summary = await getLeaseFinancialSummary(leaseId);
    return res.json(summary);
  } catch (err) {
    console.error('getLeaseSummary error:', err);
    if (err.message === 'Lease not found') {
      return res.status(404).json({ message: 'Lease not found' });
    }
    return res.status(500).json({ message: 'Failed to compute financial summary' });
  }
};
