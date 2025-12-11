const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const applyHelmet = helmet();
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    message: "too many requests from this IP. please try again later",
  },
});

module.exports = {applyHelmet, rateLimiter}