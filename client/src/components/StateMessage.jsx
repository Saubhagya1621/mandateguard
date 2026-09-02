function StateMessage({ type = "loading", title, subtitle }) {
  const ICONS = {
    loading: "◌",
    error: "✕",
    empty: "—",
  };

  const COLORS = {
    loading: "text-ink-muted",
    error: "text-oxide",
    empty: "text-ink-muted",
  };

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-line rounded-lg bg-card">
      <span className={`font-display text-3xl mb-3 ${COLORS[type]}`}>
        {ICONS[type]}
      </span>
      <p className={`font-mono text-sm uppercase tracking-wider ${COLORS[type]}`}>
        {title}
      </p>
      {subtitle && (
        <p className="text-xs text-ink-muted mt-2 max-w-xs">{subtitle}</p>
      )}
    </div>
  );
}

export default StateMessage;