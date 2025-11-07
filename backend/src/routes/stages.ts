import { Router, Response } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { authenticate, AuthRequest } from "../middleware/auth.js";
import { requireTenant } from "../middleware/tenant.js";
import { requireRole } from "../middleware/auth.js";
import { createAuditLog } from "../services/audit.js";

const router = Router();

router.use(authenticate);
router.use(requireTenant);

// Listar estágios
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("client_stages")
      .select("*")
      .eq("tenant_id", req.user!.tenant_id)
      .order("order_index", { ascending: true });

    if (error) throw error;

    res.json(data || []);
  } catch (error: any) {
    console.error("Error listing stages:", error);
    res.status(500).json({ error: "Erro ao listar estágios" });
  }
});

// Buscar estágio por ID
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from("client_stages")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", req.user!.tenant_id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Estágio não encontrado" });
    }

    res.json(data);
  } catch (error: any) {
    console.error("Error getting stage:", error);
    res.status(500).json({ error: "Erro ao buscar estágio" });
  }
});

// Criar estágio (apenas admin)
router.post("/", requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { name, stage_type, order_index, color } = req.body;

    if (!name || !stage_type) {
      return res.status(400).json({ error: "Nome e tipo são obrigatórios" });
    }

    const { data, error } = await supabaseAdmin
      .from("client_stages")
      .insert({
        tenant_id: req.user!.tenant_id,
        name,
        stage_type,
        order_index: order_index || 0,
        color: color || "#3B82F6",
      })
      .select()
      .single();

    if (error) throw error;

    await createAuditLog(req, "create", "client_stage", data.id);

    res.status(201).json(data);
  } catch (error: any) {
    console.error("Error creating stage:", error);
    res.status(500).json({ error: "Erro ao criar estágio" });
  }
});

// Atualizar estágio (apenas admin)
router.put("/:id", requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, order_index, color } = req.body;

    const { data, error } = await supabaseAdmin
      .from("client_stages")
      .update({
        name,
        order_index,
        color,
      })
      .eq("id", id)
      .eq("tenant_id", req.user!.tenant_id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Estágio não encontrado" });
    }

    await createAuditLog(req, "update", "client_stage", id);

    res.json(data);
  } catch (error: any) {
    console.error("Error updating stage:", error);
    res.status(500).json({ error: "Erro ao atualizar estágio" });
  }
});

// Deletar estágio (apenas admin)
router.delete("/:id", requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se há clientes neste estágio
    const { data: clients } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("current_stage_id", id)
      .eq("tenant_id", req.user!.tenant_id)
      .limit(1);

    if (clients && clients.length > 0) {
      return res.status(400).json({
        error: "Não é possível deletar estágio com clientes associados",
      });
    }

    const { error } = await supabaseAdmin
      .from("client_stages")
      .delete()
      .eq("id", id)
      .eq("tenant_id", req.user!.tenant_id);

    if (error) throw error;

    await createAuditLog(req, "delete", "client_stage", id);

    res.json({ message: "Estágio deletado com sucesso" });
  } catch (error: any) {
    console.error("Error deleting stage:", error);
    res.status(500).json({ error: "Erro ao deletar estágio" });
  }
});

// Listar motivos de perda por estágio
router.get("/loss-reasons/:stage_type", async (req: AuthRequest, res: Response) => {
  try {
    const { stage_type } = req.params;

    const { data, error } = await supabaseAdmin
      .from("loss_reasons")
      .select("*")
      .eq("tenant_id", req.user!.tenant_id)
      .eq("stage_type", stage_type)
      .order("order_index", { ascending: true });

    if (error) throw error;

    res.json(data || []);
  } catch (error: any) {
    console.error("Error listing loss reasons:", error);
    res.status(500).json({ error: "Erro ao listar motivos de perda" });
  }
});

export default router;

