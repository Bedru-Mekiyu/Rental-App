import PaymentReconciliation from "../models/PaymentReconciliation.js"
import Payment from "../models/Payment.js"
import Lease from "../models/Lease.js"

export async function generateReconciliationReport(leaseId) {
  try {
    const lease = await Lease.findById(leaseId)
    if (!lease) throw new Error("Lease not found")

    const payments = await Payment.find({
      leaseId,
      status: { $in: ["VERIFIED", "PENDING"] },
      isDeleted: false,
    })

    const startDate = lease.startDate
    const endDate = new Date()
    const monthsElapsed = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24 * 30))
    const totalExpected = lease.monthlyRentEtb * monthsElapsed

    const verifiedPayments = payments.filter((p) => p.status === "VERIFIED")
    const totalReceived = verifiedPayments.reduce((sum, p) => sum + p.amountEtb, 0)
    const totalOverdue = Math.max(totalExpected - totalReceived, 0)

    const discrepancies = await detectDiscrepancies(payments, lease)

    const reconciliation = await PaymentReconciliation.create({
      leaseId,
      tenantId: lease.tenantId,
      reconciliationPeriod: { startDate, endDate },
      totalExpected,
      totalReceived,
      totalOverdue,
      discrepancies,
      status: "PENDING",
    })

    return reconciliation
  } catch (err) {
    throw new Error(`Reconciliation failed: ${err.message}`)
  }
}

async function detectDiscrepancies(payments, lease) {
  const discrepancies = []

  const partialPayments = payments.filter((p) => p.amountEtb > 0 && p.amountEtb < lease.monthlyRentEtb)
  if (partialPayments.length > 0) {
    discrepancies.push({
      description: "Partial payments detected",
      amount: partialPayments.reduce((sum, p) => sum + p.amountEtb, 0),
      status: "REPORTED",
      reportedAt: new Date(),
    })
  }

  const duplicateAmounts = payments
    .map((p) => p.amountEtb)
    .filter((amount, index, self) => self.indexOf(amount) !== index)
  if (duplicateAmounts.length > 0) {
    discrepancies.push({
      description: "Duplicate payment amounts detected",
      amount: duplicateAmounts[0],
      status: "REPORTED",
      reportedAt: new Date(),
    })
  }

  return discrepancies
}

export async function resolveDiscrepancy(reconciliationId, discrepancyIndex, resolution) {
  const reconciliation = await PaymentReconciliation.findById(reconciliationId)
  if (!reconciliation) throw new Error("Reconciliation not found")

  if (discrepancyIndex < 0 || discrepancyIndex >= reconciliation.discrepancies.length) {
    throw new Error("Invalid discrepancy index")
  }

  reconciliation.discrepancies[discrepancyIndex].status = "RESOLVED"
  reconciliation.discrepancies[discrepancyIndex].resolvedAt = new Date()

  const allResolved = reconciliation.discrepancies.every((d) => d.status === "RESOLVED")
  if (allResolved) {
    reconciliation.status = "RECONCILED"
  }

  await reconciliation.save()
  return reconciliation
}
