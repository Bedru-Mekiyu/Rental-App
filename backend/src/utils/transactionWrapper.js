// src/utils/transactionWrapper.js (ESM)
// Ensures atomic operations for critical business logic

import mongoose from "mongoose"

/**
 * Safe lease creation with transaction
 * Ensures unit status update doesn't fail independently
 */
export async function createLeaseWithTransaction({
  unitId,
  tenantId,
  propertyId,
  startDate,
  endDate,
  monthlyRentEtb,
  securityDepositEtb,
}) {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const Unit = mongoose.model("Unit")
    const Lease = mongoose.model("Lease")

    const unit = await Unit.findById(unitId).session(session)
    if (!unit || unit.isDeleted) {
      throw new Error("Unit not found")
    }

    if (unit.propertyId?.toString() !== propertyId.toString()) {
      throw new Error("Unit does not belong to property")
    }

    if (!["VACANT", "OCCUPIED"].includes(unit.status)) {
      throw new Error("Unit is not available")
    }

    // Check unit is available (within same transaction)
    const existingLease = await Lease.findOne({
      unitId,
      status: "ACTIVE",
      endDate: { $gte: new Date() },
    }).session(session)

    if (existingLease) {
      throw new Error("Unit already has an active lease")
    }

    // Create lease
    const lease = await Lease.create(
      [
        {
          unitId,
          tenantId,
          propertyId,
          startDate,
          endDate,
          monthlyRentEtb,
          securityDepositEtb,
          status: "ACTIVE",
        },
      ],
      { session },
    )

    // Update unit status BEFORE lease is committed
    await Unit.findByIdAndUpdate(
      unitId,
      {
        status: "OCCUPIED",
        currentTenantId: tenantId,
      },
      { session, new: true },
    )

    await session.commitTransaction()
    return lease[0]
  } catch (err) {
    await session.abortTransaction()
    throw err
  } finally {
    await session.endSession()
  }
}

/**
 * Safe payment creation with verification
 * Only PM/ADMIN can mark as VERIFIED
 * Ensures lease exists
 */
export async function createPaymentWithTransaction({
  leaseId,
  tenantId,
  amountEtb,
  paymentMethod,
  externalTransactionId,
  userId,
  idempotencyKey,
}) {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const Lease = mongoose.model("Lease")
    const Payment = mongoose.model("Payment")
    const IdempotencyKey = mongoose.model("IdempotencyKey")

    // Check idempotency
    const existingKey = await IdempotencyKey.findOne({
      key: idempotencyKey,
      userId,
    }).session(session)

    if (existingKey) {
      await session.abortTransaction()
      return existingKey.result // Return cached result
    }

    // Verify lease exists and is active
    const lease = await Lease.findById(leaseId).session(session)
    if (!lease || lease.status !== "ACTIVE") {
      throw new Error("Invalid or inactive lease")
    }

    // Verify tenant
    if (lease.tenantId?.toString() !== tenantId.toString()) {
      throw new Error("Tenant mismatch")
    }

    // Create payment
    const payment = await Payment.create(
      [
        {
          leaseId,
          tenantId,
          amountEtb,
          paymentMethod,
          externalTransactionId,
          status: "PENDING",
          verifiedBy: null,
          verifiedAt: null,
        },
      ],
      { session },
    )

    // Store idempotency key
    await IdempotencyKey.create(
      [
        {
          key: idempotencyKey,
          userId,
          result: payment[0],
        },
      ],
      { session },
    )

    await session.commitTransaction()
    return payment[0]
  } catch (err) {
    await session.abortTransaction()
    throw err
  } finally {
    await session.endSession()
  }
}

/**
 * Safe lease termination
 * Mark lease as terminated, update unit status
 */
export async function terminateLeaseWithTransaction(leaseId, userId, userRole) {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const Lease = mongoose.model("Lease")
    const Unit = mongoose.model("Unit")

    const lease = await Lease.findById(leaseId).session(session)
    if (!lease) throw new Error("Lease not found")

    // Terminate lease
    const updatedLease = await Lease.findByIdAndUpdate(
      leaseId,
      {
        status: "TERMINATED",
        endDate: new Date(),
        terminatedBy: userId,
        terminatedAt: new Date(),
      },
      { session, new: true },
    )

    // Mark unit as VACANT
    await Unit.findByIdAndUpdate(
      lease.unitId,
      {
        status: "VACANT",
        currentTenantId: null,
      },
      { session },
    )

    await session.commitTransaction()
    return updatedLease
  } catch (err) {
    await session.abortTransaction()
    throw err
  } finally {
    await session.endSession()
  }
}
