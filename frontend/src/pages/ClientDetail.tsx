import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";
import Button from "@/components/ui/Button";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Clock } from "lucide-react";
import CreditSimulator from "@/components/CreditSimulator";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isLossModalOpen, setIsLossModalOpen] = useState(false);
  const [lossReasons, setLossReasons] = useState<any[]>([]);
  const [selectedLossReason, setSelectedLossReason] = useState("");
  const [lossObservations, setLossObservations] = useState("");
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callRamal, setCallRamal] = useState("1501"); // Seu ramal padrão

  useEffect(() => {
    if (id) {
      loadClient();
      loadHistory();
      loadLossReasons();
    }
  }, [id]);

  const loadClient = async () => {
    try {
      const response = await api.get(`/clients/${id}`);
      setClient(response.data);
    } catch (error) {
      console.error("Error loading client:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await api.get(`/clients/${id}/history`);
      setHistory(response.data || []);
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  const loadLossReasons = async () => {
    try {
      if (client?.current_stage?.stage_type) {
        const response = await api.get(
          `/stages/loss-reasons/${client.current_stage.stage_type}`
        );
        setLossReasons(response.data || []);
      }
    } catch (error) {
      console.error("Error loading loss reasons:", error);
    }
  };

  const handleMarkAsLost = async () => {
    try {
      await api.post(`/clients/${id}/mark-lost`, {
        loss_reason_id: selectedLossReason,
        observations: lossObservations,
      });
      setIsLossModalOpen(false);
      setSelectedLossReason("");
      setLossObservations("");
      loadClient();
      loadHistory();
    } catch (error: any) {
      alert(error.response?.data?.error || "Erro ao marcar como perdido");
    }
  };

  const handleClickToCall = async () => {
    if (!callRamal) {
      alert("Por favor, informe o ramal");
      return;
    }

    if (!client?.phone) {
      alert("Cliente não possui telefone cadastrado");
      return;
    }

    try {
      const response = await api.post("/calls/click-to-call", {
        phone_number: client.phone,
        ramal: callRamal,
        client_id: client.id,
      });

      if (response.data.success) {
        alert(`✅ Chamada iniciada com sucesso!\n\n📞 Ligando para: ${client.phone}\n📱 Ramal: ${callRamal}\n\nℹ️ Nota: O 3CXPhone mostrará seu ramal, mas a chamada será conectada ao número acima.`);
        setIsCallModalOpen(false);
        // Recarregar histórico para mostrar a nova chamada
        loadHistory();
      } else {
        alert(response.data.message || "Chamada iniciada");
      }
    } catch (error: any) {
      console.error("Error initiating call:", error);
      alert(error.response?.data?.error || "Erro ao iniciar chamada");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Cliente não encontrado</p>
        <Button onClick={() => navigate("/clients")} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/clients")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {client.name}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {client.cpf}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {client.phone && (
            <Button
              variant="primary"
              onClick={() => setIsCallModalOpen(true)}
            >
              <Phone className="w-4 h-4 mr-2" />
              Ligar
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => setIsSimulatorOpen(true)}
          >
            Simular Crédito
          </Button>
          {client.status === "ativo" && (
            <Button
              variant="danger"
              onClick={() => {
                loadLossReasons();
                setIsLossModalOpen(true);
              }}
            >
              Marcar como Perdido
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Informações do Cliente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Telefone</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {client.phone}
                    {client.is_whatsapp && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                        WhatsApp
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {client.email && (
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {client.email}
                    </p>
                  </div>
                </div>
              )}
              {client.city && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Localização</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {client.city}, {client.state}
                    </p>
                  </div>
                </div>
              )}
              {client.birth_date && (
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Data de Nascimento</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {new Date(client.birth_date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Histórico */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Histórico de Interações
            </h2>
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nenhuma interação registrada
                </p>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start space-x-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.title || item.interaction_type}
                      </p>
                      {item.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {item.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(item.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Status
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <span
                  className={`inline-block mt-1 px-3 py-1 text-sm font-medium rounded ${
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
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Estágio</p>
                <p className="text-gray-900 dark:text-white font-medium mt-1">
                  {client.current_stage?.name || "Sem estágio"}
                </p>
              </div>
              {client.assigned_to_user && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Responsável</p>
                  <p className="text-gray-900 dark:text-white font-medium mt-1">
                    {client.assigned_to_user.full_name || client.assigned_to_user.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Modal */}
      <CreditSimulator
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        initialClientId={id}
      />

      {/* Call Modal */}
      <Modal
        isOpen={isCallModalOpen}
        onClose={() => {
          setIsCallModalOpen(false);
          setCallRamal("1501");
        }}
        title="Iniciar Chamada"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>📞 Ligando para:</strong>
            </p>
            <p className="text-lg font-bold text-blue-900 dark:text-blue-100 mt-1">
              {client.phone}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
              <strong>Nota:</strong> O 3CXPhone mostrará seu ramal ({callRamal || "1501"}), mas a chamada será conectada ao número acima.
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Cliente: <span className="font-medium text-gray-900 dark:text-white">{client.name}</span>
            </p>
          </div>
          <Input
            label="Ramal *"
            type="text"
            value={callRamal}
            onChange={(e) => setCallRamal(e.target.value)}
            placeholder="1501"
            required
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsCallModalOpen(false);
                setCallRamal("1501");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleClickToCall}
              disabled={!callRamal}
            >
              <Phone className="w-4 h-4 mr-2" />
              Iniciar Chamada
            </Button>
          </div>
        </div>
      </Modal>

      {/* Loss Modal */}
      <Modal
        isOpen={isLossModalOpen}
        onClose={() => {
          setIsLossModalOpen(false);
          setSelectedLossReason("");
          setLossObservations("");
        }}
        title="Marcar como Perdido"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Motivo da Perda *"
            value={selectedLossReason}
            onChange={(e) => setSelectedLossReason(e.target.value)}
            options={[
              { value: "", label: "Selecione um motivo" },
              ...lossReasons.map((reason) => ({
                value: reason.id,
                label: reason.reason,
              })),
            ]}
          />
          <Input
            label="Observações"
            type="textarea"
            value={lossObservations}
            onChange={(e) => setLossObservations(e.target.value)}
            placeholder="Observações adicionais sobre a perda..."
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsLossModalOpen(false);
                setSelectedLossReason("");
                setLossObservations("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleMarkAsLost}
              disabled={!selectedLossReason}
            >
              Confirmar Perda
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

