import mongoose from "mongoose"

const invoiceSchema = new mongoose.Schema(
  {
    leaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lease",
      required: true,
      index: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    amountEtb: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["DRAFT", "ISSUED", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"],
      default: "DRAFT",
      index: true,
    },
    lineItems: [
      {
        description: String,
        quantity: Number,
        unitPrice: Number,
        total: Number,
      },
    ],
    notes: String,
    issuedAt: Date,
    issuedBy: mongoose.Schema.Types.ObjectId,
    pdfUrl: String,
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
)

invoiceSchema.index({ dueDate: 1, status: 1 })
invoiceSchema.index({ tenantId: 1, createdAt: -1 })

export default mongoose.model("Invoice", invoiceSchema)
