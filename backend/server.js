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


// ----------------------
// SIMPLE PRODUCTION CORS
// ----------------------

app.use(cors({
  origin: true,          // reflect request origin
  credentials: true
}));

// handle preflight
app.options("*", cors());


// ----------------------
// BODY PARSER
// ----------------------

app.use(express.json());


// ----------------------
// SECURITY
// ----------------------

app.use(applyHelmet);

// skip rate limit for preflight
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return next();
  rateLimiter(req, res, next);
});


// ----------------------
// HEALTH ROUTES
// ----------------------

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Rental API is running",
    health: "/health"
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});


// ----------------------
// API ROUTES
// ----------------------

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/leases", leaseRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/maintenance", maintenanceRoutes);


// ----------------------
// ERROR HANDLER
// ----------------------

app.use(errorHandler);


// ----------------------
// START SERVER
// ----------------------

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {

    await connectDB();

    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {

    console.error("Server startup error:", error);

    process.exit(1);
  }
}

startServer();