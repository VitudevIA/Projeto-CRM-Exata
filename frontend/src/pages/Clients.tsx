import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Plus, Search, Edit, Eye, Phone } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const clientSchema = z.object({
  cpf: z.string().min(11, "CPF inválido"),
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phone: z.string().min(10, "Telefone inválido"),
  is_whatsapp: z.boolean().default(false),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().optional(),
  state: z.string().optional(),
  lead_source: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  useEffect(() => {
    loadClients();
  }, [search]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await api.get("/clients", {
        params: {
          search: search || undefined,
          limit: 50,
          page: 1,
        },
      });
      setClients(response.data.data || []);
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ClientFormData) => {
    try {
      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, data);
      } else {
        await api.post("/clients", data);
      }
      setIsModalOpen(false);
      setEditingClient(null);
      reset();
      loadClients();
    } catch (error: any) {
      console.error("Error saving client:", error);
      alert(error.response?.data?.error || "Erro ao salvar cliente");
    }
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    reset({
      cpf: client.cpf,
      name: client.name,
      phone: client.phone,
      is_whatsapp: client.is_whatsapp,
      email: client.email || "",
      city: client.city || "",
      state: client.state || "",
      lead_source: client.lead_source || "",
    });
    setIsModalOpen(true);
  };

  const handleClickToCall = async (phone: string, clientId?: string) => {
    // Pedir ramal ao usuário
    const ramal = prompt("Digite o número do ramal para iniciar a chamada:");
    
    if (!ramal) {
      return; // Usuário cancelou
    }

    try {
      const response = await api.post("/calls/click-to-call", {
        phone_number: phone,
        ramal: ramal,
        client_id: clientId,
      });
      
      if (response.data.success) {
        alert(`✅ Chamada iniciada com sucesso!\n\n📞 Ligando para: ${phone}\n📱 Ramal: ${ramal}\n\nℹ️ Nota: O 3CXPhone mostrará seu ramal, mas a chamada será conectada ao número acima.`);
      } else {
        alert(response.data.message || "Chamada iniciada");
      }
    } catch (error: any) {
      console.error("Error initiating call:", error);
      alert(error.response?.data?.error || "Erro ao iniciar chamada");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Clientes
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gerencie seus clientes e leads
          </p>
        </div>
        <Button onClick={() => {
          setEditingClient(null);
          reset();
          setIsModalOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nome, CPF ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            Carregando...
          </div>
        ) : clients.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            Nenhum cliente encontrado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    CPF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estágio
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {client.name}
                      </div>
                      {client.email && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {client.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {client.cpf}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {client.phone}
                        </span>
                        {client.is_whatsapp && (
                          <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                            WhatsApp
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {client.current_stage?.name || "Sem estágio"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleClickToCall(client.phone, client.id)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                          title="Ligar"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/clients/${client.id}`)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(client)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(null);
          reset();
        }}
        title={editingClient ? "Editar Cliente" : "Novo Cliente"}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="CPF *"
              {...register("cpf")}
              error={errors.cpf?.message}
              placeholder="000.000.000-00"
            />
            <Input
              label="Nome *"
              {...register("name")}
              error={errors.name?.message}
            />
            <Input
              label="Telefone *"
              {...register("phone")}
              error={errors.phone?.message}
              placeholder="(00) 00000-0000"
            />
            <div>
              <label className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  {...register("is_whatsapp")}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  É WhatsApp
                </span>
              </label>
            </div>
            <Input
              label="Email"
              type="email"
              {...register("email")}
              error={errors.email?.message}
            />
            <Input
              label="Cidade"
              {...register("city")}
            />
            <Input
              label="UF"
              {...register("state")}
              maxLength={2}
            />
            <Input
              label="Origem do Lead"
              {...register("lead_source")}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingClient(null);
                reset();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingClient ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

