import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import clientsRoutes from "./routes/clients.js";
import stagesRoutes from "./routes/stages.js";
import tasksRoutes from "./routes/tasks.js";
import proposalsRoutes from "./routes/proposals.js";
import callsRoutes from "./routes/calls.js";
import documentsRoutes from "./routes/documents.js";
import reportsRoutes from "./routes/reports.js";
import importRoutes from "./routes/import.js";
import auditRoutes from "./routes/audit.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/stages", stagesRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/proposals", proposalsRoutes);
app.use("/api/calls", callsRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/import", importRoutes);
app.use("/api/audit", auditRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

// Apenas iniciar servidor se não estiver em ambiente Vercel
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;

