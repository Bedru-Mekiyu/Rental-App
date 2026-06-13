import mongoose from "mongoose"

const bulkUploadSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalRecords: Number,
    successCount: {
      type: Number,
      default: 0,
    },
    failureCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      default: "PENDING",
      index: true,
    },
    records: [
      {
        rowNumber: Number,
        leaseId: String,
        amount: Number,
        paymentDate: Date,
        reference: String,
        status: {
          type: String,
          enum: ["PENDING", "SUCCESS", "ERROR"],
        },
        errorMessage: String,
        createdPaymentId: mongoose.Schema.Types.ObjectId,
      },
    ],
    startedAt: Date,
    completedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
)

bulkUploadSchema.index({ uploadedBy: 1, createdAt: -1 })

export default mongoose.model("BulkPaymentUpload", bulkUploadSchema)
