import cron from "node-cron";
import Mandate from "../models/Mandate.js";
import RetryAttempt from "../models/RetryAttempt.js";
import AuditLog from "../models/AuditLog.js";
import { checkRetryEligibility } from "../rules-engine/retryEligibility.js";
import { simulateRetryOutcome } from "../services/retryExecutor.js";

async function processDueMandates() {
  const now = new Date();

  const dueMandates = await Mandate.find({
    status: "retrying",
    nextRetryAt: { $lte: now },
  });

  for (const mandate of dueMandates) {
    await processSingleMandate(mandate, now);
  }
}

async function processSingleMandate(mandate, now) {
  // Handle mandate expiring mid-sequence before this retry could fire
  if (new Date(mandate.mandateExpiresAt) <= now) {
    mandate.status = "expired";
    mandate.nextRetryAt = null;
    await mandate.save();

    await AuditLog.create({
      mandateId: mandate.mandateId,
      action: "mandate_expired",
      details: "Mandate expired before scheduled retry could execute.",
    });

    return;
  }

  const attemptNumber = mandate.retryCount + 1;
  const { outcome, failureReason } = simulateRetryOutcome(mandate.nextRetryAt);

  await RetryAttempt.create({
    mandateId: mandate.mandateId,
    attemptNumber,
    scheduledFor: mandate.nextRetryAt,
    executedAt: now,
    outcome,
    failureReason,
    complianceWindow: { start: mandate.nextRetryAt, end: mandate.mandateExpiresAt },
  });

  await AuditLog.create({
    mandateId: mandate.mandateId,
    action: "retry_executed",
    details: `Retry attempt #${attemptNumber} executed with outcome: ${outcome}.`,
  });

  mandate.retryCount = attemptNumber;

  if (outcome === "success") {
    mandate.status = "recovered";
    mandate.nextRetryAt = null;
    await mandate.save();
    return;
  }

  // Failed — check if another retry is eligible under compliance rules
  const eligibility = checkRetryEligibility({
    failureReason: failureReason || mandate.failureReason,
    retryCount: mandate.retryCount,
    mandateExpiresAt: new Date(mandate.mandateExpiresAt),
    now,
  });

  if (eligibility.eligible) {
    mandate.status = "retrying";
    mandate.nextRetryAt = eligibility.window.start;
  } else {
    mandate.status = "blocked";
    mandate.nextRetryAt = null;

    await AuditLog.create({
      mandateId: mandate.mandateId,
      action: "mandate_blocked",
      details: eligibility.reason,
    });
  }

  await mandate.save();
}

function startRetryScheduler() {
  // Runs every 2 minutes
  cron.schedule("*/2 * * * *", () => {
    processDueMandates().catch((error) => {
      console.error("Retry scheduler error:", error.message);
    });
  });

  console.log("Retry scheduler started (every 2 minutes)");
}

export { startRetryScheduler, processDueMandates };