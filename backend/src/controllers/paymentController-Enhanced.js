import Payment from "../models/Payment.js"
import PaymentProof from "../models/PaymentProof.js"
import Property from "../models/Property.js" // Import Property model
import Lease from "../models/Lease.js"
import { processAndStoreImage } from "../services/imageUploadService.js"
import { logAction } from "../services/logActionService.js"

export async function uploadPaymentProof(req, res) {
  try {
    const { paymentId } = req.params
    const { proofType } = req.body
    const userId = req.user._id
    const userRole = req.user.role
    const file = req.file

    if (!file) {
      return res.status(400).json({ status: 400, message: "No image file provided" })
    }

    const payment = await Payment.findById(paymentId)
    if (!payment) {
      return res.status(404).json({ status: 404, message: "Payment not found" })
    }

    if (userRole === "PM") {
      const lease = await Lease.findById(payment.leaseId)
      const property = lease ? await Property.findById(lease.propertyId) : null
      if (!property || property.managerId?.toString() !== userId.toString()) {
        return res.status(403).json({ status: 403, message: "Access denied" })
      }
    }

    if (payment.tenantId.toString() !== userId.toString() && userRole !== "ADMIN" && userRole !== "PM") {
      return res.status(403).json({ status: 403, message: "Forbidden" })
    }

    if (payment.status !== "PENDING") {
      return res.status(400).json({ status: 400, message: "Cannot upload proof for non-pending payment" })
    }

    const existingProof = await PaymentProof.findOne({ paymentId, isDeleted: false })
    if (existingProof) {
      return res.status(400).json({ status: 400, message: "Payment already has proof attached" })
    }

    const proofImage = await processAndStoreImage(file, paymentId)

    const proof = await PaymentProof.create({
      paymentId,
      proofImage,
      proofType,
      uploadedBy: userId,
      imageMetadata: {
        size: file.size,
        uploadedFormat: file.mimetype,
      },
    })

    await Payment.findByIdAndUpdate(paymentId, {
      proofId: proof._id,
    })

    await logAction({
      userId,
      action: "PAYMENT_PROOF_UPLOADED",
      entityType: "PaymentProof",
      entityId: proof._id,
      details: { paymentId, proofType, fileSize: file.size },
    })

    res.status(201).json({
      status: 201,
      message: "Payment proof uploaded successfully",
      data: proof,
    })
  } catch (err) {
    res.status(400).json({ status: 400, message: err.message })
  }
}

export async function getPaymentProof(req, res) {
  try {
    const { paymentId } = req.params
    const userId = req.user._id
    const userRole = req.user.role

    if (!["PM", "ADMIN"].includes(userRole)) {
      return res.status(403).json({ status: 403, message: "Only PM/ADMIN can view payment proofs" })
    }

    const payment = await Payment.findById(paymentId)
    if (!payment) {
      return res.status(404).json({ status: 404, message: "Payment not found" })
    }

    if (userRole === "PM") {
      const lease = await Lease.findById(payment.leaseId)
      const property = lease ? await Property.findById(lease.propertyId) : null
      if (!property || property.managerId?.toString() !== userId.toString()) {
        return res.status(403).json({ status: 403, message: "Access denied" })
      }
    }

    const proof = await PaymentProof.findOne({ paymentId, isDeleted: false })
      .populate("uploadedBy", "name email")
      .populate("verifiedBy", "name email")

    if (!proof) {
      return res.status(404).json({ status: 404, message: "No proof found for this payment" })
    }

    res.json({
      status: 200,
      data: proof,
    })
  } catch (err) {
    res.status(500).json({ status: 500, message: "Failed to fetch payment proof" })
  }
}

export async function verifyPaymentWithProof(req, res) {
  try {
    const { paymentId } = req.params
    const { verificationComments } = req.body
    const userId = req.user._id
    const userRole = req.user.role

    if (!["PM", "ADMIN"].includes(userRole)) {
      return res.status(403).json({ status: 403, message: "Only PM/ADMIN can verify payments" })
    }

    const payment = await Payment.findById(paymentId).populate("leaseId")
    if (!payment) {
      return res.status(404).json({ status: 404, message: "Payment not found" })
    }

    if (userRole === "PM") {
      const lease = payment.leaseId
      const property = await Property.findById(lease.propertyId)

      if (!property || property.managerId?.toString() !== userId.toString()) {
        return res.status(403).json({
          status: 403,
          message: "You can only verify payments for your managed properties",
        })
      }
    }

    if (payment.status !== "PENDING") {
      return res.status(400).json({ status: 400, message: "Only pending payments can be verified" })
    }

    if (["BANK_TRANSFER", "MOBILE_MONEY", "CHAPA", "TELEBIRR", "BELL"].includes(payment.paymentMethod)) {
      const proof = await PaymentProof.findOne({ paymentId, isDeleted: false })
      if (!proof) {
        return res.status(400).json({
          status: 400,
          message: "Payment proof required before verification",
        })
      }

      if (proof.verifiedBy) {
        return res.status(400).json({ status: 400, message: "Payment proof already verified" })
      }

      await PaymentProof.findByIdAndUpdate(proof._id, {
        verifiedBy: userId,
        verificationDate: new Date(),
        verificationComments,
      })
    }

    const updated = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: "VERIFIED",
        verifiedBy: userId,
        verifiedAt: new Date(),
      },
      { new: true },
    )

    await logAction({
      userId,
      action: "PAYMENT_VERIFIED_WITH_PROOF",
      entityType: "Payment",
      entityId: paymentId,
      details: { leaseId: payment.leaseId, amount: payment.amountEtb },
    })

    res.json({
      status: 200,
      message: "Payment verified successfully",
      data: updated,
    })
  } catch (err) {
    res.status(500).json({ status: 500, message: "Failed to verify payment" })
  }
}
