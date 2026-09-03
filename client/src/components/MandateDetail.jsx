import { useEffect, useState } from "react";
import { fetchMandateById, fetchAuditLogs } from "../lib/api";
import AuditLogView from "./AuditLogView";
import MandateTimeline from "./MandateTimeline";
import StateMessage from "./StateMessage";

const STATUS_STYLES = {
  active: "text-forest border-forest",
  retrying: "text-ochre border-ochre",
  recovered: "text-forest border-forest",
  blocked: "text-oxide border-oxide",
  expired: "text-ink-muted border-ink-muted",
  failed: "text-oxide border-oxide",
};

function MandateDetail({ mandateId, onBack }) {
  const [mandate, setMandate] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [mandateId]);

  async function loadData() {
    try {
      setLoading(true);
      const [mandateData, logsData] = await Promise.all([
        fetchMandateById(mandateId),
        fetchAuditLogs(mandateId),
      ]);
      setMandate(mandateData.mandate);
      setLogs(logsData.logs);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <StateMessage type="loading" title="Loading entry" subtitle="Fetching this mandate's record." />;
  }

  if (error) {
    return <StateMessage type="error" title="Could not load entry" subtitle={error} />;
  }

  if (!mandate) {
    return null;
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="text-xs font-mono uppercase tracking-wider text-ink-muted hover:text-ink transition mb-8 inline-flex items-center gap-1"
      >
        ← Back to ledger
      </button>

      <div className="flex items-baseline justify-between mb-8">
        <h2 className="font-display text-3xl font-semibold text-ink">{mandate.mandateId}</h2>
        <span
          className={`inline-block px-2.5 py-1 border-2 rounded font-mono text-[11px] font-semibold uppercase tracking-wider -rotate-2 ${
            STATUS_STYLES[mandate.status] || "text-ink-muted border-ink-muted"
          }`}
        >
          {mandate.status}
        </span>
      </div>

      <MandateTimeline logs={logs} />

      <div className="border border-line rounded-lg bg-card overflow-hidden mb-10">
        <div className="grid grid-cols-2 divide-x divide-line">
          <div className="divide-y divide-line">
            <Field label="Merchant ID" value={mandate.merchantId} />
            <Field label="Failure Reason" value={mandate.failureReason?.replace(/_/g, " ") || "—"} />
            <Field label="Next Retry At" value={mandate.nextRetryAt ? new Date(mandate.nextRetryAt).toLocaleString() : "—"} />
            <Field label="Created At" value={new Date(mandate.createdAt).toLocaleString()} />
          </div>
          <div className="divide-y divide-line">
            <Field label="Amount" value={`₹${mandate.amount}`} />
            <Field label="Retry Count" value={mandate.retryCount} />
            <Field label="Mandate Expires At" value={new Date(mandate.mandateExpiresAt).toLocaleString()} />
            <Field label="Last Updated" value={new Date(mandate.updatedAt).toLocaleString()} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl font-semibold text-ink mb-5">Audit Trail</h3>
        <AuditLogView logs={logs} />
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="px-5 py-3.5">
      <p className="text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">{label}</p>
      <p className="font-mono text-sm text-ink">{value}</p>
    </div>
  );
}

export default MandateDetail;