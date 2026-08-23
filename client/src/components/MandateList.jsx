import { useEffect, useState } from "react";
import { fetchMandates } from "../lib/api";

const STATUS_STYLES = {
  active: "bg-mint/20 text-mint",
  retrying: "bg-magenta/20 text-magenta",
  recovered: "bg-mint/20 text-mint",
  blocked: "bg-danger/20 text-danger",
  expired: "bg-text-muted/20 text-text-muted",
  failed: "bg-danger/20 text-danger",
};

function MandateList({ onSelectMandate }) {
  const [mandates, setMandates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMandates();
  }, []);

  async function loadMandates() {
    try {
      setLoading(true);
      const data = await fetchMandates();
      setMandates(data.mandates);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-text-muted p-6">Loading mandates...</div>;
  }

  if (error) {
    return <div className="text-danger p-6">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Mandates</h1>
        <button
          onClick={loadMandates}
          className="px-4 py-2 rounded-lg bg-magenta text-plum font-semibold hover:opacity-90 transition"
        >
          Refresh
        </button>
      </div>

      {mandates.length === 0 ? (
        <p className="text-text-muted">No mandates found.</p>
      ) : (
        <div className="grid gap-3">
          {mandates.map((m) => (
            <div
              key={m._id}
              onClick={() => onSelectMandate(m.mandateId)}
              className="bg-plum-light rounded-xl p-4 flex items-center justify-between border border-magenta/10 cursor-pointer hover:border-magenta/40 transition"
            >
              <div>
                <p className="font-semibold text-text">{m.mandateId}</p>
                <p className="text-sm text-text-muted">
                  {m.merchantId} · ₹{m.amount} · {m.failureReason || "—"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-text-muted">
                  Retries: {m.retryCount}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                    STATUS_STYLES[m.status] ||
                    "bg-text-muted/20 text-text-muted"
                  }`}
                >
                  {m.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MandateList;
