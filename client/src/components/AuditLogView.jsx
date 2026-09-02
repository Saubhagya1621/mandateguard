import { useEffect, useState } from "react";
import { fetchAuditLogs } from "../lib/api";
import StateMessage from "./StateMessage";

const ACTION_COLORS = {
  failure_ingested: "bg-oxide",
  compliance_checked: "bg-forest",
  ai_suggestion_generated: "bg-ink",
  ai_fallback_triggered: "bg-ochre",
  retry_scheduled: "bg-forest",
  retry_executed: "bg-ink",
  mandate_expired: "bg-ink-muted",
  mandate_blocked: "bg-oxide",
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
    return <StateMessage type="loading" title="Loading audit trail" subtitle="Reconstructing the decision history." />;
  }

  if (error) {
    return <StateMessage type="error" title="Could not load audit trail" subtitle={error} />;
  }

  if (logs.length === 0) {
    return (
      <StateMessage
        type="empty"
        title="No entries recorded yet"
        subtitle="Actions taken on this mandate will appear here as they happen."
      />
    );
  }

  return (
    <div className="relative pl-6">
      <div className="absolute left-1.75 top-2 bottom-2 w-px bg-line" />

      <div className="space-y-6">
        {logs.map((log) => (
          <div key={log._id} className="relative">
            <div
              className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-card ${
                ACTION_COLORS[log.action] || "bg-ink-muted"
              }`}
            />
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
                {log.action.replace(/_/g, " ")}
              </span>
              <span className="text-[11px] font-mono text-ink-muted">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-ink leading-relaxed">{log.details}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AuditLogView;