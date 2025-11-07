// Vercel Serverless Function - Entry Point
// Este arquivo permite que a Vercel sirva o Express como serverless function

import type { VercelRequest, VercelResponse } from "@vercel/node";

// Importar o app Express já configurado
// Usar import dinâmico para evitar problemas com ESM
let app: any;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Lazy load do app Express para evitar problemas de inicialização
    if (!app) {
      try {
        const expressApp = await import("../backend/src/index.js");
        app = expressApp.default;
      } catch (importError: any) {
        console.error("Error importing Express app:", importError);
        return res.status(500).json({ 
          error: "Erro ao inicializar servidor",
          details: process.env.NODE_ENV === "development" ? importError?.message : undefined
        });
      }
    }
    
    return app(req, res);
  } catch (error: any) {
    console.error("Handler error:", error);
    return res.status(500).json({ 
      error: "Erro interno do servidor",
      details: process.env.NODE_ENV === "development" ? error?.message : undefined
    });
  }
}
