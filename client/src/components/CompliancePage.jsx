const RULES = [
  {
    reason: "insufficient_funds",
    retryable: true,
    maxRetries: 3,
    gap: "1 day",
    rationale: "Most common failure; aligns with NPCI's 4-attempt cap (1 original + 3 retries).",
  },
  {
    reason: "bank_server_timeout",
    retryable: true,
    maxRetries: 3,
    gap: "1 day",
    rationale: "Transient technical failure; NPCI 4-attempt cap applies.",
  },
  {
    reason: "daily_limit_hit",
    retryable: true,
    maxRetries: 3,
    gap: "1 day",
    rationale: "Resets at midnight on the bank's side; next-day retry is sufficient.",
  },
  {
    reason: "other",
    retryable: true,
    maxRetries: 2,
    gap: "2 days",
    rationale: "Unclassified failure — treated conservatively with fewer retries and a longer gap.",
  },
  {
    reason: "mandate_expired",
    retryable: false,
    maxRetries: 0,
    gap: "—",
    rationale: "Cannot retry an expired mandate — requires a fresh mandate authorization from the payer.",
  },
  {
    reason: "account_frozen",
    retryable: false,
    maxRetries: 0,
    gap: "—",
    rationale: "Requires manual bank-side resolution; retrying against a frozen account may trigger fraud flags.",
  },
];

function CompliancePage() {
  return (
    <div>
      <h2 className="font-display text-3xl font-semibold text-ink mb-2">Compliance Rules</h2>
      <p className="text-sm text-ink-muted mb-8 max-w-xl">
        Retry policy derived from NPCI's UPI Autopay rules (effective August 2025):
        a maximum of 4 total attempts per mandate, with retries spaced out to avoid
        rapid-fire behavior. Full research notes are documented in the repository.
      </p>

      <div className="border border-line rounded-lg bg-card overflow-hidden">
        <div className="grid grid-cols-[1.3fr_0.8fr_0.7fr_0.7fr_1.5fr] gap-4 px-5 py-3 border-b border-line bg-paper">
          <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">Failure Reason</span>
          <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">Retryable</span>
          <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">Max Retries</span>
          <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">Min Gap</span>
          <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">Rationale</span>
        </div>

        {RULES.map((rule, i) => (
          <div
            key={rule.reason}
            className={`grid grid-cols-[1.3fr_0.8fr_0.7fr_0.7fr_1.5fr] gap-4 px-5 py-4 items-start ${
              i !== RULES.length - 1 ? "border-b border-line" : ""
            }`}
          >
            <p className="font-mono text-sm text-ink">{rule.reason.replace(/_/g, " ")}</p>
            <p
              className={`text-[11px] font-mono uppercase font-semibold ${
                rule.retryable ? "text-forest" : "text-oxide"
              }`}
            >
              {rule.retryable ? "Yes" : "No"}
            </p>
            <p className="font-mono text-sm text-ink">{rule.maxRetries}</p>
            <p className="font-mono text-sm text-ink">{rule.gap}</p>
            <p className="text-sm text-ink-muted leading-relaxed">{rule.rationale}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 border border-dashed border-line rounded-lg p-5 bg-card">
        <p className="text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-2">
          Known Simplifications
        </p>
        <ul className="text-sm text-ink-muted space-y-1.5 leading-relaxed">
          <li>• Staggered 24h/72h/168h retry sequence not implemented — this MVP uses a flat minimum-gap value per reason.</li>
          <li>• No time-of-day execution windowing (NPCI non-peak hours before 10 AM / 1–5 PM / after 9:30 PM).</li>
          <li>• NACH and UPI Autopay are treated under one unified rule set for scope reasons.</li>
        </ul>
      </div>
    </div>
  );
}

export default CompliancePage;