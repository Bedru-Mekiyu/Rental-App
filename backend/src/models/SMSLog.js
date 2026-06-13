import mongoose from "mongoose"

const smsLogSchema = new mongoose.Schema(
  {
    recipient: {
      type: String,
      required: true,
    },
    channel: {
      type: String,
      enum: ["SMS", "WHATSAPP"],
      required: true,
    },
    messageType: {
      type: String,
      enum: ["PAYMENT_DUE", "PAYMENT_OVERDUE", "PAYMENT_RECEIVED", "LEASE_EXPIRING", "MAINTENANCE_UPDATE"],
      required: true,
    },
    message: String,
    status: {
      type: String,
      enum: ["SENT", "DELIVERED", "FAILED"],
      default: "SENT",
    },
    externalMessageId: String,
    errorMessage: String,
    sentAt: Date,
    deliveredAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

smsLogSchema.index({ recipient: 1, channel: 1 })
smsLogSchema.index({ messageType: 1, status: 1 })

export default mongoose.model("SMSLog", smsLogSchema)
