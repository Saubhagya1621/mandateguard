import Mandate from "../models/Mandate.js";

async function getMetrics(req, res, next) {
  try {
    const [total, recovered, blocked, retrying, expired] = await Promise.all([
      Mandate.countDocuments(),
      Mandate.countDocuments({ status: "recovered" }),
      Mandate.countDocuments({ status: "blocked" }),
      Mandate.countDocuments({ status: "retrying" }),
      Mandate.countDocuments({ status: "expired" }),
    ]);

    const resolved = recovered + blocked + expired;
    const recoveryRate = resolved > 0 ? ((recovered / resolved) * 100).toFixed(1) : "0.0";

    res.status(200).json({
      total,
      recovered,
      blocked,
      retrying,
      expired,
      recoveryRate: `${recoveryRate}%`,
    });
  } catch (error) {
    next(error);
  }
}

export { getMetrics };