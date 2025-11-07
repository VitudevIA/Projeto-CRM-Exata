import { Router, Response } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { authenticate, AuthRequest } from "../middleware/auth.js";
import { requireTenant } from "../middleware/tenant.js";
import { requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);
router.use(requireTenant);
router.use(requireRole("admin")); // Apenas admins podem ver logs de auditoria

// Listar logs de auditoria
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const {
      action,
      entity_type,
      user_id,
      date_from,
      date_to,
      page = 1,
      limit = 100,
    } = req.query;

    let query = supabaseAdmin
      .from("audit_logs")
      .select("*, user:users!audit_logs_user_id_fkey(id, full_name, email)")
      .eq("tenant_id", req.user!.tenant_id)
      .order("created_at", { ascending: false });

    if (action) {
      query = query.eq("action", action);
    }

    if (entity_type) {
      query = query.eq("entity_type", entity_type);
    }

    if (user_id) {
      query = query.eq("user_id", user_id);
    }

    if (date_from) {
      query = query.gte("created_at", date_from);
    }

    if (date_to) {
      query = query.lte("created_at", date_to);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      data: data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
      },
    });
  } catch (error: any) {
    console.error("Error listing audit logs:", error);
    res.status(500).json({ error: "Erro ao listar logs de auditoria" });
  }
});

// Buscar log por ID
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from("audit_logs")
      .select("*, user:users!audit_logs_user_id_fkey(*)")
      .eq("id", id)
      .eq("tenant_id", req.user!.tenant_id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Log não encontrado" });
    }

    res.json(data);
  } catch (error: any) {
    console.error("Error getting audit log:", error);
    res.status(500).json({ error: "Erro ao buscar log de auditoria" });
  }
});

export default router;

