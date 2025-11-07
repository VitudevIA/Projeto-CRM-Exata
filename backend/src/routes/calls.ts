import { Router, Response, Request } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { authenticate, AuthRequest } from "../middleware/auth.js";
import { requireTenant } from "../middleware/tenant.js";
import { createAuditLog } from "../services/audit.js";

const router = Router();

// Webhook do discador (não requer autenticação normal, usa secret)
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const webhookSecret = req.headers["x-webhook-secret"];
    const expectedSecret = process.env.DISCADOR_WEBHOOK_SECRET;

    if (webhookSecret !== expectedSecret) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { event, data } = req.body;

    // Eventos possíveis: call_started, call_answered, call_ended, call_failed
    if (event === "call_started") {
      // Chamada iniciada - criar log
      const { call_id, phone_number, direction, operator_id, tenant_id } = data;

      const { data: callLog, error } = await supabaseAdmin
        .from("call_logs")
        .insert({
          tenant_id,
          call_id,
          direction: direction || "outbound",
          status: "initiated",
          phone_number,
          operator_id,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating call log:", error);
      }

      // Abrir tela de tabulação (será implementado no frontend)
      // Enviar evento via WebSocket ou notificação push

      res.json({ success: true, call_log_id: callLog?.id });
    } else if (event === "call_answered") {
      // Chamada atendida - atualizar log
      const { call_id, duration } = data;

      const { error } = await supabaseAdmin
        .from("call_logs")
        .update({
          status: "answered",
          duration_seconds: duration,
          ended_at: new Date().toISOString(),
        })
        .eq("call_id", call_id);

      if (error) {
        console.error("Error updating call log:", error);
      }

      res.json({ success: true });
    } else if (event === "call_ended") {
      // Chamada finalizada
      const { call_id, duration, recording_url } = data;

      const { error } = await supabaseAdmin
        .from("call_logs")
        .update({
          status: "answered",
          duration_seconds: duration,
          recording_url,
          ended_at: new Date().toISOString(),
        })
        .eq("call_id", call_id);

      if (error) {
        console.error("Error updating call log:", error);
      }

      res.json({ success: true });
    } else if (event === "call_failed") {
      // Chamada falhou
      const { call_id, reason } = data;

      const { error } = await supabaseAdmin
        .from("call_logs")
        .update({
          status: "failed",
          ended_at: new Date().toISOString(),
        })
        .eq("call_id", call_id);

      if (error) {
        console.error("Error updating call log:", error);
      }

      res.json({ success: true });
    } else {
      res.json({ success: true, message: "Event not handled" });
    }
  } catch (error: any) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Erro ao processar webhook" });
  }
});

// Rotas autenticadas
router.use(authenticate);
router.use(requireTenant);

// Listar chamadas
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { client_id, operator_id, status, date_from, date_to, page = 1, limit = 50 } = req.query;

    let query = supabaseAdmin
      .from("call_logs")
      .select("*, client:clients(id, name, cpf), operator:users!call_logs_operator_id_fkey(id, full_name)")
      .eq("tenant_id", req.user!.tenant_id)
      .order("started_at", { ascending: false });

    if (client_id) {
      query = query.eq("client_id", client_id);
    }

    if (operator_id) {
      query = query.eq("operator_id", operator_id);
    } else if (req.user!.role === "funcionario") {
      // Funcionários só veem suas próprias chamadas
      query = query.eq("operator_id", req.user!.id);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (date_from) {
      query = query.gte("started_at", date_from);
    }

    if (date_to) {
      query = query.lte("started_at", date_to);
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
    console.error("Error listing calls:", error);
    res.status(500).json({ error: "Erro ao listar chamadas" });
  }
});

// Buscar chamada por ID
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    let query = supabaseAdmin
      .from("call_logs")
      .select("*, client:clients(*), operator:users!call_logs_operator_id_fkey(*)")
      .eq("id", id)
      .eq("tenant_id", req.user!.tenant_id)
      .single();

    if (req.user!.role === "funcionario") {
      query = query.eq("operator_id", req.user!.id);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Chamada não encontrada" });
    }

    res.json(data);
  } catch (error: any) {
    console.error("Error getting call:", error);
    res.status(500).json({ error: "Erro ao buscar chamada" });
  }
});

// Click-to-call
router.post("/click-to-call", async (req: AuthRequest, res: Response) => {
  try {
    const { phone_number, client_id } = req.body;

    if (!phone_number) {
      return res.status(400).json({ error: "Número de telefone é obrigatório" });
    }

    // Chamar API do discador (Fortics BPX)
    const discadorApiUrl = process.env.DISCADOR_API_URL;
    const discadorApiKey = process.env.DISCADOR_API_KEY;

    if (!discadorApiUrl || !discadorApiKey) {
      return res.status(500).json({ error: "Configuração do discador não encontrada" });
    }

    // Fazer requisição para o discador
    const response = await fetch(`${discadorApiUrl}/api/call/initiate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${discadorApiKey}`,
      },
      body: JSON.stringify({
        phone_number,
        operator_id: req.user!.id,
        tenant_id: req.user!.tenant_id,
        client_id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.message || "Erro ao iniciar chamada" });
    }

    const callData = await response.json();

    // Criar log de chamada
    const { data: callLog, error } = await supabaseAdmin
      .from("call_logs")
      .insert({
        tenant_id: req.user!.tenant_id,
        call_id: callData.call_id,
        client_id,
        direction: "outbound",
        status: "initiated",
        phone_number,
        operator_id: req.user!.id,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating call log:", error);
    }

    await createAuditLog(req, "create", "call", callLog?.id);

    res.json({
      success: true,
      call_id: callData.call_id,
      call_log_id: callLog?.id,
      message: "Chamada iniciada",
    });
  } catch (error: any) {
    console.error("Error initiating call:", error);
    res.status(500).json({ error: "Erro ao iniciar chamada" });
  }
});

// Atualizar tabulação da chamada
router.put("/:id/tabulation", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { tabulation, notes, client_id } = req.body;

    // Verificar acesso
    let query = supabaseAdmin
      .from("call_logs")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", req.user!.tenant_id)
      .single();

    if (req.user!.role === "funcionario") {
      query = query.eq("operator_id", req.user!.id);
    }

    const { data: callLog, error: fetchError } = await query;

    if (fetchError || !callLog) {
      return res.status(404).json({ error: "Chamada não encontrada" });
    }

    const updateData: any = {
      tabulation,
      notes,
    };

    // Se client_id foi fornecido e diferente do atual, atualizar
    if (client_id && client_id !== callLog.client_id) {
      updateData.client_id = client_id;
    }

    const { data, error } = await supabaseAdmin
      .from("call_logs")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Criar ou atualizar cliente se necessário
    if (client_id) {
      // Criar histórico
      await supabaseAdmin.from("client_history").insert({
        tenant_id: req.user!.tenant_id,
        client_id,
        interaction_type: "call",
        title: "Chamada realizada",
        description: notes || `Chamada ${callLog.direction === "inbound" ? "recebida" : "realizada"}`,
        metadata: {
          call_log_id: id,
          tabulation,
          duration_seconds: callLog.duration_seconds,
        },
        created_by: req.user!.id,
      });
    }

    await createAuditLog(req, "update", "call", id);

    res.json(data);
  } catch (error: any) {
    console.error("Error updating call tabulation:", error);
    res.status(500).json({ error: "Erro ao atualizar tabulação" });
  }
});

// Sincronizar mailing do discador
router.post("/sync-mailing", authenticate, requireTenant, async (req: AuthRequest, res: Response) => {
  try {
    const { mailing_data } = req.body;

    if (!mailing_data || !Array.isArray(mailing_data)) {
      return res.status(400).json({ error: "Dados do mailing inválidos" });
    }

    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[],
    };

    for (const item of mailing_data) {
      try {
        const { cpf, name, phone, email, lead_source } = item;

        if (!cpf || !name || !phone) {
          results.errors.push(`Item inválido: ${name || "sem nome"}`);
          continue;
        }

        // Buscar cliente existente
        const { data: existing } = await supabaseAdmin
          .from("clients")
          .select("id")
          .eq("tenant_id", req.user!.tenant_id)
          .eq("cpf", cpf.replace(/\D/g, ""))
          .single();

        if (existing) {
          // Atualizar cliente existente
          await supabaseAdmin
            .from("clients")
            .update({
              name,
              phone,
              email,
              lead_source: lead_source || "mailing",
              updated_by: req.user!.id,
            })
            .eq("id", existing.id);

          results.updated++;
        } else {
          // Buscar estágio inicial
          const { data: leadStage } = await supabaseAdmin
            .from("client_stages")
            .select("id")
            .eq("tenant_id", req.user!.tenant_id)
            .eq("stage_type", "lead")
            .single();

          // Criar novo cliente
          await supabaseAdmin.from("clients").insert({
            tenant_id: req.user!.tenant_id,
            cpf: cpf.replace(/\D/g, ""),
            name,
            phone,
            email,
            is_whatsapp: false,
            lead_source: lead_source || "mailing",
            current_stage_id: leadStage?.id || null,
            status: "ativo",
            created_by: req.user!.id,
          });

          results.created++;
        }
      } catch (error: any) {
        results.errors.push(`Erro ao processar item: ${error.message}`);
      }
    }

    await createAuditLog(req, "create", "mailing_sync", undefined, null, { results });

    res.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error("Error syncing mailing:", error);
    res.status(500).json({ error: "Erro ao sincronizar mailing" });
  }
});

export default router;

