import { useEffect, useState } from "react";
import { fetchMetrics } from "../lib/api";

function MetricsBar() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    try {
      const data = await fetchMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  if (error || !metrics) {
    return null;
  }

  return (
    <div className="border border-line rounded-lg bg-card overflow-hidden">
      <div className="grid grid-cols-5 divide-x divide-line">
        <Stat label="Total" value={metrics.total} accent="text-ink" />
        <Stat label="Recovery Rate" value={metrics.recoveryRate} accent="text-forest" />
        <Stat label="Recovered" value={metrics.recovered} accent="text-forest" />
        <Stat label="Blocked" value={metrics.blocked} accent="text-oxide" />
        <Stat label="Retrying" value={metrics.retrying} accent="text-ochre" />
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

export default MetricsBar;