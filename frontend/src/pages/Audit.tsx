import { useEffect, useState } from "react";
import api from "@/services/api";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";
import { Filter, Download } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Audit() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: "",
    entity_type: "",
    user_id: "",
    date_from: "",
    date_to: "",
  });

  useEffect(() => {
    if (user?.role === "admin") {
      loadLogs();
    }
  }, [user, filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      // Nota: A API de auditoria precisa ser implementada no backend
      // Por enquanto, vamos usar uma chamada genérica
      const response = await api.get("/audit", {
        params: filters,
      });
      setLogs(response.data.data || []);
    } catch (error: any) {
      // Se a rota não existir ainda, mostrar mensagem
      if (error.response?.status === 404) {
        console.log("Audit endpoint not implemented yet");
        setLogs([]);
      } else {
        console.error("Error loading audit logs:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "update":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "delete":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "view":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          Acesso negado. Apenas administradores podem visualizar logs de auditoria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Logs de Auditoria
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Registro de todas as ações realizadas no sistema
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Ação"
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            options={[
              { value: "", label: "Todas" },
              { value: "create", label: "Criar" },
              { value: "update", label: "Atualizar" },
              { value: "delete", label: "Deletar" },
              { value: "view", label: "Visualizar" },
            ]}
          />
          <Select
            label="Tipo de Entidade"
            value={filters.entity_type}
            onChange={(e) => setFilters({ ...filters, entity_type: e.target.value })}
            options={[
              { value: "", label: "Todas" },
              { value: "client", label: "Cliente" },
              { value: "task", label: "Tarefa" },
              { value: "proposal", label: "Proposta" },
              { value: "document", label: "Documento" },
            ]}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Data Inicial"
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
            />
            <Input
              label="Data Final"
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            variant="secondary"
            onClick={() => {
              setFilters({
                action: "",
                entity_type: "",
                user_id: "",
                date_from: "",
                date_to: "",
              });
            }}
          >
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            Carregando...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            Nenhum log encontrado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Entidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Detalhes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.user?.full_name || log.user?.email || "Sistema"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getActionColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.entity_type} {log.entity_id ? `#${log.entity_id.substring(0, 8)}` : ""}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {log.new_values && Object.keys(log.new_values).length > 0 && (
                        <span className="text-xs">
                          {Object.keys(log.new_values).length} campos alterados
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

