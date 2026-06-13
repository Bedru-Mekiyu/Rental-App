import { processBulkPaymentUpload } from "../services/bulkPaymentService.js"
import fs from "fs"
import BulkPaymentUpload from "../models/BulkPaymentUpload.js"
import { logAction } from "../services/logActionService.js"

export async function uploadBulkPayments(req, res) {
  try {
    const file = req.file
    const userId = req.user._id
    const userRole = req.user.role

    if (!["PM", "ADMIN", "FS"].includes(userRole)) {
      return res.status(403).json({ message: "Only PM/ADMIN/FS can upload bulk payments" })
    }

    if (!file) return res.status(400).json({ message: "No file provided" })

    const fileType = file.originalname.split(".").pop().toLowerCase()
    if (!["csv", "xlsx"].includes(fileType)) {
      return res.status(400).json({ message: "Only CSV and XLSX files supported" })
    }

    const result = await processBulkPaymentUpload(file.path, userId, fileType)

    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path)
    }

    await logAction({
      userId,
      action: "BULK_PAYMENT_UPLOADED",
      entityType: "BulkPaymentUpload",
      entityId: result.uploadId,
      details: { fileName: file.originalname, successCount: result.successCount, failureCount: result.failureCount },
    })

    res.json({
      status: 200,
      message: "Bulk upload processed",
      data: result,
    })
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    res.status(500).json({ status: 500, message: err.message })
  }
}

export async function getBulkUploadStatus(req, res) {
  try {
    const { uploadId } = req.params
    const userId = req.user._id
    const userRole = req.user.role

    const upload = await BulkPaymentUpload.findById(uploadId).populate("uploadedBy", "name email")

    if (!upload) return res.status(404).json({ message: "Upload not found" })

    if (!upload.uploadedBy._id.equals(userId) && !["PM", "ADMIN", "FS"].includes(userRole)) {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json({ status: 200, data: upload })
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message })
  }
}
