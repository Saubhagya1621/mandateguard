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
export { fetchMandates, fetchMandateById, fetchAuditLogs };