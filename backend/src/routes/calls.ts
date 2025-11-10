import { Router, Response, Request } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { authenticate, AuthRequest } from "../middleware/auth.js";
import { requireTenant } from "../middleware/tenant.js";
import { createAuditLog } from "../services/audit.js";
import { forticsService } from "../services/fortics.js";

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

// Buscar popup do Fortics (dados da chamada ativa) - DEVE VIR ANTES DE /:id
router.get("/popup", authenticate, requireTenant, async (req: AuthRequest, res: Response) => {
  try {
    // Verificar se Fortics está configurado
    if (!forticsService.isConfigured()) {
      return res.status(500).json({ 
        error: "Configuração do discador não encontrada" 
      });
    }

    // Buscar informações do usuário para obter o login do agente no Fortics
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("email, phone, full_name, fortics_login")
      .eq("id", req.user!.id)
      .single();

    if (!userData) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Priorizar fortics_login se configurado, senão usar email sem @
    const agentLogin = userData.fortics_login || userData.email?.split("@")[0] || req.user!.email.split("@")[0];
    
    if (!agentLogin) {
      return res.status(400).json({ 
        error: "Login do Fortics não configurado. Configure o campo 'fortics_login' no seu perfil ou use um email válido." 
      });
    }

    console.log(`📋 Buscando popup do agente: ${agentLogin}`);
    console.log(`📋 Fonte do login: ${userData.fortics_login ? 'fortics_login (configurado)' : 'email (fallback)'}`);

    try {
      // Buscar popup do Fortics
      const popupData = await forticsService.getAgentPopup(agentLogin);

      console.log(`📋 Resposta completa do Fortics popup:`, JSON.stringify(popupData, null, 2));

      if (!popupData.success || !popupData.dados) {
        console.log(`📋 Nenhuma chamada ativa - success: ${popupData.success}, dados: ${!!popupData.dados}`);
        return res.json({
          success: false,
          hasActiveCall: false,
          message: "Nenhuma chamada ativa no momento",
        });
      }

      const dados = popupData.dados;
      console.log(`📋 Dados da chamada recebidos:`, JSON.stringify(dados, null, 2));

      // Buscar ou criar cliente no CRM baseado no número
      let clientId = null;
      let clientName = dados.nome || null;

      if (dados.numero) {
        // Limpar número (remover caracteres especiais)
        const phoneClean = dados.numero.replace(/\D/g, "");

        // Buscar cliente existente
        const { data: existingClient } = await supabaseAdmin
          .from("clients")
          .select("id, name")
          .eq("tenant_id", req.user!.tenant_id)
          .eq("phone", phoneClean)
          .single();

        if (existingClient) {
          clientId = existingClient.id;
          clientName = existingClient.name;
        } else if (dados.nome && dados.nome !== agentLogin) {
          // Se não existe e temos nome, criar cliente
          const { data: newClient } = await supabaseAdmin
            .from("clients")
            .insert({
              tenant_id: req.user!.tenant_id,
              name: dados.nome,
              phone: phoneClean,
              status: "ativo",
              created_by: req.user!.id,
            })
            .select("id, name")
            .single();

          if (newClient) {
            clientId = newClient.id;
            clientName = newClient.name;
          }
        }
      }

      // Buscar ou criar log de chamada
      let callLogId = null;
      const accountCode = dados.gravacao?.split("-")[dados.gravacao?.split("-").length - 1]?.split(".")[0] || null;

      if (accountCode) {
        // Buscar chamada existente pelo accountcode
        const { data: existingCall } = await supabaseAdmin
          .from("call_logs")
          .select("id")
          .eq("tenant_id", req.user!.tenant_id)
          .eq("call_id", accountCode)
          .single();

        if (existingCall) {
          callLogId = existingCall.id;
        } else {
          // Criar novo log de chamada
          const { data: newCall } = await supabaseAdmin
            .from("call_logs")
            .insert({
              tenant_id: req.user!.tenant_id,
              call_id: accountCode,
              client_id: clientId,
              direction: "inbound",
              status: dados.status === "1" ? "answered" : "initiated",
              phone_number: dados.numero?.replace(/\D/g, "") || null,
              operator_id: req.user!.id,
              started_at: new Date().toISOString(),
            })
            .select("id")
            .single();

          if (newCall) {
            callLogId = newCall.id;
          }
        }
      }

      res.json({
        success: true,
        hasActiveCall: true,
        data: {
          protocolo: accountCode || Date.now().toString(),
          nome: clientName || dados.nome || "",
          numero: dados.numero || "",
          codigo: dados.codigo || "",
          campo1: dados.campo1 || "",
          campo2: dados.campo2 || "",
          campo3: dados.campo3 || "",
          campo4: dados.campo4 || "",
          campo5: dados.campo5 || "",
          status: dados.status || "0",
          status_descricao: dados.status_descricao || "",
          id_camp: dados.id_camp || "",
          ramal: dados.ramal || "",
          gravacao: dados.gravacao || "",
          client_id: clientId,
          call_log_id: callLogId,
        },
      });
    } catch (forticsError: any) {
      console.error("❌ Erro ao buscar popup do Fortics:", forticsError);
      // Se não há chamada ativa, retornar sucesso mas sem dados
      return res.json({
        success: false,
        hasActiveCall: false,
        message: "Nenhuma chamada ativa no momento",
      });
    }
  } catch (error: any) {
    console.error("❌ Erro geral ao buscar popup:", error);
    res.status(500).json({ 
      error: "Erro ao buscar dados da chamada",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
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
    const { phone_number, client_id, ramal } = req.body;

    console.log("📞 Click-to-call recebido:", { phone_number, ramal, client_id });

    if (!phone_number) {
      return res.status(400).json({ error: "Número de telefone é obrigatório" });
    }

    if (!ramal) {
      return res.status(400).json({ error: "Ramal é obrigatório para iniciar chamada" });
    }

    // Verificar se Fortics está configurado
    if (!forticsService.isConfigured()) {
      return res.status(500).json({ 
        error: "Configuração do discador não encontrada. Configure DISCADOR_API_URL e DISCADOR_API_KEY" 
      });
    }

    // Limpar e formatar número de telefone (remover caracteres especiais, manter apenas dígitos)
    let phoneNumberClean = phone_number.replace(/\D/g, "");
    
    // Verificar se o número tem pelo menos 10 dígitos
    if (phoneNumberClean.length < 10) {
      return res.status(400).json({ 
        error: "Número de telefone inválido. Deve ter pelo menos 10 dígitos" 
      });
    }

    // IMPORTANTE: Verificar se o número não é um ramal interno
    // Se o número tiver 4 dígitos ou menos, pode ser um ramal
    if (phoneNumberClean.length <= 4) {
      return res.status(400).json({ 
        error: "Número muito curto. Parece ser um ramal interno. Use um número de telefone externo." 
      });
    }

    // Formatação para chamadas externas no Fortics
    // Se o número não começar com código do país (55), adicionar se necessário
    // Mas primeiro, vamos tentar sem código do país (formato nacional)
    // O Fortics geralmente precisa do número no formato: DDD + número (ex: 85997185855)
    
    // Se o número tiver 11 dígitos e começar com 0, remover o 0 (formato antigo)
    if (phoneNumberClean.length === 11 && phoneNumberClean.startsWith('0')) {
      phoneNumberClean = phoneNumberClean.substring(1);
      console.log(`📞 Removido 0 inicial: ${phoneNumberClean}`);
    }

    // Se o número tiver 10 dígitos (DDD + 8 dígitos), está correto
    // Se tiver 11 dígitos (DDD + 9 dígitos), está correto
    // Se tiver mais de 11 dígitos, pode ter código do país (55)
    
    // Verificar se precisa adicionar código do país
    // Para chamadas externas no Brasil, geralmente não precisa do 55
    // Mas vamos tentar com e sem, dependendo da configuração
    
    // Por enquanto, vamos usar o número como está (formato nacional)
    // Se não funcionar, podemos tentar adicionar código do país
    
    console.log(`📞 Número formatado: ${phoneNumberClean} (original: ${phone_number}, tamanho: ${phoneNumberClean.length})`);
    
    // Validação adicional: garantir que não é um número que pode ser confundido com ramal
    // Ramais geralmente têm 3-4 dígitos
    if (phoneNumberClean.length <= 4) {
      return res.status(400).json({ 
        error: "Número muito curto para ser um telefone externo. Verifique o número." 
      });
    }

    // Gerar accountcode único para rastreamento
    const accountCode = `${Date.now()}.${Math.random().toString(36).substring(7)}`;

    console.log(`📞 Iniciando chamada via Fortics: Ramal ${ramal} → ${phoneNumberClean}`);
    console.log(`📞 Formato do número: ${phoneNumberClean.length} dígitos`);

    // IMPORTANTE: Verificar se o número pode ser confundido com ramal
    // Se o número tiver exatamente 4 dígitos, pode ser um ramal
    // Vamos adicionar validação adicional
    if (phoneNumberClean === ramal) {
      return res.status(400).json({ 
        error: "O número de destino não pode ser o mesmo que o ramal de origem" 
      });
    }

    // Chamar API Fortics usando o serviço
    let forticsResponse;
    try {
      forticsResponse = await forticsService.initiateCall(
        ramal,
        phoneNumberClean, // Usar número limpo
        accountCode,
        false // não assíncrono
      );
    } catch (forticsError: any) {
      console.error("❌ Erro na chamada Fortics:", forticsError);
      return res.status(500).json({ 
        error: "Erro ao comunicar com o discador",
        details: process.env.NODE_ENV === "development" ? forticsError.message : undefined
      });
    }

    console.log("📞 Resposta Fortics:", JSON.stringify(forticsResponse, null, 2));

    // Verificar resposta do Fortics
    if (forticsResponse.success === false) {
      console.error("❌ Fortics retornou erro:", forticsResponse);
      return res.status(500).json({ 
        error: forticsResponse.msg || "Erro ao iniciar chamada no discador",
        fortics_response: forticsResponse
      });
    }

    // Extrair call_id da resposta (pode ser o id ou accountcode)
    const callId = forticsResponse.id || accountCode;

    // Criar log de chamada no banco
    const { data: callLog, error } = await supabaseAdmin
      .from("call_logs")
      .insert({
        tenant_id: req.user!.tenant_id,
        call_id: callId,
        client_id,
        direction: "outbound",
        status: "initiated",
        phone_number: phoneNumberClean, // Salvar número limpo
        operator_id: req.user!.id,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Erro ao criar log de chamada:", error);
      // Não falhar a requisição se o log falhar
    }

    if (callLog?.id) {
      await createAuditLog(req, "create", "call", callLog.id);
    }

    console.log("✅ Chamada iniciada com sucesso:", { callId, accountCode });

    res.json({
      success: true,
      call_id: callId,
      account_code: accountCode,
      call_log_id: callLog?.id,
      message: forticsResponse.msg || "Chamada iniciada",
      fortics_response: forticsResponse,
    });
  } catch (error: any) {
    console.error("❌ Erro geral ao iniciar chamada:", error);
    console.error("❌ Stack trace:", error.stack);
    res.status(500).json({ 
      error: "Erro ao iniciar chamada",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// Criar novo log de chamada (quando popup não tem call_log_id)
router.post("/", authenticate, requireTenant, async (req: AuthRequest, res: Response) => {
  try {
    const { phone_number, direction, status, tabulation, notes, client_id } = req.body;

    if (!phone_number) {
      return res.status(400).json({ error: "Número de telefone é obrigatório" });
    }

    // Criar novo log de chamada
    const { data: callLog, error } = await supabaseAdmin
      .from("call_logs")
      .insert({
        tenant_id: req.user!.tenant_id,
        client_id: client_id || null,
        direction: direction || "inbound",
        status: status || "answered",
        phone_number: phone_number.replace(/\D/g, ""), // Limpar número
        tabulation: tabulation || null,
        notes: notes || null,
        operator_id: req.user!.id,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating call log:", error);
      return res.status(500).json({ error: "Erro ao criar log de chamada" });
    }

    // Criar histórico se tiver client_id
    if (client_id) {
      await supabaseAdmin.from("client_history").insert({
        tenant_id: req.user!.tenant_id,
        client_id,
        interaction_type: "call",
        title: "Chamada realizada",
        description: notes || `Chamada ${direction === "inbound" ? "recebida" : "realizada"}`,
        metadata: {
          call_log_id: callLog.id,
          tabulation,
          phone_number: phone_number.replace(/\D/g, ""),
        },
        created_by: req.user!.id,
      });
    }

    await createAuditLog(req, "create", "call", callLog.id);

    res.json(callLog);
  } catch (error: any) {
    console.error("Error creating call log:", error);
    res.status(500).json({ error: "Erro ao criar log de chamada" });
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

