import mongoose from "mongoose"

const propertySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
      index: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      index: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      default: "Ethiopia",
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    units: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unit",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
)

propertySchema.index({ managerId: 1, isDeleted: 1 })

export default mongoose.model("Property", propertySchema)
