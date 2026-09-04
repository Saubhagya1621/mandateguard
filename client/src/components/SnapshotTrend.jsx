import { useEffect, useState } from "react";
import { createSnapshot, fetchSnapshots } from "../lib/api";

function SnapshotTrend({ forceOpen = false }) {
  const [snapshots, setSnapshots] = useState([]);
  const [labelInput, setLabelInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(forceOpen);

  useEffect(() => {
    if (isOpen) {
      loadSnapshots();
    }
  }, [isOpen]);

  async function loadSnapshots() {
    try {
      const data = await fetchSnapshots();
      setSnapshots(data.snapshots);
    } catch {
      // silent — snapshot trend is a nice-to-have, don't break the page
    }
  }

  async function handleCapture() {
    setSaving(true);
    try {
      await createSnapshot(labelInput);
      setLabelInput("");
      await loadSnapshots();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs font-mono uppercase tracking-wider text-ink-muted border border-line rounded px-3 py-2 hover:border-ink hover:text-ink transition"
      >
        View Snapshot Trend
      </button>
    );
  }

  const showCloseButton = !forceOpen;

  return (
    <div className="border border-line rounded-lg bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-ink">Recovery Rate Trend</h3>
        {showCloseButton && (
          <button
            onClick={() => setIsOpen(false)}
            className="text-xs font-mono text-ink-muted hover:text-ink"
          >
            Close
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-5">
        <input
          type="text"
          placeholder="Snapshot label (e.g. before fast-forward)"
          value={labelInput}
          onChange={(e) => setLabelInput(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-line rounded bg-paper text-ink font-mono focus:outline-none focus:border-ink"
        />
        <button
          onClick={handleCapture}
          disabled={saving}
          className="text-xs font-mono uppercase tracking-wider text-card bg-ink border border-ink rounded px-3 py-2 hover:opacity-90 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Capture Now"}
        </button>
      </div>

      {snapshots.length === 0 ? (
        <p className="text-ink-muted font-mono text-sm">No snapshots captured yet.</p>
      ) : (
        <div className="space-y-2">
          {snapshots.map((s, i) => (
            <div
              key={s._id}
              className="flex items-center justify-between py-2 border-b border-line last:border-0"
            >
              <div>
                <p className="font-mono text-sm text-ink">
                  {s.label || `Snapshot ${i + 1}`}
                </p>
                <p className="font-mono text-[11px] text-ink-muted">
                  {new Date(s.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-xl font-semibold text-forest">{s.recoveryRate}</p>
                <p className="font-mono text-[11px] text-ink-muted">
                  {s.recovered} recovered / {s.blocked} blocked
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SnapshotTrend;