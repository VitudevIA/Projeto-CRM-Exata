import { Router, Response } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { authenticate, AuthRequest, requireRole } from "../middleware/auth.js";
import { requireTenant } from "../middleware/tenant.js";
import { clientSchema, validateCPF } from "../utils/validation.js";
import { createAuditLog } from "../services/audit.js";

const router = Router();

// Aplicar middlewares
router.use(authenticate);
router.use(requireTenant);

// Listar clientes
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { search, stage_id, status, assigned_to, page = 1, limit = 50 } = req.query;

    let query = supabaseAdmin
      .from("clients")
      .select("*, current_stage:client_stages(*), assigned_to_user:users!clients_assigned_to_fkey(id, full_name, email)")
      .eq("tenant_id", req.user!.tenant_id)
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,cpf.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    if (stage_id) {
      query = query.eq("current_stage_id", stage_id);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (assigned_to) {
      query = query.eq("assigned_to", assigned_to);
    } else if (req.user!.role === "funcionario") {
      // Funcionários só veem seus próprios clientes
      query = query.or(`assigned_to.eq.${req.user!.id},created_by.eq.${req.user!.id}`);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    await createAuditLog(req, "view", "client");

    res.json({
      data: data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
      },
    });
  } catch (error: any) {
    console.error("Error listing clients:", error);
    res.status(500).json({ error: "Erro ao listar clientes" });
  }
});

// Buscar cliente por ID
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    let query = supabaseAdmin
      .from("clients")
      .select("*, current_stage:client_stages(*), assigned_to_user:users!clients_assigned_to_fkey(id, full_name, email)")
      .eq("id", id)
      .eq("tenant_id", req.user!.tenant_id)
      .single();

    if (req.user!.role === "funcionario") {
      query = query.or(`assigned_to.eq.${req.user!.id},created_by.eq.${req.user!.id}`);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    await createAuditLog(req, "view", "client", id);

    res.json(data);
  } catch (error: any) {
    console.error("Error getting client:", error);
    res.status(500).json({ error: "Erro ao buscar cliente" });
  }
});

// Criar cliente
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = clientSchema.parse(req.body);

    // Verificar se CPF já existe no tenant
    const { data: existing } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("tenant_id", req.user!.tenant_id)
      .eq("cpf", validatedData.cpf)
      .single();

    if (existing) {
      return res.status(400).json({ error: "CPF já cadastrado" });
    }

    // Buscar estágio inicial (Lead)
    const { data: leadStage } = await supabaseAdmin
      .from("client_stages")
      .select("id")
      .eq("tenant_id", req.user!.tenant_id)
      .eq("stage_type", "lead")
      .single();

    const clientData = {
      ...validatedData,
      tenant_id: req.user!.tenant_id,
      current_stage_id: leadStage?.id || null,
      status: "ativo",
      created_by: req.user!.id,
    };

    const { data, error } = await supabaseAdmin
      .from("clients")
      .insert(clientData)
      .select()
      .single();

    if (error) throw error;

    // Criar histórico
    await supabaseAdmin.from("client_history").insert({
      tenant_id: req.user!.tenant_id,
      client_id: data.id,
      interaction_type: "note",
      title: "Cliente criado",
      description: "Cliente cadastrado no sistema",
      created_by: req.user!.id,
    });

    await createAuditLog(req, "create", "client", data.id, null, data);

    res.status(201).json(data);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    console.error("Error creating client:", error);
    res.status(500).json({ error: "Erro ao criar cliente" });
  }
});

// Atualizar cliente
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Buscar cliente existente
    let query = supabaseAdmin
      .from("clients")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", req.user!.tenant_id)
      .single();

    if (req.user!.role === "funcionario") {
      query = query.or(`assigned_to.eq.${req.user!.id},created_by.eq.${req.user!.id}`);
    }

    const { data: oldData, error: fetchError } = await query;

    if (fetchError || !oldData) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    const validatedData = clientSchema.partial().parse(req.body);

    const updateData = {
      ...validatedData,
      updated_by: req.user!.id,
    };

    const { data, error } = await supabaseAdmin
      .from("clients")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Criar histórico se houver mudanças significativas
    if (validatedData.current_stage_id && validatedData.current_stage_id !== oldData.current_stage_id) {
      await supabaseAdmin.from("client_history").insert({
        tenant_id: req.user!.tenant_id,
        client_id: id,
        interaction_type: "stage_change",
        title: "Mudança de estágio",
        description: `Cliente movido para novo estágio`,
        metadata: {
          old_stage_id: oldData.current_stage_id,
          new_stage_id: validatedData.current_stage_id,
        },
        created_by: req.user!.id,
      });
    }

    await createAuditLog(req, "update", "client", id, oldData, data);

    res.json(data);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    console.error("Error updating client:", error);
    res.status(500).json({ error: "Erro ao atualizar cliente" });
  }
});

// Deletar cliente (apenas admin)
router.delete("/:id", requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from("clients")
      .delete()
      .eq("id", id)
      .eq("tenant_id", req.user!.tenant_id);

    if (error) throw error;

    await createAuditLog(req, "delete", "client", id);

    res.json({ message: "Cliente deletado com sucesso" });
  } catch (error: any) {
    console.error("Error deleting client:", error);
    res.status(500).json({ error: "Erro ao deletar cliente" });
  }
});

// Marcar como perdido
router.post("/:id/mark-lost", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { loss_reason_id, observations } = req.body;

    if (!loss_reason_id) {
      return res.status(400).json({ error: "Motivo da perda é obrigatório" });
    }

    // Buscar estágio "perdido"
    const { data: lostStage } = await supabaseAdmin
      .from("client_stages")
      .select("id")
      .eq("tenant_id", req.user!.tenant_id)
      .eq("stage_type", "perdido")
      .single();

    if (!lostStage) {
      return res.status(400).json({ error: "Estágio 'Perdido' não encontrado" });
    }

    const { data, error } = await supabaseAdmin
      .from("clients")
      .update({
        status: "perdido",
        current_stage_id: lostStage.id,
        loss_reason_id,
        loss_observations: observations,
        loss_date: new Date().toISOString(),
        updated_by: req.user!.id,
      })
      .eq("id", id)
      .eq("tenant_id", req.user!.tenant_id)
      .select()
      .single();

    if (error) throw error;

    // Criar histórico
    await supabaseAdmin.from("client_history").insert({
      tenant_id: req.user!.tenant_id,
      client_id: id,
      interaction_type: "note",
      title: "Cliente marcado como perdido",
      description: observations || "Cliente perdido no funil",
      metadata: {
        loss_reason_id,
      },
      created_by: req.user!.id,
    });

    await createAuditLog(req, "update", "client", id);

    res.json(data);
  } catch (error: any) {
    console.error("Error marking client as lost:", error);
    res.status(500).json({ error: "Erro ao marcar cliente como perdido" });
  }
});

// Buscar histórico do cliente
router.get("/:id/history", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se cliente existe e usuário tem acesso
    let clientQuery = supabaseAdmin
      .from("clients")
      .select("id")
      .eq("id", id)
      .eq("tenant_id", req.user!.tenant_id)
      .single();

    if (req.user!.role === "funcionario") {
      clientQuery = clientQuery.or(`assigned_to.eq.${req.user!.id},created_by.eq.${req.user!.id}`);
    }

    const { error: clientError } = await clientQuery;
    if (clientError) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    const { data, error } = await supabaseAdmin
      .from("client_history")
      .select("*, created_by_user:users!client_history_created_by_fkey(id, full_name, email)")
      .eq("client_id", id)
      .eq("tenant_id", req.user!.tenant_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error: any) {
    console.error("Error getting client history:", error);
    res.status(500).json({ error: "Erro ao buscar histórico" });
  }
});

export default router;

