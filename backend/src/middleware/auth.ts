import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    tenant_id: string;
    role: "admin" | "funcionario";
  };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const token = authHeader.substring(7);

    // Verificar token com Supabase
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Token inválido" });
    }

    // Buscar informações do usuário no banco
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    // Buscar role do usuário separadamente
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("tenant_id", userData.tenant_id)
      .single();

    const role = roleData?.role || "funcionario";

    req.user = {
      id: user.id,
      email: user.email || "",
      tenant_id: userData.tenant_id,
      role: role,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Erro na autenticação" });
  }
}

export function requireRole(...allowedRoles: ("admin" | "funcionario")[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    next();
  };
}

