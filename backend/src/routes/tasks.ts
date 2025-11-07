import { Router, Response } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { authenticate, AuthRequest } from "../middleware/auth.js";
import { requireTenant } from "../middleware/tenant.js";
import { taskSchema } from "../utils/validation.js";
import { createAuditLog } from "../services/audit.js";

const router = Router();

router.use(authenticate);
router.use(requireTenant);

// Listar tarefas
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { status, assigned_to, client_id, due_date_from, due_date_to, page = 1, limit = 50 } = req.query;

    let query = supabaseAdmin
      .from("tasks")
      .select("*, client:clients(id, name, cpf), assigned_to_user:users!tasks_assigned_to_fkey(id, full_name, email), created_by_user:users!tasks_created_by_fkey(id, full_name)")
      .eq("tenant_id", req.user!.tenant_id)
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (assigned_to) {
      query = query.eq("assigned_to", assigned_to);
    } else if (req.user!.role === "funcionario") {
      // Funcionários só veem suas próprias tarefas
      query = query.or(`assigned_to.eq.${req.user!.id},created_by.eq.${req.user!.id}`);
    }

    if (client_id) {
      query = query.eq("client_id", client_id);
    }

    if (due_date_from) {
      query = query.gte("due_date", due_date_from);
    }

    if (due_date_to) {
      query = query.lte("due_date", due_date_to);
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
    console.error("Error listing tasks:", error);
    res.status(500).json({ error: "Erro ao listar tarefas" });
  }
});

// Buscar tarefa por ID
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    let query = supabaseAdmin
      .from("tasks")
      .select("*, client:clients(*), assigned_to_user:users!tasks_assigned_to_fkey(*), created_by_user:users!tasks_created_by_fkey(*)")
      .eq("id", id)
      .eq("tenant_id", req.user!.tenant_id)
      .single();

    if (req.user!.role === "funcionario") {
      query = query.or(`assigned_to.eq.${req.user!.id},created_by.eq.${req.user!.id}`);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    res.json(data);
  } catch (error: any) {
    console.error("Error getting task:", error);
    res.status(500).json({ error: "Erro ao buscar tarefa" });
  }
});

// Criar tarefa
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = taskSchema.parse(req.body);

    const taskData = {
      ...validatedData,
      tenant_id: req.user!.tenant_id,
      created_by: req.user!.id,
      assigned_to: validatedData.assigned_to || req.user!.id,
    };

    const { data, error } = await supabaseAdmin
      .from("tasks")
      .insert(taskData)
      .select()
      .single();

    if (error) throw error;

    // Criar histórico se associada a cliente
    if (validatedData.client_id) {
      await supabaseAdmin.from("client_history").insert({
        tenant_id: req.user!.tenant_id,
        client_id: validatedData.client_id,
        interaction_type: "task_created",
        title: "Tarefa criada",
        description: validatedData.title,
        metadata: {
          task_id: data.id,
        },
        created_by: req.user!.id,
      });
    }

    await createAuditLog(req, "create", "task", data.id);

    res.status(201).json(data);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Erro ao criar tarefa" });
  }
});

// Atualizar tarefa
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar acesso
    let query = supabaseAdmin
      .from("tasks")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", req.user!.tenant_id)
      .single();

    if (req.user!.role === "funcionario") {
      query = query.or(`assigned_to.eq.${req.user!.id},created_by.eq.${req.user!.id}`);
    }

    const { data: oldData, error: fetchError } = await query;

    if (fetchError || !oldData) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    const validatedData = taskSchema.partial().parse(req.body);

    const updateData: any = {
      ...validatedData,
    };

    // Se marcando como completa, adicionar completed_at
    if (validatedData.status === "completed" && oldData.status !== "completed") {
      updateData.completed_at = new Date().toISOString();

      // Criar histórico se associada a cliente
      if (oldData.client_id) {
        await supabaseAdmin.from("client_history").insert({
          tenant_id: req.user!.tenant_id,
          client_id: oldData.client_id,
          interaction_type: "task_completed",
          title: "Tarefa concluída",
          description: oldData.title,
          metadata: {
            task_id: id,
          },
          created_by: req.user!.id,
        });
      }
    } else if (validatedData.status !== "completed" && oldData.status === "completed") {
      updateData.completed_at = null;
    }

    const { data, error } = await supabaseAdmin
      .from("tasks")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await createAuditLog(req, "update", "task", id, oldData, data);

    res.json(data);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Erro ao atualizar tarefa" });
  }
});

// Deletar tarefa
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar acesso
    let query = supabaseAdmin
      .from("tasks")
      .select("id, created_by")
      .eq("id", id)
      .eq("tenant_id", req.user!.tenant_id)
      .single();

    if (req.user!.role === "funcionario") {
      query = query.eq("created_by", req.user!.id);
    }

    const { data: task, error: fetchError } = await query;

    if (fetchError || !task) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    const { error } = await supabaseAdmin
      .from("tasks")
      .delete()
      .eq("id", id);

    if (error) throw error;

    await createAuditLog(req, "delete", "task", id);

    res.json({ message: "Tarefa deletada com sucesso" });
  } catch (error: any) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Erro ao deletar tarefa" });
  }
});

export default router;

