import crypto from "crypto";

function errorHandler(err, req, res, next) {
  const correlationId = crypto.randomUUID();

  console.error(`[${correlationId}]`, err.stack || err.message);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    error: "Something went wrong. Please try again.",
    correlationId,
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: "Resource not found" });
}

export { errorHandler, notFoundHandler };