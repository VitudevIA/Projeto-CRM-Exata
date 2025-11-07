import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.js";

export function requireTenant(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  if (!req.user.tenant_id) {
    return res.status(400).json({ error: "Tenant não identificado" });
  }

  // Adicionar tenant_id aos query params se não estiver presente
  if (req.method === "GET" && !req.query.tenant_id) {
    req.query.tenant_id = req.user.tenant_id;
  }

  // Adicionar tenant_id ao body se não estiver presente
  if ((req.method === "POST" || req.method === "PUT" || req.method === "PATCH") && !req.body.tenant_id) {
    req.body.tenant_id = req.user.tenant_id;
  }

  next();
}

