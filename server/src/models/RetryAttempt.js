import mongoose from "mongoose";

const retryAttemptSchema = new mongoose.Schema(
  {
    mandateId: {
      type: String,
      required: true,
      trim: true,
    },
    attemptNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    scheduledFor: {
      type: Date,
      required: true,
    },
    executedAt: {
      type: Date,
      default: null,
    },
    outcome: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    failureReason: {
      type: String,
      default: null,
    },
    complianceWindow: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    aiSuggested: {
      type: Boolean,
      default: false,
    },
    aiFallbackUsed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("RetryAttempt", retryAttemptSchema);