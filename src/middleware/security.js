// src/middleware/security.js (ESM)

import helmet from "helmet";
import rateLimit from "express-rate-limit";

export const applyHelmet = helmet();

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    message: "too many requests from this IP. please try again later",
  },
});
