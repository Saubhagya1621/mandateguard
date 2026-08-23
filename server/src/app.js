import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mandateRoutes from "./routes/mandateRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());

const allowedOrigin = process.env.CLIENT_ORIGIN;
app.use(
  cors({
    origin: allowedOrigin || false,
  })
);

app.use(express.json({ limit: "1mb" }));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/mandates", mandateRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;