import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    mandateId: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      enum: [
        "failure_ingested",
        "compliance_checked",
        "ai_suggestion_generated",
        "ai_fallback_triggered",
        "retry_scheduled",
        "retry_executed",
        "mandate_expired",
        "mandate_blocked",
      ],
      required: true,
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);