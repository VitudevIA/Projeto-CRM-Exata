import { Router, Response } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { authenticate, AuthRequest } from "../middleware/auth.js";
import { requireTenant } from "../middleware/tenant.js";
import { proposalSchema } from "../utils/validation.js";
import { createAuditLog } from "../services/audit.js";

const router = Router();

router.use(authenticate);
router.use(requireTenant);

// Listar propostas
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { client_id, status, page = 1, limit = 50 } = req.query;

    let query = supabaseAdmin
      .from("proposals")
      .select("*, client:clients(id, name, cpf), created_by_user:users!proposals_created_by_fkey(id, full_name)")
      .eq("tenant_id", req.user!.tenant_id)
      .order("created_at", { ascending: false });

    if (client_id) {
      query = query.eq("client_id", client_id);
    }

    if (status) {
      query = query.eq("status", status);
    }

    // Verificar acesso ao cliente
    if (req.user!.role === "funcionario") {
      // Apenas propostas de clientes que o funcionário tem acesso
      const { data: accessibleClients } = await supabaseAdmin
        .from("clients")
        .select("id")
        .eq("tenant_id", req.user!.tenant_id)
        .or(`assigned_to.eq.${req.user!.id},created_by.eq.${req.user!.id}`);

      if (accessibleClients && accessibleClients.length > 0) {
        const clientIds = accessibleClients.map((c) => c.id);
        query = query.in("client_id", clientIds);
      } else {
        return res.json({ data: [], pagination: { page: 1, limit: 50, total: 0 } });
      }
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
    console.error("Error listing proposals:", error);
    res.status(500).json({ error: "Erro ao listar propostas" });
  }
});

// Buscar proposta por ID
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    let query = supabaseAdmin
      .from("proposals")
      .select("*, client:clients(*), created_by_user:users!proposals_created_by_fkey(*)")
      .eq("id", id)
      .eq("tenant_id", req.user!.tenant_id)
      .single();

    const { data, error } = await query;

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Proposta não encontrada" });
    }

    // Verificar acesso ao cliente
    if (req.user!.role === "funcionario") {
      const { data: client } = await supabaseAdmin
        .from("clients")
        .select("id, assigned_to, created_by")
        .eq("id", data.client_id)
        .single();

      if (!client || (client.assigned_to !== req.user!.id && client.created_by !== req.user!.id)) {
        return res.status(403).json({ error: "Acesso negado" });
      }
    }

    res.json(data);
  } catch (error: any) {
    console.error("Error getting proposal:", error);
    res.status(500).json({ error: "Erro ao buscar proposta" });
  }
});

// Criar proposta
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = proposalSchema.parse(req.body);

    // Verificar acesso ao cliente
    let clientQuery = supabaseAdmin
      .from("clients")
      .select("id")
      .eq("id", validatedData.client_id)
      .eq("tenant_id", req.user!.tenant_id)
      .single();

    if (req.user!.role === "funcionario") {
      clientQuery = clientQuery.or(`assigned_to.eq.${req.user!.id},created_by.eq.${req.user!.id}`);
    }

    const { data: client, error: clientError } = await clientQuery;

    if (clientError || !client) {
      return res.status(404).json({ error: "Cliente não encontrado ou sem acesso" });
    }

    const proposalData = {
      ...validatedData,
      tenant_id: req.user!.tenant_id,
      created_by: req.user!.id,
    };

    const { data, error } = await supabaseAdmin
      .from("proposals")
      .insert(proposalData)
      .select()
      .single();

    if (error) throw error;

    // Criar histórico
    await supabaseAdmin.from("client_history").insert({
      tenant_id: req.user!.tenant_id,
      client_id: validatedData.client_id,
      interaction_type: "proposal_created",
      title: "Proposta criada",
      description: `Proposta de R$ ${validatedData.loan_amount.toFixed(2)} em ${validatedData.installments}x de R$ ${validatedData.installment_value.toFixed(2)}`,
      metadata: {
        proposal_id: data.id,
        loan_amount: validatedData.loan_amount,
        installments: validatedData.installments,
      },
      created_by: req.user!.id,
    });

    await createAuditLog(req, "create", "proposal", data.id);

    res.status(201).json(data);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    console.error("Error creating proposal:", error);
    res.status(500).json({ error: "Erro ao criar proposta" });
  }
});

// Atualizar proposta
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Buscar proposta existente
    const { data: oldData, error: fetchError } = await supabaseAdmin
      .from("proposals")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", req.user!.tenant_id)
      .single();

    if (fetchError || !oldData) {
      return res.status(404).json({ error: "Proposta não encontrada" });
    }

    // Verificar acesso
    if (req.user!.role === "funcionario" && oldData.created_by !== req.user!.id) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const validatedData = proposalSchema.partial().parse(req.body);

    // Se mudando status para "sent", atualizar sent_at
    const updateData: any = { ...validatedData };
    if (validatedData.status === "sent" && oldData.status !== "sent") {
      updateData.sent_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from("proposals")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await createAuditLog(req, "update", "proposal", id, oldData, data);

    res.json(data);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    console.error("Error updating proposal:", error);
    res.status(500).json({ error: "Erro ao atualizar proposta" });
  }
});

// Deletar proposta
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar acesso
    const { data: proposal, error: fetchError } = await supabaseAdmin
      .from("proposals")
      .select("id, created_by")
      .eq("id", id)
      .eq("tenant_id", req.user!.tenant_id)
      .single();

    if (fetchError || !proposal) {
      return res.status(404).json({ error: "Proposta não encontrada" });
    }

    if (req.user!.role === "funcionario" && proposal.created_by !== req.user!.id) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const { error } = await supabaseAdmin
      .from("proposals")
      .delete()
      .eq("id", id);

    if (error) throw error;

    await createAuditLog(req, "delete", "proposal", id);

    res.json({ message: "Proposta deletada com sucesso" });
  } catch (error: any) {
    console.error("Error deleting proposal:", error);
    res.status(500).json({ error: "Erro ao deletar proposta" });
  }
});

export default router;

