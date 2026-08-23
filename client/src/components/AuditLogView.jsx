import { useEffect, useState } from "react";
import { fetchAuditLogs } from "../lib/api";

const ACTION_STYLES = {
  failure_ingested: "border-danger/40",
  compliance_checked: "border-mint/40",
  ai_suggestion_generated: "border-magenta/40",
  ai_fallback_triggered: "border-danger/40",
  retry_scheduled: "border-mint/40",
  retry_executed: "border-magenta/40",
  mandate_expired: "border-text-muted/40",
  mandate_blocked: "border-danger/40",
};

function AuditLogView({ mandateId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLogs();
  }, [mandateId]);

  async function loadLogs() {
    try {
      setLoading(true);
      const data = await fetchAuditLogs(mandateId);
      setLogs(data.logs);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-text-muted text-sm">Loading audit trail...</div>;
  }

  if (error) {
    return <div className="text-danger text-sm">Error: {error}</div>;
  }

  if (logs.length === 0) {
    return <div className="text-text-muted text-sm">No audit log entries yet.</div>;
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div
          key={log._id}
          className={`bg-plum-light rounded-lg p-4 border-l-4 ${
            ACTION_STYLES[log.action] || "border-text-muted/40"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase text-text-muted tracking-wide">
              {log.action.replace(/_/g, " ")}
            </span>
            <span className="text-xs text-text-muted">
              {new Date(log.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-text text-sm">{log.details}</p>
        </div>
      ))}
    </div>
  );
}

export default AuditLogView;