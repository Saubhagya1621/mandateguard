import Mandate from "../models/Mandate.js";
import AuditLog from "../models/AuditLog.js";
import { checkRetryEligibility } from "../rules-engine/retryEligibility.js";
import { emitMandateUpdate } from "../socket.js";

async function ingestFailureEvent(req, res, next) {
  try {
    const { mandateId, merchantId, amount, failureReason, mandateExpiresAt } = req.body;

    if (!mandateId || !merchantId || !amount || !failureReason || !mandateExpiresAt) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    let mandate = await Mandate.findOne({ mandateId });

    if (!mandate) {
      mandate = new Mandate({
        mandateId,
        merchantId,
        amount,
        mandateExpiresAt,
        status: "failed",
        failureReason,
      });
    } else {
      mandate.status = "failed";
      mandate.failureReason = failureReason;
    }

    const eligibility = checkRetryEligibility({
      failureReason,
      retryCount: mandate.retryCount,
      mandateExpiresAt: new Date(mandate.mandateExpiresAt),
    });

    if (eligibility.eligible) {
      mandate.nextRetryAt = eligibility.window.start;
      mandate.status = "retrying";
    } else {
      mandate.nextRetryAt = null;
      mandate.status = "blocked";
    }

    await mandate.save();

    await AuditLog.create({
      mandateId,
      action: "failure_ingested",
      details: `Failure "${failureReason}" ingested. Eligibility: ${eligibility.eligible}.`,
      metadata: eligibility,
    });

    await AuditLog.create({
      mandateId,
      action: "compliance_checked",
      details: eligibility.eligible
        ? `Retry window opens ${eligibility.window.start.toISOString()}, closes ${eligibility.window.end.toISOString()}.`
        : eligibility.reason,
      metadata: eligibility,
    });
    emitMandateUpdate(mandateId);
    res.status(201).json({ mandate, eligibility });
  } catch (error) {
    next(error);
  }
}

async function getMandateStatus(req, res, next) {
  try {
    const { mandateId } = req.params;

    const mandate = await Mandate.findOne({ mandateId });

    if (!mandate) {
      return res.status(404).json({ error: "Mandate not found." });
    }

    res.status(200).json({ mandate });
  } catch (error) {
    next(error);
  }
}

async function listMandates(req, res, next) {
  try {
    const mandates = await Mandate.find().sort({ createdAt: -1 });
    res.status(200).json({ count: mandates.length, mandates });
  } catch (error) {
    next(error);
  }
}

export { ingestFailureEvent, getMandateStatus, listMandates };