import { useState, useEffect } from "react";
import { X, Phone, FileText, Clock, User, History, Calendar } from "lucide-react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Select from "./ui/Select";
import api from "@/services/api";

interface CallPopupData {
  protocolo: string;
  nome: string;
  numero: string;
  codigo: string;
  campo1: string;
  campo2: string;
  campo3: string;
  campo4: string;
  campo5: string;
  status: string;
  status_descricao: string;
  id_camp: string;
  ramal: string;
  gravacao: string;
  client_id?: string;
  call_log_id?: string;
}

interface CallPopupProps {
  isOpen: boolean;
  onClose: () => void;
  data: CallPopupData;
  onTabulationComplete: () => void;
}

const tabulationOptions = [
  { value: "", label: "Selecionar..." },
  { value: "SEM INTERESSE", label: "SEM INTERESSE" },
  { value: "NÃO ATENDE", label: "NÃO ATENDE" },
  { value: "AGENDAR CLIENTE", label: "AGENDAR CLIENTE" },
  { value: "NÚMERO ERRADO", label: "NÚMERO ERRADO" },
  { value: "FALECIDO", label: "FALECIDO" },
  { value: "LIGAÇÃO MUDA", label: "LIGAÇÃO MUDA" },
  { value: "LIGAÇÃO CAIU", label: "LIGAÇÃO CAIU" },
  { value: "CLIENTE DESLIGOU", label: "CLIENTE DESLIGOU" },
  { value: "NUMERO INVALIDO", label: "NUMERO INVALIDO" },
  { value: "CAIXA POSTAL", label: "CAIXA POSTAL" },
  { value: "BLACKLIST", label: "BLACKLIST" },
  { value: "CLIENTE NÃO ESTÁ NO MOMENTO", label: "CLIENTE NÃO ESTÁ NO MOMENTO" },
  { value: "SEM MARGEM", label: "SEM MARGEM" },
  { value: "IDADE AVANÇADA", label: "IDADE AVANÇADA" },
  { value: "ORGÃO SUSPENSO", label: "ORGÃO SUSPENSO" },
  { value: "ESPECIE NAO CONSIGNAVEL", label: "ESPECIE NAO CONSIGNAVEL" },
  { value: "MARGEM NEGATIVA", label: "MARGEM NEGATIVA" },
  { value: "AGUARDANDO APOSENTADORIA", label: "AGUARDANDO APOSENTADORIA" },
  { value: "SEM POSSIBILIDADE", label: "SEM POSSIBILIDADE" },
  { value: "INTERESSADO", label: "INTERESSADO" },
  { value: "RETORNAR LIGAÇÃO", label: "RETORNAR LIGAÇÃO" },
];

export default function CallPopup({ isOpen, onClose, data, onTabulationComplete }: CallPopupProps) {
  const [activeTab, setActiveTab] = useState<"script" | "abandonos" | "historico" | "tabulacao" | "agendamentos">("script");
  const [tabulation, setTabulation] = useState("");
  const [observacao, setObservacao] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    console.log("📋 CallPopup: isOpen mudou para", isOpen);
    console.log("📋 CallPopup: dados recebidos", data);
    
    if (isOpen) {
      console.log("📋 CallPopup: Abrindo popup com dados:", {
        protocolo: data.protocolo,
        numero: data.numero,
        nome: data.nome,
      });
      // Resetar campos quando popup abre
      setTabulation("");
      setObservacao("");
      setDescricao("");
      setCanClose(false);
      setActiveTab("script");
    }
  }, [isOpen, data]);

  const handleSave = async () => {
    if (!tabulation) {
      alert("⚠️ Por favor, selecione uma tabulação antes de salvar.");
      return;
    }

    try {
      setLoading(true);

      if (data.call_log_id) {
        // Atualizar chamada existente
        await api.put(`/calls/${data.call_log_id}/tabulation`, {
          tabulation,
          notes: `${observacao}\n\n${descricao}`.trim(),
          client_id: data.client_id || undefined,
        });
      } else {
        // Criar novo log de chamada
        await api.post("/calls", {
          phone_number: data.numero,
          direction: "inbound",
          status: "answered",
          tabulation,
          notes: `${observacao}\n\n${descricao}`.trim(),
          client_id: data.client_id || undefined,
        });
      }

      // Marcar como completo e permitir fechar
      setCanClose(true);
      onTabulationComplete();
      
      alert("✅ Tabulação salva com sucesso!");
      
      // Fechar após salvar
      setTimeout(() => {
        handleClose();
      }, 500);
    } catch (error: any) {
      console.error("Error saving tabulation:", error);
      alert(error.response?.data?.error || "Erro ao salvar tabulação");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!canClose && tabulation) {
      // Se já tem tabulação selecionada mas não salvou, perguntar
      if (confirm("⚠️ Você ainda não salvou a tabulação. Deseja realmente fechar sem salvar?")) {
        onClose();
      }
      return;
    }
    
    if (!tabulation) {
      alert("⚠️ Você deve tabular a ligação antes de fechar!");
      return;
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Chamada Ativa</h2>
              <p className="text-sm text-blue-100">Ramal: {data.ramal || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Pausa</span>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
              disabled={!canClose && !tabulation}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Informações e Tabulação */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Informações do Cliente */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Informações
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Protocolo:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{data.protocolo}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Nome:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{data.nome || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Número:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{data.numero || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Código:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{data.codigo || "—"}</span>
                </div>
                {data.campo1 && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Campo 1:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{data.campo1}</span>
                  </div>
                )}
                {data.campo2 && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Campo 2:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{data.campo2}</span>
                  </div>
                )}
                {data.campo3 && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Campo 3:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{data.campo3}</span>
                  </div>
                )}
                {data.campo4 && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Campo 4:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{data.campo4}</span>
                  </div>
                )}
                {data.campo5 && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Campo 5:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{data.campo5}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Fila/URA:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    RAMAL-{data.ramal} ({data.ramal})
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs de Ações */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab("tabulacao")}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  activeTab === "tabulacao"
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                Tabulação da chamada
              </button>
            </div>

            {/* Tabulação */}
            {activeTab === "tabulacao" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tabulação: *
                  </label>
                  <Select
                    value={tabulation}
                    onChange={(e) => setTabulation(e.target.value)}
                    options={tabulationOptions}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Observação:
                  </label>
                  <Input
                    type="text"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    placeholder="Observações sobre a chamada..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição:
                  </label>
                  <textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={6}
                    placeholder="Descrição detalhada da chamada..."
                  />
                </div>

                <Button
                  onClick={handleSave}
                  isLoading={loading}
                  disabled={!tabulation}
                  className="w-full"
                  variant="primary"
                >
                  Salvar
                </Button>
              </div>
            )}
          </div>

          {/* Right Panel - Tabs de Conteúdo */}
          <div className="flex-1 flex flex-col">
            {/* Tabs */}
            <div className="bg-orange-500 dark:bg-orange-600 px-6 py-2 flex space-x-1 border-b border-orange-600 dark:border-orange-700">
              <button
                onClick={() => setActiveTab("script")}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg flex items-center space-x-2 ${
                  activeTab === "script"
                    ? "bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400"
                    : "text-white hover:bg-orange-600 dark:hover:bg-orange-700"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Script</span>
              </button>
              <button
                onClick={() => setActiveTab("abandonos")}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg flex items-center space-x-2 ${
                  activeTab === "abandonos"
                    ? "bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400"
                    : "text-white hover:bg-orange-600 dark:hover:bg-orange-700"
                }`}
              >
                <X className="w-4 h-4" />
                <span>Abandonos</span>
              </button>
              <button
                onClick={() => setActiveTab("historico")}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg flex items-center space-x-2 ${
                  activeTab === "historico"
                    ? "bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400"
                    : "text-white hover:bg-orange-600 dark:hover:bg-orange-700"
                }`}
              >
                <History className="w-4 h-4" />
                <span>Histórico</span>
              </button>
              <button
                onClick={() => setActiveTab("tabulacao")}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg flex items-center space-x-2 ${
                  activeTab === "tabulacao"
                    ? "bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400"
                    : "text-white hover:bg-orange-600 dark:hover:bg-orange-700"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Tabulação</span>
              </button>
              <button
                onClick={() => setActiveTab("agendamentos")}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg flex items-center space-x-2 ${
                  activeTab === "agendamentos"
                    ? "bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400"
                    : "text-white hover:bg-orange-600 dark:hover:bg-orange-700"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Agendamentos [0]</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-800">
              {activeTab === "script" && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Script da campanha aparecerá aqui</p>
                </div>
              )}

              {activeTab === "abandonos" && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                  <X className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Chamadas abandonadas aparecerão aqui</p>
                </div>
              )}

              {activeTab === "historico" && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                  <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Histórico de chamadas aparecerá aqui</p>
                </div>
              )}

              {activeTab === "tabulacao" && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                  <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Use a aba de tabulação no painel esquerdo para tabular a chamada</p>
                </div>
              )}

              {activeTab === "agendamentos" && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Agendamentos aparecerão aqui</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

