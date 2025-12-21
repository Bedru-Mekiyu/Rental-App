// server.js (ES modules)

import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectDB } from "./src/config/db.js";
import errorHandler from "./src/middleware/errorHandler.js";
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";       // <-- added
import paymentRoutes from "./src/routes/payment.routes.js";
import financeRoutes from "./src/routes/finance.routes.js";
import leaseRoutes from "./src/routes/lease.routes.js";
import unitRoutes from "./src/routes/unit.routes.js";
import { applyHelmet, rateLimiter } from "./src/middleware/security.js";

const app = express();

// global security middleware
app.use(applyHelmet);
app.use(rateLimiter);

// common middleware
app.use(cors());
app.use(express.json());

// DB
connectDB();

// health
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/test-helmet", (req, res) => {
  res.send("helmet headers test");
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);          // <-- added
app.use("/api/payments", paymentRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/leases", leaseRoutes);
app.use("/api/units", unitRoutes);

// error handler (after routes)
app.use(errorHandler);

// start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
