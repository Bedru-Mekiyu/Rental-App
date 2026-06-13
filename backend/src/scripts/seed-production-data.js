// src/scripts/seed-production-data.js (ESM)
// Optional: Seed initial admin user and property for testing

import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import User from "../models/User.js"
import Property from "../models/Property.js"

async function seedProductionData() {
  try {
    console.log("Seeding production data...")

    // Create admin user
    const adminExists = await User.findOne({ email: "admin@property.com" })
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("AdminPassword123!", 10)
      const admin = await User.create({
        email: "admin@property.com",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        role: "ADMIN",
        isActive: true,
      })
      console.log("Admin user created:", admin._id)
    }

    // Create sample PM
    const pmExists = await User.findOne({ email: "pm@property.com" })
    if (!pmExists) {
      const hashedPassword = await bcrypt.hash("PMPassword123!", 10)
      const pm = await User.create({
        email: "pm@property.com",
        password: hashedPassword,
        firstName: "Property",
        lastName: "Manager",
        role: "PM",
        isActive: true,
      })
      console.log("PM user created:", pm._id)

      // Create sample property for PM
      const property = await Property.create({
        name: "Sample Property",
        address: "123 Main Street",
        city: "Addis Ababa",
        units: [],
        managerId: pm._id,
      })
      console.log("Sample property created:", property._id)
    }

    console.log("Seeding completed")
    process.exit(0)
  } catch (err) {
    console.error("Seeding failed:", err.message)
    process.exit(1)
  }
}

mongoose.connect(process.env.MONGODB_URI).then(seedProductionData)
