import Invoice from "../models/Invoice.js"
import PaymentSchedule from "../models/PaymentSchedule.js"
import Lease from "../models/Lease.js"
import crypto from "crypto"

export async function generateInvoice(leaseId, userId) {
  try {
    const lease = await Lease.findById(leaseId)
    if (!lease) throw new Error("Lease not found")

    const schedule = await PaymentSchedule.findOne({ leaseId, isActive: true })
    if (!schedule) throw new Error("Payment schedule not configured")

    const invoiceNumber = `INV-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`
    const dueDate = new Date(schedule.nextBillingDate)
    dueDate.setDate(dueDate.getDate() + 7)

    const invoice = await Invoice.create({
      leaseId,
      tenantId: lease.tenantId,
      invoiceNumber,
      dueDate,
      amountEtb: lease.monthlyRentEtb,
      lineItems: [
        {
          description: "Monthly Rent",
          quantity: 1,
          unitPrice: lease.monthlyRentEtb,
          total: lease.monthlyRentEtb,
        },
      ],
      issuedAt: new Date(),
      issuedBy: userId,
      status: "ISSUED",
    })

    await PaymentSchedule.updateOne(
      { leaseId },
      {
        lastInvoiceDate: new Date(),
        nextBillingDate: calculateNextBillingDate(schedule.nextBillingDate, schedule.billingCycle),
      },
    )

    return invoice
  } catch (err) {
    throw new Error(`Invoice generation failed: ${err.message}`)
  }
}

function calculateNextBillingDate(currentDate, cycle) {
  const next = new Date(currentDate)

  switch (cycle) {
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1)
      break
    case "QUARTERLY":
      next.setMonth(next.getMonth() + 3)
      break
    case "ANNUALLY":
      next.setFullYear(next.getFullYear() + 1)
      break
  }

  return next
}

export async function createPaymentSchedule(leaseId, billingCycle = "MONTHLY", billingDay = 1) {
  const allowedCycles = new Set(["MONTHLY", "QUARTERLY", "ANNUALLY"])
  if (!allowedCycles.has(billingCycle)) {
    throw new Error("Invalid billing cycle")
  }

  const now = new Date()
  const nextBillingDate = new Date(now.getFullYear(), now.getMonth(), billingDay)

  if (nextBillingDate <= now) {
    if (billingCycle === "MONTHLY") nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
    if (billingCycle === "QUARTERLY") nextBillingDate.setMonth(nextBillingDate.getMonth() + 3)
    if (billingCycle === "ANNUALLY") nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1)
  }

  return await PaymentSchedule.create({
    leaseId,
    billingCycle,
    billingDay,
    nextBillingDate,
    isActive: true,
  })
}

export async function updateInvoiceStatus(invoiceId, status) {
  return await Invoice.findByIdAndUpdate(invoiceId, { status }, { new: true })
}
