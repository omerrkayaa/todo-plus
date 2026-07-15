import cors from "cors";
import express from "express";
import helmet from "helmet";
import { getConfig } from "./config.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import documentsRouter from "./routes/documents.js";
import usersRouter from "./routes/users.js";

export function createApp() {
  const config = getConfig({ requireAi: false });
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Bu origin için CORS erişimi kapalı."));
    },
    allowedHeaders: ["Authorization", "Content-Type"],
    methods: ["GET", "POST", "OPTIONS"],
  }));
  app.use(express.json({ limit: "64kb" }));
  app.get("/api/health", (_request, response) => response.json({ status: "ok" }));
  app.use("/api/documents", documentsRouter);
  app.use("/api/users", usersRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
