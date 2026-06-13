import csv from "csv-parser"
import ExcelJS from "exceljs"
import fs from "fs"
import path from "path"
import mongoose from "mongoose"
import Payment from "../models/Payment.js"
import Lease from "../models/Lease.js"
import BulkPaymentUpload from "../models/BulkPaymentUpload.js"

const MAX_BULK_UPLOAD_RECORDS = Number.parseInt(process.env.MAX_BULK_UPLOAD_RECORDS || "1000", 10)

export async function processBulkPaymentUpload(filePath, uploadedBy, fileType) {
  try {
    const records = await parseFile(filePath, fileType)

    if (!records.length) {
      throw new Error("No payment records found")
    }

    if (records.length > MAX_BULK_UPLOAD_RECORDS) {
      throw new Error(`Upload exceeds max record limit (${MAX_BULK_UPLOAD_RECORDS})`)
    }

    const bulkUpload = await BulkPaymentUpload.create({
      fileName: path.basename(filePath),
      uploadedBy,
      totalRecords: records.length,
      status: "PROCESSING",
      records: records.map((r, i) => ({ ...r, rowNumber: i + 1, status: "PENDING" })),
      startedAt: new Date(),
    })

    const processedRecords = await Promise.all(
      records.map(async (record, index) => {
        try {
          if (!mongoose.Types.ObjectId.isValid(record.leaseId)) {
            throw new Error("Invalid lease ID")
          }

          const lease = await Lease.findById(record.leaseId)
          if (!lease) throw new Error("Lease not found")
          if (lease.status !== "ACTIVE") throw new Error("Lease not active")

          if (!Number.isFinite(Number(record.amount)) || Number(record.amount) <= 0) {
            throw new Error("Invalid amount")
          }

          const paymentMethod = record.paymentMethod || "BANK_TRANSFER"
          if (!["BANK_TRANSFER", "MOBILE_MONEY", "CASH", "CHECK"].includes(paymentMethod)) {
            throw new Error("Invalid payment method")
          }

          const reference = record.reference && String(record.reference).trim()
          if (reference && reference.length > 128) {
            throw new Error("Reference too long")
          }

          const payment = await Payment.create({
            leaseId: record.leaseId,
            tenantId: lease.tenantId,
            amountEtb: Number(record.amount),
            paymentMethod,
            status: "PENDING",
            ...(reference ? { externalTransactionId: reference } : {}),
          })

          return {
            rowNumber: index + 1,
            status: "SUCCESS",
            createdPaymentId: payment._id,
          }
        } catch (err) {
          return {
            rowNumber: index + 1,
            status: "ERROR",
            errorMessage: err.message,
          }
        }
      }),
    )

    const successCount = processedRecords.filter((r) => r.status === "SUCCESS").length
    const failureCount = processedRecords.filter((r) => r.status === "ERROR").length

    await BulkPaymentUpload.updateOne(
      { _id: bulkUpload._id },
      {
        records: processedRecords,
        successCount,
        failureCount,
        status: "COMPLETED",
        completedAt: new Date(),
      },
    )

    return {
      uploadId: bulkUpload._id,
      successCount,
      failureCount,
      records: processedRecords,
    }
  } catch (err) {
    throw new Error(`Bulk upload failed: ${err.message}`)
  }
}

async function parseFile(filePath, fileType) {
  if (fileType === "csv") {
    return new Promise((resolve, reject) => {
      const records = []
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          records.push({
            leaseId: row.lease_id || row.leaseId,
            amount: Number.parseFloat(row.amount),
            paymentMethod: row.payment_method || "BANK_TRANSFER",
            paymentDate: new Date(row.payment_date || Date.now()),
            reference: row.reference || row.ref,
          })
        })
        .on("end", () => resolve(records))
        .on("error", (err) => reject(err))
    })
  }

  if (fileType === "xlsx") {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(filePath)
    const worksheet = workbook.worksheets[0]

    if (!worksheet) {
      return []
    }

    const headerRow = worksheet.getRow(1)
    const headers = headerRow.values
      .slice(1)
      .map((header) => (header ? header.toString().trim() : ""))

    const records = []
    for (let rowIndex = 2; rowIndex <= worksheet.rowCount; rowIndex += 1) {
      const rowValues = worksheet.getRow(rowIndex).values.slice(1)
      const rowData = {}

      headers.forEach((header, index) => {
        if (!header) {
          return
        }
        rowData[header] = rowValues[index]
      })

      records.push({
        leaseId: rowData.lease_id || rowData.leaseId,
        amount: Number.parseFloat(rowData.amount),
        paymentMethod: rowData.payment_method || "BANK_TRANSFER",
        paymentDate: new Date(rowData.payment_date || Date.now()),
        reference: rowData.reference || rowData.ref,
      })
    }

    return records
  }

  throw new Error("Unsupported file type")
}
