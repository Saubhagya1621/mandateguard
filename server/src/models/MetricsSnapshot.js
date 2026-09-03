import mongoose from "mongoose";

const metricsSnapshotSchema = new mongoose.Schema(
  {
    total: { type: Number, required: true },
    recovered: { type: Number, required: true },
    blocked: { type: Number, required: true },
    retrying: { type: Number, required: true },
    expired: { type: Number, required: true },
    recoveryRate: { type: String, required: true },
    label: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("MetricsSnapshot", metricsSnapshotSchema);