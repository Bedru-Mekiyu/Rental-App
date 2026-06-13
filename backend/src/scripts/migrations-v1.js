// src/scripts/migrations-v1.js (ESM)
// Run this once to add production-ready indexes and constraints

import mongoose from "mongoose"
import Unit from "../models/Unit.js"
import Lease from "../models/Lease.js"
import Payment from "../models/Payment.js"
import Property from "../models/Property.js"
import MaintenanceRequest from "../models/MaintenanceRequest.js"
import IdempotencyKey from "../models/IdempotencyKey.js"

async function runMigrations() {
  try {
    console.log("Starting migrations...")

    // Unit Indexes - for property management queries
    await Unit.collection.createIndex({ propertyId: 1, status: 1 })
    await Unit.collection.createIndex({ propertyId: 1, unitNumber: 1 }, { unique: true, sparse: true })
    await Unit.collection.createIndex({ currentTenantId: 1 })
    console.log("Unit indexes created")

    // Lease Indexes - prevent duplicate active leases
    await Lease.collection.createIndex(
      { unitId: 1, status: 1 },
      {
        unique: true,
        sparse: true,
        partialFilterExpression: { status: "ACTIVE", isDeleted: false },
      },
    )
    await Lease.collection.createIndex({ tenantId: 1, status: 1 })
    await Lease.collection.createIndex({ propertyId: 1, startDate: -1 })
    console.log("Lease indexes created")

    // Payment Indexes - for transaction history and verification
    await Payment.collection.createIndex({ leaseId: 1, createdAt: -1 })
    await Payment.collection.createIndex({ tenantId: 1, status: 1 })
    await Payment.collection.createIndex({ externalTransactionId: 1 }, { unique: true, sparse: true })
    await Payment.collection.createIndex({ status: 1, createdAt: -1 })
    console.log("Payment indexes created")

    // Property Indexes - for manager queries
    await Property.collection.createIndex({ managerId: 1 })
    console.log("Property indexes created")

    // Maintenance Indexes - for status tracking
    await MaintenanceRequest.collection.createIndex({ unitId: 1, status: 1 })
    await MaintenanceRequest.collection.createIndex({ requestedBy: 1 })
    console.log("Maintenance indexes created")

    // IdempotencyKey TTL Index - auto-cleanup after 24 hours
    await IdempotencyKey.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    console.log("IdempotencyKey TTL index created")

    console.log("All migrations completed successfully")
    process.exit(0)
  } catch (err) {
    console.error("Migration failed:", err.message)
    process.exit(1)
  }
}

// Connect and run
mongoose.connect(process.env.MONGODB_URI).then(runMigrations)
