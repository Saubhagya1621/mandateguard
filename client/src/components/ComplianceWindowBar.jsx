function ComplianceWindowBar({ createdAt, nextRetryAt, mandateExpiresAt }) {
  const start = new Date(createdAt).getTime();
  const end = new Date(mandateExpiresAt).getTime();
  const now = Date.now();

  const totalSpan = end - start;

  if (totalSpan <= 0) {
    return null;
  }

  const percent = (value) => {
    const clamped = Math.min(Math.max(value, start), end);
    return ((clamped - start) / totalSpan) * 100;
  };

  const nowPercent = percent(now);
  const retryPercent = nextRetryAt ? percent(new Date(nextRetryAt).getTime()) : null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
          Mandate Created
        </span>
        <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
          Expires
        </span>
      </div>

      <div className="relative h-2 bg-line rounded-full">
        <div
          className="absolute top-0 left-0 h-2 bg-ink/20 rounded-full"
          style={{ width: `${nowPercent}%` }}
        />

        {retryPercent !== null && (
          <div
            className="absolute -top-1.5 w-0.5 h-5 bg-ochre"
            style={{ left: `${retryPercent}%` }}
            title="Next retry due"
          />
        )}

        <div
          className="absolute -top-1.5 w-0.5 h-5 bg-ink"
          style={{ left: `${nowPercent}%` }}
          title="Now"
        />
      </div>

      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-ink rounded-full" />
          <span className="text-[11px] font-mono text-ink-muted">Now</span>
        </div>
        {retryPercent !== null && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-ochre rounded-full" />
            <span className="text-[11px] font-mono text-ink-muted">Next Retry Due</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComplianceWindowBar;