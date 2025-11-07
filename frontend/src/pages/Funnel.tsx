import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import api from "@/services/api";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { ClientStage, Client } from "@/types";

export default function Funnel() {
  const [stages, setStages] = useState<ClientStage[]>([]);
  const [clientsByStage, setClientsByStage] = useState<Record<string, Client[]>>({});
  const [loading, setLoading] = useState(true);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [targetStageId, setTargetStageId] = useState("");
  const [lossReasons, setLossReasons] = useState<any[]>([]);
  const [lossObservations, setLossObservations] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar estágios
      const stagesRes = await api.get("/stages");
      const stagesData = stagesRes.data || [];
      setStages(stagesData);

      // Carregar clientes por estágio
      const clientsRes = await api.get("/clients", {
        params: { limit: 1000 },
      });

      const clients = clientsRes.data.data || [];
      const grouped: Record<string, Client[]> = {};

      stagesData.forEach((stage: ClientStage) => {
        grouped[stage.id] = clients.filter(
          (client: Client) => client.current_stage_id === stage.id && client.status === "ativo"
        );
      });

      setClientsByStage(grouped);
    } catch (error) {
      console.error("Error loading funnel:", error);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const clientId = draggableId.replace("client-", "");
    const newStageId = destination.droppableId.replace("stage-", "");

    // Verificar se está movendo para estágio "perdido"
    const targetStage = stages.find((s) => s.id === newStageId);
    if (targetStage?.stage_type === "perdido") {
      // Abrir modal de perda
      const client = Object.values(clientsByStage)
        .flat()
        .find((c) => c.id === clientId);
      if (client) {
        setSelectedClient(client);
        setTargetStageId(newStageId);
        await loadLossReasons(targetStage.stage_type);
        setIsMoveModalOpen(true);
      }
      return;
    }

    // Mover cliente
    try {
      await api.put(`/clients/${clientId}`, {
        current_stage_id: newStageId,
      });
      loadData();
    } catch (error: any) {
      console.error("Error moving client:", error);
      alert(error.response?.data?.error || "Erro ao mover cliente");
    }
  };

  const loadLossReasons = async (stageType: string) => {
    try {
      const response = await api.get(`/stages/loss-reasons/${stageType}`);
      setLossReasons(response.data || []);
    } catch (error) {
      console.error("Error loading loss reasons:", error);
    }
  };

  const handleConfirmMove = async () => {
    if (!selectedClient) return;

    try {
      if (targetStageId) {
        // Se tem loss reason, marcar como perdido
        const lossReasonId = (document.getElementById("loss-reason") as HTMLSelectElement)?.value;
        if (lossReasonId) {
          await api.post(`/clients/${selectedClient.id}/mark-lost`, {
            loss_reason_id: lossReasonId,
            observations: lossObservations,
          });
        } else {
          await api.put(`/clients/${selectedClient.id}`, {
            current_stage_id: targetStageId,
          });
        }
      }

      setIsMoveModalOpen(false);
      setSelectedClient(null);
      setTargetStageId("");
      setLossObservations("");
      loadData();
    } catch (error: any) {
      console.error("Error moving client:", error);
      alert(error.response?.data?.error || "Erro ao mover cliente");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Funil de Vendas
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Arraste os clientes entre os estágios
        </p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const clients = clientsByStage[stage.id] || [];
            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
              >
                <div
                  className="p-4 border-b border-gray-200 dark:border-gray-700"
                  style={{
                    borderTopColor: stage.color || "#3B82F6",
                    borderTopWidth: "4px",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {stage.name}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                      {clients.length}
                    </span>
                  </div>
                </div>

                <Droppable droppableId={`stage-${stage.id}`}>
                  {(provided: any, snapshot: any) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-4 min-h-[200px] ${
                        snapshot.isDraggingOver
                          ? "bg-indigo-50 dark:bg-indigo-900/20"
                          : ""
                      }`}
                    >
                      {clients.map((client, index) => (
                        <Draggable
                          key={client.id}
                          draggableId={`client-${client.id}`}
                          index={index}
                        >
                          {(provided: any, snapshot: any) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`mb-2 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm ${
                                snapshot.isDragging
                                  ? "shadow-lg ring-2 ring-indigo-500"
                                  : ""
                              }`}
                            >
                              <p className="font-medium text-gray-900 dark:text-white text-sm">
                                {client.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {client.phone}
                              </p>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {clients.length === 0 && (
                        <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500">
                          Nenhum cliente neste estágio
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Modal de Confirmação/Perda */}
      <Modal
        isOpen={isMoveModalOpen}
        onClose={() => {
          setIsMoveModalOpen(false);
          setSelectedClient(null);
          setTargetStageId("");
          setLossObservations("");
        }}
        title="Confirmar Movimentação"
        size="md"
      >
        <div className="space-y-4">
          {selectedClient && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cliente: <span className="font-medium">{selectedClient.name}</span>
              </p>
            </div>
          )}

          {lossReasons.length > 0 && (
            <>
              <Select
                label="Motivo da Perda *"
                id="loss-reason"
                options={[
                  { value: "", label: "Selecione um motivo" },
                  ...lossReasons.map((reason) => ({
                    value: reason.id,
                    label: reason.reason,
                  })),
                ]}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Observações
                </label>
                <textarea
                  value={lossObservations}
                  onChange={(e) => setLossObservations(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Observações adicionais..."
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsMoveModalOpen(false);
                setSelectedClient(null);
                setTargetStageId("");
                setLossObservations("");
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmMove}>
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

