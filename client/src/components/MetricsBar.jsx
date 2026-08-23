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

  if (error) {
    return null;
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="grid grid-cols-5 gap-3 mb-6">
      <StatCard label="Total Mandates" value={metrics.total} accent="text-text" />
      <StatCard label="Recovery Rate" value={metrics.recoveryRate} accent="text-mint" />
      <StatCard label="Recovered" value={metrics.recovered} accent="text-mint" />
      <StatCard label="Blocked" value={metrics.blocked} accent="text-danger" />
      <StatCard label="Retrying" value={metrics.retrying} accent="text-magenta" />
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-plum-light rounded-xl p-4 border border-magenta/10">
      <p className="text-xs text-text-muted uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

export default MetricsBar;