// backend/server.js — DIAGNOSTIC + FIXED VERSION

import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectDB } from "./src/config/db.js";
import errorHandler from "./src/middleware/errorHandler.js";

import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import paymentRoutes from "./src/routes/payment.routes.js";
import financeRoutes from "./src/routes/finance.routes.js";
import leaseRoutes from "./src/routes/lease.routes.js";
import unitRoutes from "./src/routes/unit.routes.js";
import propertyRoutes from "./src/routes/property.routes.js";
import maintenanceRoutes from "./src/routes/maintenanceRoutes.js";

import { applyHelmet, rateLimiter } from "./src/middleware/security.js";

const app = express();

app.set("trust proxy", 1);

// Safe CORS – reflects requesting origin (no rejection possible)
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  })
);

app.options("*", cors());

// Body parser
app.use(express.json());

// Security
app.use(applyHelmet);

app.use((req, res, next) => {
  if (req.method === "OPTIONS") return next();
  rateLimiter(req, res, next);
});

// Health – explicit 200 + logging
app.get("/health", (req, res) => {
  console.log("[HEALTHCHECK] /health called from", req.ip || req.headers["x-forwarded-for"]);
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "API is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/leases", leaseRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/maintenance", maintenanceRoutes);

// Error handler last
app.use(errorHandler);

// Listen – MUST use process.env.PORT
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log("Attempting MongoDB connection...");
    await connectDB();
    console.log("MongoDB connected successfully");

    console.log("Starting server on port:", PORT);
    console.log("process.env.PORT value:", process.env.PORT || "(not set – using fallback 5000)");

    app.listen(PORT, "0.0.0.0", () => {  // bind to 0.0.0.0 for Railway
      console.log(`Server is listening on http://0.0.0.0:${PORT}`);
      console.log("Healthcheck should now respond at /health");
    });
  } catch (error) {
    console.error("Startup failed:", error.message || error);
    process.exit(1);
  }
}

startServer();