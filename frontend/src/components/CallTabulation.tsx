import { useState, useEffect } from "react";
import Modal from "./ui/Modal";
import Input from "./ui/Input";
import Select from "./ui/Select";
import Button from "./ui/Button";
import api from "@/services/api";
import { Phone, X } from "lucide-react";

interface CallTabulationProps {
  isOpen: boolean;
  onClose: () => void;
  callData?: {
    call_id?: string;
    phone_number: string;
    client_id?: string;
    client_name?: string;
  };
}

const tabulationOptions = [
  { value: "Sem Interesse", label: "Sem Interesse" },
  { value: "Ligação Muda", label: "Ligação Muda" },
  { value: "Ligação Caiu", label: "Ligação Caiu" },
  { value: "Prospecção", label: "Prospecção" },
  { value: "Agendar Cliente", label: "Agendar Cliente" },
  { value: "Sem Possibilidade", label: "Sem Possibilidade" },
  { value: "Interessado", label: "Interessado" },
  { value: "Retornar Ligação", label: "Retornar Ligação" },
];

export default function CallTabulation({ isOpen, onClose, callData }: CallTabulationProps) {
  const [tabulation, setTabulation] = useState("");
  const [notes, setNotes] = useState("");
  const [clientId, setClientId] = useState(callData?.client_id || "");
  const [clients, setClients] = useState<any[]>([]);
  const [searchClient, setSearchClient] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && callData) {
      setClientId(callData.client_id || "");
      loadClients();
    }
  }, [isOpen, callData]);

  const loadClients = async () => {
    try {
      const response = await api.get("/clients", {
        params: { search: searchClient, limit: 10 },
      });
      setClients(response.data.data || []);
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };

  const handleSubmit = async () => {
    if (!tabulation) {
      alert("Selecione uma tabulação");
      return;
    }

    try {
      setLoading(true);

      // Se temos call_id, atualizar chamada existente
      if (callData?.call_id) {
        await api.put(`/calls/${callData.call_id}/tabulation`, {
          tabulation,
          notes,
          client_id: clientId || undefined,
        });
      } else {
        // Criar novo log de chamada
        await api.post("/calls", {
          phone_number: callData?.phone_number,
          direction: "inbound",
          status: "answered",
          tabulation,
          notes,
          client_id: clientId || undefined,
        });
      }

      // Reset e fechar
      setTabulation("");
      setNotes("");
      setClientId("");
      onClose();
    } catch (error: any) {
      console.error("Error saving tabulation:", error);
      alert(error.response?.data?.error || "Erro ao salvar tabulação");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTabulation("");
    setNotes("");
    setClientId("");
    setSearchClient("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Tabulação de Chamada" size="lg">
      <div className="space-y-4">
        {callData && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {callData.client_name || "Chamada Recebida"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {callData.phone_number}
                </p>
              </div>
            </div>
          </div>
        )}

        <Select
          label="Tabulação *"
          value={tabulation}
          onChange={(e) => setTabulation(e.target.value)}
          options={[
            { value: "", label: "Selecione uma opção" },
            ...tabulationOptions,
          ]}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Associar a Cliente (Opcional)
          </label>
          <Input
            type="text"
            placeholder="Buscar cliente..."
            value={searchClient}
            onChange={(e) => {
              setSearchClient(e.target.value);
              if (e.target.value.length > 2) {
                loadClients();
              }
            }}
          />
          {searchClient && clients.length > 0 && (
            <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg max-h-40 overflow-y-auto">
              {clients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => {
                    setClientId(client.id);
                    setSearchClient(client.name);
                    setClients([]);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                >
                  <p className="font-medium text-gray-900 dark:text-white">
                    {client.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {client.phone} - {client.cpf}
                  </p>
                </button>
              ))}
            </div>
          )}
          {clientId && (
            <div className="mt-2 flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Cliente selecionado
              </span>
              <button
                type="button"
                onClick={() => {
                  setClientId("");
                  setSearchClient("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Observações
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={4}
            placeholder="Anotações sobre a chamada..."
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} isLoading={loading} disabled={!tabulation}>
            Salvar Tabulação
          </Button>
        </div>
      </div>
    </Modal>
  );
}

