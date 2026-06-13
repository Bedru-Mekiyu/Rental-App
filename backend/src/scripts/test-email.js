// Manual email testing script
// Usage: node src/scripts/test-email.js

import { initializeEmailService } from "../config/email.config.js"
import { sendPaymentVerificationAlert, sendLeaseExpirationWarning } from "../services/emailService.js"

async function testEmails() {
  try {
    console.log("[Test] Initializing email service...")
    await initializeEmailService()

    // Test 1: Payment verification alert
    const mockPM = {
      email: process.env.TEST_EMAIL || "admin@example.com",
      name: "Test PM",
    }

    const mockPayment = {
      _id: "test-payment-123",
      leaseId: "LEASE-001",
      amountEtb: 5000,
      paymentMethod: "BANK_TRANSFER",
      status: "PENDING",
    }

    console.log("\n[Test] Sending payment verification alert...")
    const result1 = await sendPaymentVerificationAlert(mockPayment, mockPM)
    console.log("[Test] Result:", result1)

    // Test 2: Lease expiration warning
    const mockTenant = {
      email: process.env.TEST_EMAIL || "tenant@example.com",
      fullName: "Test Tenant",
    }

    const mockLease = {
      _id: "test-lease-123",
      unitId: "UNIT-A01",
      monthlyRentEtb: 3000,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    }

    console.log("\n[Test] Sending lease expiration warning...")
    const result2 = await sendLeaseExpirationWarning(mockLease, mockTenant, 7)
    console.log("[Test] Result:", result2)

    console.log("\n[Test] All tests completed successfully!")
    process.exit(0)
  } catch (err) {
    console.error("[Test] Error:", err.message)
    process.exit(1)
  }
}

testEmails()
