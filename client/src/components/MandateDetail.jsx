import { useEffect, useState } from "react";
import { fetchMandateById } from "../lib/api";
import AuditLogView from "./AuditLogView";

const STATUS_STYLES = {
  active: "bg-mint/20 text-mint",
  retrying: "bg-magenta/20 text-magenta",
  recovered: "bg-mint/20 text-mint",
  blocked: "bg-danger/20 text-danger",
  expired: "bg-text-muted/20 text-text-muted",
  failed: "bg-danger/20 text-danger",
};

function MandateDetail({ mandateId, onBack }) {
  const [mandate, setMandate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMandate();
  }, [mandateId]);

  async function loadMandate() {
    try {
      setLoading(true);
      const data = await fetchMandateById(mandateId);
      setMandate(data.mandate);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-text-muted p-6">Loading mandate...</div>;
  }

  if (error) {
    return <div className="text-danger p-6">Error: {error}</div>;
  }

  if (!mandate) {
    return null;
  }

  return (
    <div className="p-6">
      <button
        onClick={onBack}
        className="text-mint mb-6 hover:underline text-sm"
      >
        ← Back to Mandates
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">{mandate.mandateId}</h1>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
            STATUS_STYLES[mandate.status] || "bg-text-muted/20 text-text-muted"
          }`}
        >
          {mandate.status}
        </span>
      </div>

      <div className="bg-plum-light rounded-xl p-5 grid grid-cols-2 gap-4 border border-magenta/10">
        <DetailField label="Merchant ID" value={mandate.merchantId} />
        <DetailField label="Amount" value={`₹${mandate.amount}`} />
        <DetailField
          label="Failure Reason"
          value={mandate.failureReason || "—"}
        />
        <DetailField label="Retry Count" value={mandate.retryCount} />
        <DetailField
          label="Next Retry At"
          value={
            mandate.nextRetryAt
              ? new Date(mandate.nextRetryAt).toLocaleString()
              : "—"
          }
        />
        <DetailField
          label="Mandate Expires At"
          value={new Date(mandate.mandateExpiresAt).toLocaleString()}
        />
        <DetailField
          label="Created At"
          value={new Date(mandate.createdAt).toLocaleString()}
        />
        <DetailField
          label="Last Updated"
          value={new Date(mandate.updatedAt).toLocaleString()}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-text mb-4">Audit Trail</h2>
        <AuditLogView mandateId={mandate.mandateId} />
      </div>
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div>
      <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-text font-medium">{value}</p>
    </div>
  );
}

export default MandateDetail;
