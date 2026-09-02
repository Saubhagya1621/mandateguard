import cron from "node-cron";
import Mandate from "../models/Mandate.js";
import RetryAttempt from "../models/RetryAttempt.js";
import AuditLog from "../models/AuditLog.js";
import { checkRetryEligibility } from "../rules-engine/retryEligibility.js";
import { simulateRetryOutcome } from "../services/retryExecutor.js";
import {
  suggestRetryTiming,
  generateAuditNote,
} from "../services/aiService.js";
import { emitMandateUpdate } from "../socket.js"; 

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

    emitMandateUpdate(mandate.mandateId);
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
    complianceWindow: {
      start: mandate.nextRetryAt,
      end: mandate.mandateExpiresAt,
    },
    aiSuggested: mandate.pendingAiSuggested,
    aiFallbackUsed: mandate.pendingAiFallback,
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
    mandate.pendingAiSuggested = false;
    mandate.pendingAiFallback = false;
    await mandate.save();
    emitMandateUpdate(mandate.mandateId);
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

    const aiSuggestedTime = await suggestRetryTiming({
      windowStart: eligibility.window.start.toISOString(),
      windowEnd: eligibility.window.end.toISOString(),
      failureReason: failureReason || mandate.failureReason,
      retryCount: mandate.retryCount,
    });

    const withinWindow =
      aiSuggestedTime &&
      aiSuggestedTime >= eligibility.window.start &&
      aiSuggestedTime <= eligibility.window.end;

    let finalTime;
    let fallbackUsed = false;

    if (withinWindow) {
      finalTime = aiSuggestedTime;
    } else {
      finalTime = eligibility.window.start;
      fallbackUsed = true;

      if (aiSuggestedTime) {
        await AuditLog.create({
          mandateId: mandate.mandateId,
          action: "ai_fallback_triggered",
          details: `AI suggested ${aiSuggestedTime.toISOString()}, which falls outside the compliance window. Falling back to window start.`,
        });
      }
    }

    mandate.nextRetryAt = finalTime;
    mandate.pendingAiSuggested = !fallbackUsed;
    mandate.pendingAiFallback = fallbackUsed;

    const auditNote = await generateAuditNote({
      chosenTime: finalTime,
      failureReason: failureReason || mandate.failureReason,
      wasAiSuggested: !fallbackUsed,
    });

    await AuditLog.create({
      mandateId: mandate.mandateId,
      action: "ai_suggestion_generated",
      details: auditNote,
      metadata: { aiSuggestedTime, finalTime, fallbackUsed },
    });
  } else {
    mandate.status = "blocked";
    mandate.nextRetryAt = null;
    mandate.pendingAiSuggested = false;
    mandate.pendingAiFallback = false;

    await AuditLog.create({
      mandateId: mandate.mandateId,
      action: "mandate_blocked",
      details: eligibility.reason,
    });
  }

    await mandate.save();
  emitMandateUpdate(mandate.mandateId);
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