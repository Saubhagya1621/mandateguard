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

function exportToCSV(logs, mandateId) {
  const headers = ["Timestamp", "Action", "Details"];
  const rows = logs.map((log) => [
    new Date(log.createdAt).toISOString(),
    log.action,
    `"${log.details.replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${mandateId}-audit-trail.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function AuditLogView({ logs, mandateId }) {
  if (!logs || logs.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => exportToCSV(logs, mandateId)}
          className="text-[11px] font-mono uppercase tracking-wider text-ink-muted border border-line rounded px-3 py-1.5 hover:border-ink hover:text-ink transition"
        >
          Export CSV
        </button>
      </div>
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
    </div>
  );
}

export default AuditLogView;