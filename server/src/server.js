import "dotenv/config";
import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./config/db.js";
import { startRetryScheduler } from "./scheduler/retryScheduler.js";
import { setSocketInstance } from "./socket.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    },
  });

  setSocketInstance(io);

  io.on("connection", (socket) => {
    console.log("Dashboard connected:", socket.id);
  });

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  startRetryScheduler();
}

startServer();