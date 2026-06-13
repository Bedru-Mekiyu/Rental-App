import { initiateChapaPayment, initiateTelebirrPayment, initiateBellPayment } from "../services/mobileMoneyService.js"
import Payment from "../models/Payment.js"
import Lease from "../models/Lease.js"
import { logAction } from "../services/logActionService.js"
import User from "../models/User.js"

export async function initiateMobileMoneyPayment(req, res) {
  let payment

  try {
    const { leaseId, paymentMethod, amount } = req.body
    const userId = req.user._id

    const lease = await Lease.findById(leaseId)
    if (!lease) return res.status(404).json({ message: "Lease not found" })

    if (lease.tenantId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Can only pay own lease" })
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount" })
    }

    if (!["CHAPA", "TELEBIRR", "BELL"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Unsupported mobile money provider" })
    }

    const tenant = await User.findById(userId)
    if (!tenant.phoneNumber) {
      return res.status(400).json({ message: "Phone number not configured in profile" })
    }

    const paymentReference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    payment = await Payment.create({
      leaseId,
      tenantId: userId,
      amountEtb: amount,
      paymentMethod,
      status: "PENDING",
      externalTransactionId: paymentReference,
    })

    let result
    switch (paymentMethod) {
      case "CHAPA":
        result = await initiateChapaPayment(amount, paymentReference, tenant.phoneNumber, tenant.email)
        break
      case "TELEBIRR":
        result = await initiateTelebirrPayment(amount, paymentReference, tenant.phoneNumber)
        break
      case "BELL":
        result = await initiateBellPayment(amount, paymentReference, tenant.phoneNumber)
        break
      default:
        throw new Error("Unsupported mobile money provider")
    }

    await logAction({
      userId,
      action: "MOBILE_PAYMENT_INITIATED",
      entityType: "Payment",
      entityId: payment._id,
      details: { paymentMethod, amount, reference: paymentReference },
    })

    res.json({
      status: 200,
      message: "Payment initiated",
      data: {
        paymentId: payment._id,
        checkoutUrl: result.checkoutUrl || result.paymentUrl,
        transactionId: result.transactionId,
      },
    })
  } catch (err) {
    if (payment?._id) {
      await Payment.deleteOne({ _id: payment._id, status: "PENDING" }).catch(() => {})
    }

    res.status(500).json({ status: 500, message: err.message })
  }
}

export async function getMobileMoneyProviders(req, res) {
  try {
    const providers = [
      {
        id: "CHAPA",
        name: "Chapa",
        description: "Popular payment gateway in Ethiopia",
        icon: "chapa-icon",
        enabled: !!process.env.CHAPA_API_URL,
      },
      {
        id: "TELEBIRR",
        name: "Telebirr",
        description: "Ethio Telecom mobile money service",
        icon: "telebirr-icon",
        enabled: !!process.env.TELEBIRR_API_URL,
      },
      {
        id: "BELL",
        name: "Bell",
        description: "Awash Bank mobile payment",
        icon: "bell-icon",
        enabled: !!process.env.BELL_API_URL,
      },
    ]

    res.json({ status: 200, data: providers.filter((p) => p.enabled) })
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message })
  }
}
