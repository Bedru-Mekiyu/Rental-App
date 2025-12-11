const mongoose = require("mongoose");

const connectDB = async () => {
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/rms";

  if (!MONGODB_URI) {
    console.error("MONGODB_URI missed in environment variables");
    process.exit(1)
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB diconnected");
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
