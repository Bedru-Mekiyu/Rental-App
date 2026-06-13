import mongoose from "mongoose"

const webhookEventSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["STRIPE", "PAYPAL", "FLUTTERWAVE", "CHAPA", "TELEBIRR"],
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    externalEventId: {
      type: String,
      unique: true,
      sparse: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    rawPayload: mongoose.Schema.Types.Mixed,
    processedData: {
      status: String,
      amountEtb: Number,
      transactionId: String,
    },
    status: {
      type: String,
      enum: ["RECEIVED", "PROCESSING", "PROCESSED", "FAILED"],
      default: "RECEIVED",
      index: true,
    },
    processingError: String,
    retryCount: {
      type: Number,
      default: 0,
    },
    lastRetryAt: Date,
    processedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
)

webhookEventSchema.index({ provider: 1, createdAt: -1 })
webhookEventSchema.index({ status: 1, retryCount: 1 })

export default mongoose.model("WebhookEvent", webhookEventSchema)
