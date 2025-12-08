// src/controllers/leaseController.js
const Lease = require('../models/Lease');
const Unit = require('../models/Unit');
const { logAction } = require('../utils/auditLogger');

// simple placeholder pricing function; replace with real service if you have one
async function getBaseRentForUnit(unit) {
  // You can implement inverted floor logic here if needed
  return unit.basePriceEtb;
}

/**
 * POST /api/leases
 * Roles: PM, ADMIN
 * Create a lease linking unit + tenant, computing monthly rent
 */
exports.createLease = async (req, res) => {
  try {
    const { unitId, tenantId, startDate, endDate, taxRate } = req.body;

    if (!unitId || !tenantId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const unit = await Unit.findById(unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    const monthlyRentEtb = await getBaseRentForUnit(unit);

    const lease = await Lease.create({
      unitId,
      tenantId,
      managerId: req.user.id, // the PM creating this lease
      startDate,
      endDate,
      monthlyRentEtb,
      taxRate: taxRate || 0,
      status: 'ACTIVE',
    });

    // update unit status to OCCUPIED
    unit.status = 'OCCUPIED';
    await unit.save();

    await logAction({
      userId: req.user.id,
      action: 'LEASE_CREATE',
      entityType: 'LEASE',
      entityId: lease._id,
      details: { unitId: lease.unitId, tenantId: lease.tenantId },
    });

    return res.status(201).json(lease);
  } catch (err) {
    console.error('createLease error:', err);
    return res.status(500).json({ message: 'Failed to create lease' });
  }
};

/**
 * GET /api/leases/:id
 * Roles: PM, ADMIN, FS, GM, TENANT (depending on your policy)
 */
exports.getLeaseById = async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.id)
      .populate('unitId')
      .populate('tenantId', 'fullName email');

    if (!lease) {
      return res.status(404).json({ message: 'Lease not found' });
    }

    return res.json(lease);
  } catch (err) {
    console.error('getLeaseById error:', err);
    return res.status(500).json({ message: 'Failed to fetch lease' });
  }
};

/**
 * GET /api/leases/by-tenant/:tenantId
 */
exports.listLeasesByTenant = async (req, res) => {
  try {
    const leases = await Lease.find({ tenantId: req.params.tenantId })
      .populate('unitId');

    return res.json(leases);
  } catch (err) {
    console.error('listLeasesByTenant error:', err);
    return res.status(500).json({ message: 'Failed to fetch leases' });
  }
};

/**
 * PATCH /api/leases/:id/end
 * Mark lease as ENDED and free the unit
 */
exports.endLease = async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.id);
    if (!lease) {
      return res.status(404).json({ message: 'Lease not found' });
    }

    lease.status = 'ENDED';
    await lease.save();

    // set unit back to VACANT
    const unit = await Unit.findById(lease.unitId);
    if (unit) {
      unit.status = 'VACANT';
      await unit.save();
    }

    await logAction({
      userId: req.user.id,
      action: 'LEASE_END',
      entityType: 'LEASE',
      entityId: lease._id,
      details: { unitId: lease.unitId, tenantId: lease.tenantId },
    });

    return res.json(lease);
  } catch (err) {
    console.error('endLease error:', err);
    return res.status(500).json({ message: 'Failed to end lease' });
  }
};
