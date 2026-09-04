const STEPS = [
  {
    n: "01",
    title: "A mandate fails",
    body: "UPI Autopay or NACH payment fails — insufficient funds, expired mandate, bank timeout. The failure and its reason are logged immediately.",
  },
  {
    n: "02",
    title: "Rules engine checks compliance",
    body: "A deterministic rules engine checks NPCI retry-window limits — max attempts, mandatory gap days. No AI involved here. If it's not allowed, the mandate is blocked, full stop.",
  },
  {
    n: "03",
    title: "AI optimizes timing, within the rules",
    body: "If a retry is allowed, an AI layer suggests the best time inside that window — say, near a likely salary date. If it ever suggests something outside the compliance window, the system silently falls back to the safe default and logs the override.",
  },
  {
    n: "04",
    title: "Every decision is logged",
    body: "Each step — failure, compliance check, AI suggestion, execution outcome — is written to an append-only audit trail, in plain language a compliance officer can read.",
  },
];

function LandingPage({ onEnter }) {
  return (
    <div className="min-h-screen bg-paper font-sans">
      <header className="border-b border-line">
        <div className="max-w-3xl mx-auto px-8 py-6 flex items-baseline justify-between">
          <p className="font-display text-xl font-semibold text-ink">MandateGuard</p>
          <button
            onClick={onEnter}
            className="text-xs font-mono uppercase tracking-wider text-ink-muted border border-line rounded px-3 py-2 hover:border-ink hover:text-ink transition"
          >
            Enter Dashboard
          </button>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-8 pt-20 pb-16">
        <p className="text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-4">
          AI Revenue Recovery — compliance-first
        </p>
        <h1 className="font-display text-5xl font-semibold text-ink leading-tight mb-6">
          Retries that never break the rules.
        </h1>
        <p className="text-lg text-ink-muted max-w-xl leading-relaxed mb-8">
          Most systems retry failed mandate payments blindly. MandateGuard enforces
          NPCI's hard retry-window limits first, then lets AI optimize timing only
          inside what's already allowed — with every decision written to an
          audit trail.
        </p>
        <button
          onClick={onEnter}
          className="text-sm font-mono uppercase tracking-wider text-card bg-ink rounded px-5 py-3 hover:opacity-90 transition"
        >
          Open the ledger →
        </button>
      </section>

      <section className="max-w-3xl mx-auto px-8 pb-16">
        <div className="border border-line rounded-lg bg-card overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-line">
            <Stat label="Recovery Rate" value="55.9%" accent="text-forest" />
            <Stat label="Mandates Processed" value="66" accent="text-ink" />
            <Stat label="Compliance-Blocked" value="26" accent="text-oxide" />
          </div>
        </div>
        <p className="text-[11px] font-mono text-ink-muted mt-2">
          From a 66-mandate synthetic batch run — full methodology in the audit log.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-8 pb-24">
        <h2 className="font-display text-2xl font-semibold text-ink mb-10">
          How it works
        </h2>

        <div className="relative pl-8">
          <div className="absolute left-3.75 top-2 bottom-2 w-px bg-line" />

          <div className="space-y-10">
            {STEPS.map((step) => (
              <div key={step.n} className="relative pl-2">
                <div className="absolute -left-10.5 top-0 w-8 h-8 rounded-full bg-ink text-card flex items-center justify-center font-mono text-xs font-semibold">
                  {step.n}
                </div>
                <h3 className="font-display text-lg font-semibold text-ink mb-1.5">
                  {step.title}
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed max-w-lg">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="max-w-3xl mx-auto px-8 py-8 flex items-center justify-between">
          <p className="text-[11px] font-mono text-ink-muted uppercase tracking-wider">
            MandateGuard — SIH / hackathon build
          </p>
          <button
            onClick={onEnter}
            className="text-xs font-mono uppercase tracking-wider text-ink-muted hover:text-ink transition"
          >
            Enter Dashboard →
          </button>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="px-5 py-4 text-center">
      <p className="text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1.5">
        {label}
      </p>
      <p className={`font-display text-2xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

export default LandingPage;