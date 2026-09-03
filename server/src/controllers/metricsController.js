import Mandate from "../models/Mandate.js";
import MetricsSnapshot from "../models/MetricsSnapshot.js";

async function computeMetrics() {
  const [total, recovered, blocked, retrying, expired] = await Promise.all([
    Mandate.countDocuments(),
    Mandate.countDocuments({ status: "recovered" }),
    Mandate.countDocuments({ status: "blocked" }),
    Mandate.countDocuments({ status: "retrying" }),
    Mandate.countDocuments({ status: "expired" }),
  ]);

  const resolved = recovered + blocked + expired;
  const recoveryRate = resolved > 0 ? ((recovered / resolved) * 100).toFixed(1) : "0.0";

  return {
    total,
    recovered,
    blocked,
    retrying,
    expired,
    recoveryRate: `${recoveryRate}%`,
  };
}

async function getMetrics(req, res, next) {
  try {
    const metrics = await computeMetrics();
    res.status(200).json(metrics);
  } catch (error) {
    next(error);
  }
}

async function createSnapshot(req, res, next) {
  try {
    const { label } = req.body;
    const metrics = await computeMetrics();

    const snapshot = await MetricsSnapshot.create({
      ...metrics,
      label: label || "",
    });

    res.status(201).json({ snapshot });
  } catch (error) {
    next(error);
  }
}

async function listSnapshots(req, res, next) {
  try {
    const snapshots = await MetricsSnapshot.find().sort({ createdAt: 1 });
    res.status(200).json({ count: snapshots.length, snapshots });
  } catch (error) {
    next(error);
  }
}

export { getMetrics, createSnapshot, listSnapshots };