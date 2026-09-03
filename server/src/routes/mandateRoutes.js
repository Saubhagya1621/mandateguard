import express from "express";
import { ingestFailureEvent, getMandateStatus, listMandates } from "../controllers/mandateController.js";
import { getAuditLogsForMandate } from "../controllers/auditLogController.js";
import { getMetrics, createSnapshot, listSnapshots } from "../controllers/metricsController.js";

const router = express.Router();

router.post("/failure", ingestFailureEvent);
router.post("/metrics/snapshot", createSnapshot);
router.get("/metrics/snapshots", listSnapshots);
router.get("/metrics/summary", getMetrics);
router.get("/:mandateId/audit-logs", getAuditLogsForMandate);
router.get("/:mandateId", getMandateStatus);
router.get("/", listMandates);

export default router;