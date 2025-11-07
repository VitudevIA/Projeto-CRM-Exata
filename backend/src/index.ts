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
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Desabilitar CSP para permitir requisições
  })
);
// Configurar CORS para aceitar múltiplos origins
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

// Adicionar origins da Vercel automaticamente
if (process.env.VERCEL) {
  const vercelUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercelUrl) {
    allowedOrigins.push(`https://${vercelUrl}`);
  }
  // Adicionar também o domínio de produção se existir
  if (process.env.VERCEL_ENV === "production") {
    allowedOrigins.push("https://projetocrmexata.vercel.app");
    allowedOrigins.push("https://projeto-crm-exata.vercel.app");
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requisições sem origin (mobile apps, Postman, etc)
      if (!origin) return callback(null, true);
      
      // Verificar se o origin está na lista de permitidos
      if (allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
        return callback(null, true);
      }
      
      // Em desenvolvimento, permitir qualquer origin
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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

