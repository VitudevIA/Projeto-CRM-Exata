import { Router, Response } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { authenticate, AuthRequest } from "../middleware/auth.js";
import { requireTenant } from "../middleware/tenant.js";
import { createAuditLog } from "../services/audit.js";

const router = Router();

router.use(authenticate);
router.use(requireTenant);

// Relatório de conversão
router.get("/conversion", async (req: AuthRequest, res: Response) => {
  try {
    const { date_from, date_to } = req.query;

    let query = supabaseAdmin
      .from("clients")
      .select("id, current_stage_id, status, created_at")
      .eq("tenant_id", req.user!.tenant_id);

    if (date_from) {
      query = query.gte("created_at", date_from);
    }

    if (date_to) {
      query = query.lte("created_at", date_to);
    }

    const { data: clients, error } = await query;

    if (error) throw error;

    // Buscar estágios
    const { data: stages } = await supabaseAdmin
      .from("client_stages")
      .select("*")
      .eq("tenant_id", req.user!.tenant_id)
      .order("order_index", { ascending: true });

    // Contar por estágio
    const stageCounts: Record<string, number> = {};
    stages?.forEach((stage) => {
      stageCounts[stage.id] = 0;
    });

    clients?.forEach((client) => {
      if (client.current_stage_id && stageCounts[client.current_stage_id] !== undefined) {
        stageCounts[client.current_stage_id]++;
      }
    });

    // Calcular taxas de conversão
    const totalClients = clients?.length || 0;
    const conversionRates = stages?.map((stage) => {
      const count = stageCounts[stage.id] || 0;
      const rate = totalClients > 0 ? (count / totalClients) * 100 : 0;
      return {
        stage_id: stage.id,
        stage_name: stage.name,
        stage_type: stage.stage_type,
        count,
        rate: parseFloat(rate.toFixed(2)),
      };
    });

    await createAuditLog(req, "view", "report", undefined, null, { type: "conversion" });

    res.json({
      total_clients: totalClients,
      conversion_rates: conversionRates || [],
      stage_counts: stageCounts,
    });
  } catch (error: any) {
    console.error("Error generating conversion report:", error);
    res.status(500).json({ error: "Erro ao gerar relatório de conversão" });
  }
});

// Relatório de produtividade
router.get("/productivity", async (req: AuthRequest, res: Response) => {
  try {
    const { date_from, date_to, operator_id } = req.query;

    // Buscar chamadas
    let callsQuery = supabaseAdmin
      .from("call_logs")
      .select("operator_id, duration_seconds, status, started_at")
      .eq("tenant_id", req.user!.tenant_id)
      .eq("status", "answered");

    if (date_from) {
      callsQuery = callsQuery.gte("started_at", date_from);
    }

    if (date_to) {
      callsQuery = callsQuery.lte("started_at", date_to);
    }

    if (operator_id) {
      callsQuery = callsQuery.eq("operator_id", operator_id);
    } else if (req.user!.role === "funcionario") {
      callsQuery = callsQuery.eq("operator_id", req.user!.id);
    }

    const { data: calls, error: callsError } = await callsQuery;

    if (callsError) throw callsError;

    // Agrupar por operador
    const operatorStats: Record<string, {
      operator_id: string;
      total_calls: number;
      total_duration: number;
      avg_duration: number;
      calls_per_hour: number;
    }> = {};

    calls?.forEach((call) => {
      if (!call.operator_id) return;

      if (!operatorStats[call.operator_id]) {
        operatorStats[call.operator_id] = {
          operator_id: call.operator_id,
          total_calls: 0,
          total_duration: 0,
          avg_duration: 0,
          calls_per_hour: 0,
        };
      }

      operatorStats[call.operator_id].total_calls++;
      operatorStats[call.operator_id].total_duration += call.duration_seconds || 0;
    });

    // Buscar nomes dos operadores
    const operatorIds = Object.keys(operatorStats);
    const { data: operators } = await supabaseAdmin
      .from("users")
      .select("id, full_name, email")
      .in("id", operatorIds);

    // Calcular médias e adicionar nomes
    const productivity = Object.values(operatorStats).map((stat) => {
      const operator = operators?.find((op) => op.id === stat.operator_id);
      const avgDuration = stat.total_calls > 0 ? stat.total_duration / stat.total_calls : 0;
      const hours = calls?.length ? (new Date(date_to as string).getTime() - new Date(date_from as string).getTime()) / (1000 * 60 * 60) : 1;
      const callsPerHour = hours > 0 ? stat.total_calls / hours : 0;

      return {
        ...stat,
        operator_name: operator?.full_name || operator?.email || "Desconhecido",
        avg_duration: Math.round(avgDuration),
        calls_per_hour: parseFloat(callsPerHour.toFixed(2)),
      };
    });

    await createAuditLog(req, "view", "report", undefined, null, { type: "productivity" });

    res.json({
      productivity: productivity.sort((a, b) => b.total_calls - a.total_calls),
      period: {
        from: date_from,
        to: date_to,
      },
    });
  } catch (error: any) {
    console.error("Error generating productivity report:", error);
    res.status(500).json({ error: "Erro ao gerar relatório de produtividade" });
  }
});

// Relatório de motivos de perda
router.get("/loss-reasons", async (req: AuthRequest, res: Response) => {
  try {
    const { date_from, date_to, stage_type } = req.query;

    let query = supabaseAdmin
      .from("clients")
      .select("loss_reason_id, loss_date, current_stage_id")
      .eq("tenant_id", req.user!.tenant_id)
      .eq("status", "perdido")
      .not("loss_reason_id", "is", null);

    if (date_from) {
      query = query.gte("loss_date", date_from);
    }

    if (date_to) {
      query = query.lte("loss_date", date_to);
    }

    const { data: lostClients, error } = await query;

    if (error) throw error;

    // Buscar motivos de perda
    const reasonIds = [...new Set(lostClients?.map((c) => c.loss_reason_id).filter(Boolean) || [])];
    const { data: reasons } = await supabaseAdmin
      .from("loss_reasons")
      .select("*")
      .in("id", reasonIds)
      .eq("tenant_id", req.user!.tenant_id);

    // Contar por motivo
    const reasonCounts: Record<string, number> = {};
    lostClients?.forEach((client) => {
      if (client.loss_reason_id) {
        reasonCounts[client.loss_reason_id] = (reasonCounts[client.loss_reason_id] || 0) + 1;
      }
    });

    const lossAnalysis = reasons?.map((reason) => ({
      reason_id: reason.id,
      reason: reason.reason,
      description: reason.description,
      stage_type: reason.stage_type,
      count: reasonCounts[reason.id] || 0,
      percentage: lostClients?.length ? ((reasonCounts[reason.id] || 0) / lostClients.length) * 100 : 0,
    })).sort((a, b) => b.count - a.count);

    await createAuditLog(req, "view", "report", undefined, null, { type: "loss_reasons" });

    res.json({
      total_lost: lostClients?.length || 0,
      loss_analysis: lossAnalysis || [],
    });
  } catch (error: any) {
    console.error("Error generating loss reasons report:", error);
    res.status(500).json({ error: "Erro ao gerar relatório de motivos de perda" });
  }
});

// Relatório de tabulação
router.get("/tabulation", async (req: AuthRequest, res: Response) => {
  try {
    const { date_from, date_to } = req.query;

    let query = supabaseAdmin
      .from("call_logs")
      .select("tabulation, status")
      .eq("tenant_id", req.user!.tenant_id)
      .eq("status", "answered")
      .not("tabulation", "is", null);

    if (date_from) {
      query = query.gte("started_at", date_from);
    }

    if (date_to) {
      query = query.lte("started_at", date_to);
    }

    if (req.user!.role === "funcionario") {
      query = query.eq("operator_id", req.user!.id);
    }

    const { data: calls, error } = await query;

    if (error) throw error;

    // Contar por tabulação
    const tabulationCounts: Record<string, number> = {};
    calls?.forEach((call) => {
      if (call.tabulation) {
        tabulationCounts[call.tabulation] = (tabulationCounts[call.tabulation] || 0) + 1;
      }
    });

    const totalCalls = calls?.length || 0;
    const tabulation = Object.entries(tabulationCounts).map(([tabulation, count]) => ({
      tabulation,
      count,
      percentage: totalCalls > 0 ? ((count / totalCalls) * 100) : 0,
    })).sort((a, b) => b.count - a.count);

    await createAuditLog(req, "view", "report", undefined, null, { type: "tabulation" });

    res.json({
      total_calls: totalCalls,
      tabulation,
    });
  } catch (error: any) {
    console.error("Error generating tabulation report:", error);
    res.status(500).json({ error: "Erro ao gerar relatório de tabulação" });
  }
});

export default router;

