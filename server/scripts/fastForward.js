import "dotenv/config";
import mongoose from "mongoose";
import Mandate from "../src/models/Mandate.js";
import { processDueMandates } from "../src/scheduler/retryScheduler.js";

async function fastForward() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  const pastTime = new Date(Date.now() - 60 * 1000);

  const result = await Mandate.updateMany(
    { status: "retrying" },
    { $set: { nextRetryAt: pastTime } }
  );

  console.log(`Forced ${result.modifiedCount} mandates to be due for retry.`);
  console.log("Processing due mandates now (this calls the AI layer, may take a bit)...");

  await processDueMandates();

  console.log("Fast-forward pass complete.");
  await mongoose.disconnect();
}

fastForward().catch((err) => {
  console.error("Fast-forward failed:", err);
  process.exit(1);
});