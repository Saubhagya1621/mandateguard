const NAV_ITEMS = [
  { key: "overview", label: "Overview" },
  { key: "mandates", label: "Mandates" },
  { key: "audit", label: "Audit Log" },
  { key: "snapshots", label: "Snapshots" },
  { key: "rules", label: "Compliance Rules" },
];

function Sidebar({ activeSection, onNavigate }) {
  return (
    <aside className="w-56 shrink-0 border-r border-line bg-card px-4 py-6 h-screen sticky top-0">
      <h1 className="font-display text-xl font-semibold text-ink tracking-tight">
        MandateGuard
      </h1>
      <p className="text-[10px] text-ink-muted font-mono mt-0.5 mb-6 uppercase tracking-wider">
        Compliance ledger
      </p>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`text-left text-sm px-3 py-2 rounded transition font-mono ${
              activeSection === item.key
                ? "bg-paper text-ink font-medium"
                : "text-ink-muted hover:text-ink hover:bg-paper/60"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;