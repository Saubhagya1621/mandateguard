import { useEffect, useState } from "react";
import { fetchMandates } from "../lib/api";
import MetricsBar from "./MetricsBar";

const STATUS_STYLES = {
  active: "text-forest border-forest",
  retrying: "text-ochre border-ochre",
  recovered: "text-forest border-forest",
  blocked: "text-oxide border-oxide",
  expired: "text-ink-muted border-ink-muted",
  failed: "text-oxide border-oxide",
};

function StampBadge({ status }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 border-2 rounded font-mono text-[11px] font-semibold uppercase tracking-wider -rotate-2 ${
        STATUS_STYLES[status] || "text-ink-muted border-ink-muted"
      }`}
    >
      {status}
    </span>
  );
}

function MandateList({ onSelectMandate }) {
  const [mandates, setMandates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadMandates();

    const interval = setInterval(() => {
      loadMandates(true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  async function loadMandates(silent = false) {
    try {
      if (!silent) setLoading(true);
      const data = await fetchMandates();
      setMandates(data.mandates);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-ink-muted font-mono text-sm">Loading ledger...</div>
    );
  }

  if (error) {
    return <div className="text-oxide font-mono text-sm">Error: {error}</div>;
  }
  const filteredMandates = mandates.filter((m) => {
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    const matchesSearch =
      searchTerm.trim() === "" ||
      m.mandateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.merchantId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <h2 className="font-display text-3xl font-semibold text-ink">
          Mandates
        </h2>
        <button
          onClick={() => loadMandates()}
          className="text-xs font-mono uppercase tracking-wider text-ink-muted border border-line rounded px-3 py-2 hover:border-ink hover:text-ink transition"
        >
          Refresh
        </button>
      </div>

      <MetricsBar />

      <div className="flex items-center gap-3 mt-8 mb-4">
        <input
          type="text"
          placeholder="Search by mandate or merchant ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-line rounded bg-card text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink font-mono"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-line rounded bg-card text-ink focus:outline-none focus:border-ink font-mono uppercase tracking-wide"
        >
          <option value="all">All Statuses</option>
          <option value="retrying">Retrying</option>
          <option value="recovered">Recovered</option>
          <option value="blocked">Blocked</option>
          <option value="expired">Expired</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {filteredMandates.length === 0 ? (
        <p className="text-ink-muted font-mono text-sm mt-8">
          No entries in the ledger.
        </p>
      ) : (
        <div className="mt-8 border border-line rounded-lg overflow-hidden bg-card">
          <div className="grid grid-cols-[1.2fr_1fr_1fr_0.8fr_1fr] gap-4 px-5 py-3 border-b border-line bg-paper">
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
              Mandate
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
              Merchant
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
              Reason
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted text-right">
              Retries
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted text-right">
              Status
            </span>
          </div>

          {filteredMandates.map((m, i) => (
            <div
              key={m._id}
              onClick={() => onSelectMandate(m.mandateId)}
              className={`grid grid-cols-[1.2fr_1fr_1fr_0.8fr_1fr] gap-4 px-5 py-4 items-center cursor-pointer hover:bg-paper transition ${
                i !== filteredMandates.length - 1 ? "border-b border-line" : ""
              }`}
            >
              <div>
                <p className="font-mono font-semibold text-ink text-sm">
                  {m.mandateId}
                </p>
                <p className="font-mono text-xs text-ink-muted mt-0.5">
                  ₹{m.amount}
                </p>
              </div>
              <p className="font-mono text-sm text-ink-muted">{m.merchantId}</p>
              <p className="text-sm text-ink-muted">
                {m.failureReason?.replace(/_/g, " ") || "—"}
              </p>
              <p className="font-mono text-sm text-ink text-right">
                {m.retryCount}
              </p>
              <div className="text-right">
                <StampBadge status={m.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MandateList;
