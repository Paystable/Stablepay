// Import centralized environment configuration
import './env-config';

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import apiRoutes from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectToMongoDB } from "./mongodb";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// API Routes
app.use(apiRoutes);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize MongoDB connection
  try {
    const mongoDb = await connectToMongoDB();
    if (mongoDb) {
      console.log('✅ MongoDB connection established');
    } else {
      console.log('🔄 Running without MongoDB - using mock data');
    }
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    console.log('🔄 Running without MongoDB - using mock data');
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = Number(process.env.PORT) || 8080;
  server.listen(PORT, "0.0.0.0", async () => {
    const colors = await import("picocolors");
    const { bold, green } = colors.default;

    console.log();
    console.log(`  ${bold(green("➜"))}  ${bold("Local")}: ${green(`http://localhost:${PORT}`)}`);
    console.log(`  ${bold(green("➜"))}  ${bold("Network")}: ${green(`http://0.0.0.0:${PORT}`)}`);
    console.log();
  });
})();