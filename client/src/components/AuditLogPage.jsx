import { useEffect, useState } from "react";
import { fetchAllAuditLogs } from "../lib/api";
import socket from "../lib/socket";
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

const ACTION_TYPES = [
  "failure_ingested",
  "compliance_checked",
  "ai_suggestion_generated",
  "ai_fallback_triggered",
  "retry_executed",
  "mandate_expired",
  "mandate_blocked",
];

function AuditLogPage({ onSelectMandate }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  useEffect(() => {
    loadLogs();

    function handleUpdate() {
      loadLogs();
    }

    socket.on("mandate_updated", handleUpdate);
    return () => socket.off("mandate_updated", handleUpdate);
  }, []);

  async function loadLogs() {
    try {
      const data = await fetchAllAuditLogs();
      setLogs(data.logs);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <StateMessage type="loading" title="Loading audit log" subtitle="Fetching the global compliance trail." />;
  }

  if (error) {
    return <StateMessage type="error" title="Could not load audit log" subtitle={error} />;
  }

  const filteredLogs = logs.filter((log) => {
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesSearch =
      searchTerm.trim() === "" ||
      log.mandateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <div>
      <h2 className="font-display text-3xl font-semibold text-ink mb-8">Audit Log</h2>

      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by mandate ID or detail text..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-line rounded bg-card text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink font-mono"
        />
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-line rounded bg-card text-ink focus:outline-none focus:border-ink font-mono uppercase tracking-wide"
        >
          <option value="all">All Actions</option>
          {ACTION_TYPES.map((action) => (
            <option key={action} value={action}>
              {action.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {filteredLogs.length === 0 ? (
        <StateMessage type="empty" title="No matching entries" subtitle="Try a different search term or filter." />
      ) : (
        <div className="border border-line rounded-lg bg-card overflow-hidden">
          {filteredLogs.map((log, i) => (
            <div
              key={log._id}
              onClick={() => onSelectMandate(log.mandateId)}
              className={`flex items-start gap-3 px-5 py-3.5 cursor-pointer hover:bg-paper transition ${
                i !== filteredLogs.length - 1 ? "border-b border-line" : ""
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  ACTION_COLORS[log.action] || "bg-ink-muted"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm text-ink truncate">
                    <span className="font-mono font-semibold">{log.mandateId}</span>{" "}
                    <span className="text-ink-muted text-[11px] uppercase tracking-wide">
                      {log.action.replace(/_/g, " ")}
                    </span>
                  </p>
                  <span className="text-[11px] font-mono text-ink-muted shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-ink-muted mt-0.5 truncate">{log.details}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AuditLogPage;