import { useEffect, useState } from "react";
import { fetchMetrics, fetchMandates } from "../lib/api";
import socket from "../lib/socket";

const ACTION_LABELS = {
  failure_ingested: "failure ingested",
  compliance_checked: "compliance checked",
  ai_suggestion_generated: "AI suggested retry window",
  ai_fallback_triggered: "AI fallback triggered",
  retry_executed: "retry executed",
  mandate_expired: "mandate expired",
  mandate_blocked: "mandate blocked",
};

function OverviewPage({ onSelectMandate }) {
  const [metrics, setMetrics] = useState(null);
  const [mandates, setMandates] = useState([]);

  useEffect(() => {
    loadData();

    function handleUpdate() {
      loadData();
    }

    socket.on("mandate_updated", handleUpdate);
    return () => socket.off("mandate_updated", handleUpdate);
  }, []);

  async function loadData() {
    try {
      const [metricsData, mandatesData] = await Promise.all([
        fetchMetrics(),
        fetchMandates(),
      ]);
      setMetrics(metricsData);
      setMandates(mandatesData.mandates.slice(0, 8));
    } catch {
      // silent — overview is non-critical
    }
  }

  return (
    <div>
      <h2 className="font-display text-3xl font-semibold text-ink mb-8">Overview</h2>

      {metrics && (
        <div className="border border-line rounded-lg bg-card overflow-hidden mb-10">
          <div className="grid grid-cols-4 divide-x divide-line">
            <Stat label="Total" value={metrics.total} accent="text-ink" />
            <Stat label="Recovery" value={metrics.recoveryRate} accent="text-forest" />
            <Stat label="Blocked" value={metrics.blocked} accent="text-oxide" />
            <Stat label="Retrying" value={metrics.retrying} accent="text-ochre" />
          </div>
        </div>
      )}

      <h3 className="text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-3">
        Recent Activity
      </h3>

      <div className="border border-line rounded-lg bg-card overflow-hidden">
        {mandates.length === 0 ? (
          <p className="text-ink-muted font-mono text-sm px-5 py-4">No activity yet.</p>
        ) : (
          mandates.map((m, i) => (
            <div
              key={m._id}
              onClick={() => onSelectMandate(m.mandateId)}
              className={`flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-paper transition ${
                i !== mandates.length - 1 ? "border-b border-line" : ""
              }`}
            >
              <p className="text-sm text-ink">
                <span className="font-mono font-semibold">{m.mandateId}</span>{" "}
                <span className="text-ink-muted">{m.status}</span>
              </p>
              <p className="text-[11px] font-mono text-ink-muted">
                {new Date(m.updatedAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="px-5 py-4">
      <p className="text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1.5">
        {label}
      </p>
      <p className={`font-display text-2xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

export default OverviewPage;