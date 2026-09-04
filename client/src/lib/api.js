const API_BASE = "http://localhost:5000/api";

async function fetchMandates() {
  const res = await fetch(`${API_BASE}/mandates`);
  if (!res.ok) {
    throw new Error("Failed to fetch mandates");
  }
  return res.json();
}

async function fetchMandateById(mandateId) {
  const res = await fetch(`${API_BASE}/mandates/${mandateId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch mandate");
  }
  return res.json();
}
async function fetchAuditLogs(mandateId) {
  const res = await fetch(`${API_BASE}/mandates/${mandateId}/audit-logs`);
  if (!res.ok) {
    throw new Error("Failed to fetch audit logs");
  }
  return res.json();
}
async function fetchMetrics() {
  const res = await fetch(`${API_BASE}/mandates/metrics/summary`);
  if (!res.ok) {
    throw new Error("Failed to fetch metrics");
  }
  return res.json();
}
async function ingestFailure(payload) {
  const res = await fetch(`${API_BASE}/mandates/failure`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to ingest failure event");
  }

  return data;
}

async function createSnapshot(label) {
  const res = await fetch(`${API_BASE}/mandates/metrics/snapshot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label }),
  });
  if (!res.ok) {
    throw new Error("Failed to create snapshot");
  }
  return res.json();
}

async function fetchSnapshots() {
  const res = await fetch(`${API_BASE}/mandates/metrics/snapshots`);
  if (!res.ok) {
    throw new Error("Failed to fetch snapshots");
  }
  return res.json();
}

async function fetchAllAuditLogs() {
  const res = await fetch(`${API_BASE}/mandates/audit-logs/all`);
  if (!res.ok) {
    throw new Error("Failed to fetch global audit logs");
  }
  return res.json();
}
export {
  fetchMandates,
  fetchMandateById,
  fetchAuditLogs,
  fetchMetrics,
  ingestFailure,
  createSnapshot,
  fetchSnapshots,
  fetchAllAuditLogs,
};