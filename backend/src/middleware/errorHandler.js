// src/middleware/errorHandler.js (ESM)

// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, next) {
  console.error("Unhandled error:", err);

  // You can customize status codes by checking err.name / err.statusCode
  const status = err.statusCode || 500;

  res.status(status).json({
    message: err.message || "Internal server error",
  });
}
