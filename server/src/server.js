import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";
import { startRetryScheduler } from "./scheduler/retryScheduler.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  startRetryScheduler();
}

startServer();