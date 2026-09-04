import AuditLog from "../models/AuditLog.js";

async function getAuditLogsForMandate(req, res, next) {
  try {
    const { mandateId } = req.params;

    const logs = await AuditLog.find({ mandateId }).sort({ createdAt: 1 });

    res.status(200).json({ count: logs.length, logs });
  } catch (error) {
    next(error);
  }
}
async function getAllAuditLogs(req, res, next) {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200);
    res.status(200).json({ count: logs.length, logs });
  } catch (error) {
    next(error);
  }
}
export { getAuditLogsForMandate, getAllAuditLogs };