import { useEffect, useState } from "react";
import api from "@/services/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { Plus, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).default("pending"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  due_date: z.string().optional(),
  client_id: z.string().uuid().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  useEffect(() => {
    loadTasks();
    loadClients();
  }, [filterStatus]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (filterStatus) {
        params.status = filterStatus;
      }
      const response = await api.get("/tasks", { params });
      setTasks(response.data.data || []);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await api.get("/clients", { params: { limit: 100 } });
      setClients(response.data.data || []);
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };

  const onSubmit = async (data: TaskFormData) => {
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, data);
      } else {
        await api.post("/tasks", data);
      }
      setIsModalOpen(false);
      setEditingTask(null);
      reset();
      loadTasks();
    } catch (error: any) {
      console.error("Error saving task:", error);
      alert(error.response?.data?.error || "Erro ao salvar tarefa");
    }
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    reset({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split("T")[0] : "",
      client_id: task.client_id || "",
    });
    setIsModalOpen(true);
  };

  const handleComplete = async (taskId: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: "completed" });
      loadTasks();
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "high":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tarefas
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gerencie suas tarefas e agendamentos
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTask(null);
            reset();
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <Select
          label="Filtrar por Status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={[
            { value: "", label: "Todos" },
            { value: "pending", label: "Pendente" },
            { value: "in_progress", label: "Em Progresso" },
            { value: "completed", label: "Concluída" },
            { value: "cancelled", label: "Cancelada" },
          ]}
        />
      </div>

      {/* Tasks List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            Carregando...
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            Nenhuma tarefa encontrada
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      {getPriorityIcon(task.priority)}
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {task.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status === "pending"
                          ? "Pendente"
                          : task.status === "in_progress"
                          ? "Em Progresso"
                          : task.status === "completed"
                          ? "Concluída"
                          : "Cancelada"}
                      </span>
                    </div>
                    {task.description && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {task.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      {task.client && (
                        <span>Cliente: {task.client.name}</span>
                      )}
                      {task.due_date && (
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(task.due_date).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                      <span className="capitalize">Prioridade: {task.priority}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {task.status !== "completed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleComplete(task.id)}
                        title="Marcar como concluída"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(task)}
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
          reset();
        }}
        title={editingTask ? "Editar Tarefa" : "Nova Tarefa"}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Título *"
            {...register("title")}
            error={errors.title?.message}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição
            </label>
            <textarea
              {...register("description")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Status"
              {...register("status")}
              options={[
                { value: "pending", label: "Pendente" },
                { value: "in_progress", label: "Em Progresso" },
                { value: "completed", label: "Concluída" },
                { value: "cancelled", label: "Cancelada" },
              ]}
            />
            <Select
              label="Prioridade"
              {...register("priority")}
              options={[
                { value: "low", label: "Baixa" },
                { value: "medium", label: "Média" },
                { value: "high", label: "Alta" },
                { value: "urgent", label: "Urgente" },
              ]}
            />
            <Input
              label="Data de Vencimento"
              type="date"
              {...register("due_date")}
            />
            <Select
              label="Cliente (Opcional)"
              {...register("client_id")}
              options={[
                { value: "", label: "Nenhum" },
                ...clients.map((client) => ({
                  value: client.id,
                  label: client.name,
                })),
              ]}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingTask(null);
                reset();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingTask ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

