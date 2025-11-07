import { useState, useEffect } from "react";
import { Phone, X, Clock } from "lucide-react";
import CallTabulation from "./CallTabulation";
import CreditSimulator from "./CreditSimulator";
import Button from "./ui/Button";

interface CallPanelProps {
  isOpen: boolean;
  onClose: () => void;
  callData: {
    call_id?: string;
    phone_number: string;
    client_id?: string;
    client_name?: string;
    direction: "inbound" | "outbound";
  };
}

export default function CallPanel({ isOpen, onClose, callData }: CallPanelProps) {
  const [isTabulationOpen, setIsTabulationOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime] = useState(Date.now());

  useEffect(() => {
    if (isOpen) {
      // Atualizar duração a cada segundo
      const interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, callStartTime]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    setIsTabulationOpen(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed bottom-4 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {callData.client_name || "Chamada Ativa"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {callData.phone_number}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center justify-center space-x-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Clock className="w-5 h-5" />
            <span>{formatDuration(callDuration)}</span>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsSimulatorOpen(true)}
            >
              Simulador
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleEndCall}
            >
              Encerrar
            </Button>
          </div>
        </div>
      </div>

      <CallTabulation
        isOpen={isTabulationOpen}
        onClose={() => {
          setIsTabulationOpen(false);
          onClose();
        }}
        callData={callData}
      />

      <CreditSimulator
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        initialClientId={callData.client_id}
      />
    </>
  );
}

