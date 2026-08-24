import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_BASE = "http://localhost:5000/api/mandates";
const DATASET_PATH = path.join(__dirname, "..", "..", "data", "synthetic-mandates.json");

async function runBatch() {
  const raw = fs.readFileSync(DATASET_PATH, "utf-8");
  const events = JSON.parse(raw);

  console.log(`Loaded ${events.length} synthetic events. Ingesting...`);

  let succeeded = 0;
  let failed = 0;

  for (const event of events) {
    try {
      const res = await fetch(`${API_BASE}/failure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mandateId: event.mandateId,
          merchantId: event.merchantId,
          amount: event.amount,
          failureReason: event.failureReason,
          mandateExpiresAt: event.mandateExpiresAt,
        }),
      });

      if (res.ok) {
        succeeded++;
      } else {
        const body = await res.json();
        console.error(`Failed to ingest ${event.mandateId}: ${res.status} - ${body.error}`);
        failed++;
      }
    } catch (error) {
      console.error(`Error ingesting ${event.mandateId}:`, error.message);
      failed++;
    }
  }

  console.log(`\nBatch complete. Succeeded: ${succeeded}, Failed: ${failed}`);
}

runBatch();