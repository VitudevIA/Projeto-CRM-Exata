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
  // Lazy load do app Express para evitar problemas de inicialização
  if (!app) {
    const expressApp = await import("../backend/src/index.js");
    app = expressApp.default;
  }
  
  return app(req, res);
}
