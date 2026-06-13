import mongoose from "mongoose"

const passwordHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false },
)

// Keep last 5 passwords in history (prevent reuse)
export default mongoose.model("PasswordHistory", passwordHistorySchema)
