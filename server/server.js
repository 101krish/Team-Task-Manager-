import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config();

const port = process.env.PORT || 5000;
const nodeEnv = process.env.NODE_ENV || "development";

console.log(`[Server] Starting in ${nodeEnv} mode on port ${port}`);
console.log(`[Server] MONGO_URI: ${process.env.MONGO_URI ? "✓ Configured" : "✗ Missing"}`);

// Middleware
app.use(cors());
app.use(express.json());

if (nodeEnv !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Root route - Test if server is responding
app.get("/", (req, res) => {
  res.status(200).send("TaskFlow API is running");
});

// Favicon route - Prevent 404 errors
app.get("/favicon.ico", (req, res) => {
  res.status(204).send();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    success: true, 
    message: "API is running",
    timestamp: new Date().toISOString(),
    environment: nodeEnv
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);

// Serve frontend in production
if (nodeEnv === "production") {
  const clientDistPath = path.join(__dirname, "../client/dist");
  
  // Check if client/dist exists
  if (fs.existsSync(clientDistPath)) {
    console.log("[Server] Serving static files from client/dist");
    app.use(express.static(clientDistPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(clientDistPath, "index.html"));
    });
  } else {
    console.warn("[Server] ⚠️  client/dist not found - frontend will not be served");
  }
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server immediately (don't wait for DB)
const server = app.listen(port, () => {
  console.log(`[Server] ✓ Server started on port ${port}`);
  console.log(`[Server] Health check: http://localhost:${port}/api/health`);
});

// Connect to database in background (non-blocking)
connectDB()
  .then(() => {
    console.log(`[Database] ✓ Connected successfully`);
  })
  .catch((error) => {
    console.error(`[Database] ✗ Connection failed: ${error.message}`);
    console.error("[Database] ⚠️  Server running without database - API calls will fail");
    // Don't exit - server can still respond to health checks
  });

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[Server] SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("[Server] HTTP server closed");
    process.exit(0);
  });
});
