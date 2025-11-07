// Vercel Serverless Function - Entry Point
// Este arquivo permite que a Vercel sirva o Express como serverless function

import type { VercelRequest, VercelResponse } from "@vercel/node";

// Importar o app Express já configurado
import app from "../backend/src/index.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  return app(req, res);
}
