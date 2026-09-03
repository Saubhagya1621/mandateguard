import { useState } from "react";
import { ingestFailure } from "../lib/api";
import ExpandingButton from "./ui/ExpandingButton";

const FAILURE_REASONS = [
  "insufficient_funds",
  "mandate_expired",
  "bank_server_timeout",
  "account_frozen",
  "daily_limit_hit",
  "other",
];

function SimulateFailureForm({ onSuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    mandateId: "",
    merchantId: "",
    amount: "",
    failureReason: "insufficient_funds",
    mandateExpiresAt: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await ingestFailure({
        mandateId: form.mandateId,
        merchantId: form.merchantId,
        amount: Number(form.amount),
        failureReason: form.failureReason,
        mandateExpiresAt: new Date(form.mandateExpiresAt).toISOString(),
      });

      setForm({
        mandateId: "",
        merchantId: "",
        amount: "",
        failureReason: "insufficient_funds",
        mandateExpiresAt: "",
      });
      setIsOpen(false);
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <ExpandingButton onClick={() => setIsOpen(true)}>
        Simulate Failure
      </ExpandingButton>
    );
  }

  return (
    <div className="border border-line rounded-lg bg-card p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-ink">Simulate Failure Event</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-xs font-mono text-ink-muted hover:text-ink"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <FormField label="Mandate ID">
          <input
            required
            type="text"
            value={form.mandateId}
            onChange={(e) => updateField("mandateId", e.target.value)}
            placeholder="MND-100"
            className="w-full px-3 py-2 text-sm border border-line rounded bg-paper text-ink font-mono focus:outline-none focus:border-ink"
          />
        </FormField>

        <FormField label="Merchant ID">
          <input
            required
            type="text"
            value={form.merchantId}
            onChange={(e) => updateField("merchantId", e.target.value)}
            placeholder="MERCH-01"
            className="w-full px-3 py-2 text-sm border border-line rounded bg-paper text-ink font-mono focus:outline-none focus:border-ink"
          />
        </FormField>

        <FormField label="Amount (₹)">
          <input
            required
            type="number"
            min="1"
            value={form.amount}
            onChange={(e) => updateField("amount", e.target.value)}
            placeholder="499"
            className="w-full px-3 py-2 text-sm border border-line rounded bg-paper text-ink font-mono focus:outline-none focus:border-ink"
          />
        </FormField>

        <FormField label="Failure Reason">
          <select
            value={form.failureReason}
            onChange={(e) => updateField("failureReason", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-line rounded bg-paper text-ink font-mono focus:outline-none focus:border-ink"
          >
            {FAILURE_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {reason.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </FormField>

        <div className="col-span-2">
          <FormField label="Mandate Expires At">
            <input
              required
              type="datetime-local"
              value={form.mandateExpiresAt}
              onChange={(e) => updateField("mandateExpiresAt", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-line rounded bg-paper text-ink font-mono focus:outline-none focus:border-ink"
            />
          </FormField>
        </div>

        {error && (
          <p className="col-span-2 text-oxide text-xs font-mono">{error}</p>
        )}

        <div className="col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="text-xs font-mono uppercase tracking-wider text-card bg-ink border border-ink rounded px-4 py-2.5 hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? "Ingesting..." : "Ingest Failure Event"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

export default SimulateFailureForm;