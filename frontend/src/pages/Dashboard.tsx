import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";
import { Users, TrendingUp, DollarSign, Clock, CheckCircle } from "lucide-react";

interface DashboardStats {
  total_clients: number;
  active_clients: number;
  lost_clients: number;
  conversion_rate: number;
  total_proposals: number;
  total_proposals_value: number;
  pending_tasks: number;
  today_tasks: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentClients, setRecentClients] = useState<any[]>([]);
  const [todayTasks, setTodayTasks] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log("Loading dashboard data...");

      // Buscar clientes recentes
      console.log("Fetching clients...");
      const clientsRes = await api.get("/clients", {
        params: { limit: 5, page: 1 },
      });
      console.log("Clients response:", clientsRes.data);

      // Buscar tarefas do dia
      const today = new Date().toISOString().split("T")[0];
      console.log("Fetching tasks for today:", today);
      const tasksRes = await api.get("/tasks", {
        params: {
          due_date_from: today,
          due_date_to: today,
          status: "pending",
          limit: 5,
        },
      });
      console.log("Tasks response:", tasksRes.data);

      // Calcular estatísticas básicas
      const totalClients = clientsRes.data.pagination?.total || 0;
      const activeClients = clientsRes.data.data?.filter((c: any) => c.status === "ativo").length || 0;
      const lostClients = clientsRes.data.data?.filter((c: any) => c.status === "perdido").length || 0;

      // Buscar propostas
      console.log("Fetching proposals...");
      const proposalsRes = await api.get("/proposals", {
        params: { limit: 100 },
      });
      console.log("Proposals response:", proposalsRes.data);

      const proposals = proposalsRes.data.data || [];
      const totalProposals = proposals.length;
      const totalProposalsValue = proposals.reduce(
        (sum: number, p: any) => sum + (p.loan_amount || 0),
        0
      );

      // Buscar todas as tarefas pendentes
      console.log("Fetching all pending tasks...");
      const allTasksRes = await api.get("/tasks", {
        params: { status: "pending", limit: 100 },
      });
      console.log("All tasks response:", allTasksRes.data);

      const pendingTasks = allTasksRes.data.pagination?.total || 0;
      const todayTasksCount = tasksRes.data.data?.length || 0;

      setStats({
        total_clients: totalClients,
        active_clients: activeClients,
        lost_clients: lostClients,
        conversion_rate: totalClients > 0 ? ((activeClients / totalClients) * 100) : 0,
        total_proposals: totalProposals,
        total_proposals_value: totalProposalsValue,
        pending_tasks: pendingTasks,
        today_tasks: todayTasksCount,
      });

      setRecentClients(clientsRes.data.data || []);
      setTodayTasks(tasksRes.data.data || []);
      console.log("Dashboard data loaded successfully");
    } catch (error: any) {
      console.error("Error loading dashboard:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      // Mesmo com erro, mostrar o dashboard vazio
      setStats({
        total_clients: 0,
        active_clients: 0,
        lost_clients: 0,
        conversion_rate: 0,
        total_proposals: 0,
        total_proposals_value: 0,
        pending_tasks: 0,
        today_tasks: 0,
      });
    } finally {
      setLoading(false);
      console.log("Dashboard loading finished");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total de Clientes",
      value: stats?.total_clients || 0,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Clientes Ativos",
      value: stats?.active_clients || 0,
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      title: "Taxa de Conversão",
      value: `${(stats?.conversion_rate || 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: "bg-purple-500",
    },
    {
      title: "Carteira de Oportunidades",
      value: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(stats?.total_proposals_value || 0),
      icon: DollarSign,
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Bem-vindo, {user?.full_name || user?.email}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                    {card.value}
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clientes Recentes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Clientes Recentes
            </h2>
          </div>
          <div className="p-6">
            {recentClients.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nenhum cliente cadastrado ainda
              </p>
            ) : (
              <div className="space-y-4">
                {recentClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {client.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {client.phone}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        client.status === "ativo"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : client.status === "perdido"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {client.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tarefas do Dia */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tarefas de Hoje
              </h2>
              <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded">
                {stats?.today_tasks || 0}
              </span>
            </div>
          </div>
          <div className="p-6">
            {todayTasks.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nenhuma tarefa para hoje
              </p>
            ) : (
              <div className="space-y-4">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {task.title}
                      </p>
                      {task.client && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Cliente: {task.client.name}
                        </p>
                      )}
                      {task.due_date && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {new Date(task.due_date).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        task.priority === "urgent"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : task.priority === "high"
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

