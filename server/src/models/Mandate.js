import mongoose from "mongoose";

const mandateSchema = new mongoose.Schema(
  {
    mandateId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    merchantId: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "failed", "retrying", "recovered", "expired", "blocked"],
      default: "active",
    },
    failureReason: {
      type: String,
      enum: [
        "insufficient_funds",
        "mandate_expired",
        "bank_server_timeout",
        "account_frozen",
        "daily_limit_hit",
        "other",
      ],
      default: null,
    },
    retryCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    nextRetryAt: {
      type: Date,
      default: null,
    },
    mandateExpiresAt: {
      type: Date,
      required: true,
    },
    pendingAiSuggested: {
      type: Boolean,
      default: false,
    },
    pendingAiFallback: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Mandate", mandateSchema);