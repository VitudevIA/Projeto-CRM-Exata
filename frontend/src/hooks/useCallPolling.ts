import { useState, useEffect, useRef } from "react";
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

interface UseCallPollingReturn {
  callData: CallPopupData | null;
  hasActiveCall: boolean;
  isLoading: boolean;
  startPolling: () => void;
  stopPolling: () => void;
  onTabulationComplete: () => void;
}

export function useCallPolling(): UseCallPollingReturn {
  const [callData, setCallData] = useState<CallPopupData | null>(null);
  const [hasActiveCall, setHasActiveCall] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isTabulated, setIsTabulated] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallIdRef = useRef<string | null>(null);

  const checkForCall = async () => {
    try {
      setIsLoading(true);
      console.log("📋 Verificando chamada ativa...");
      const response = await api.get("/calls/popup");

      console.log("📋 Resposta do popup:", response.data);

      if (response.data.success && response.data.hasActiveCall) {
        const newCallId = response.data.data.protocolo;
        
        console.log("📋 Chamada ativa detectada:", {
          protocolo: newCallId,
          numero: response.data.data.numero,
          nome: response.data.data.nome,
          lastCallId: lastCallIdRef.current,
          isTabulated,
        });
        
        // Se é uma nova chamada (diferente da anterior), resetar tabulação
        if (newCallId !== lastCallIdRef.current) {
          // Se havia uma chamada anterior não tabulada, não permitir nova chamada
          if (lastCallIdRef.current && !isTabulated) {
            console.warn("⚠️ Chamada anterior não foi tabulada. Bloqueando nova chamada.");
            return; // Não processar nova chamada até tabular a anterior
          }
          
          setIsTabulated(false);
          lastCallIdRef.current = newCallId;
        }

        // Só mostrar se não foi tabulada ainda
        if (!isTabulated) {
          console.log("📋 Definindo dados da chamada e abrindo popup");
          console.log("📋 Dados completos:", response.data.data);
          setCallData(response.data.data);
          setHasActiveCall(true);
          console.log("📋 Estado atualizado: hasActiveCall = true");
        } else {
          console.log("📋 Chamada já foi tabulada, não abrindo popup");
          console.log("📋 isTabulated:", isTabulated, "| lastCallId:", lastCallIdRef.current, "| newCallId:", newCallId);
        }
      } else {
        console.log("📋 Nenhuma chamada ativa:", {
          success: response.data.success,
          hasActiveCall: response.data.hasActiveCall,
          message: response.data.message,
        });
        // Se não há chamada ativa e havia uma antes, resetar apenas se foi tabulada
        if (hasActiveCall && isTabulated) {
          console.log("📋 Resetando estado após tabulação");
          setCallData(null);
          setHasActiveCall(false);
          setIsTabulated(false);
          lastCallIdRef.current = null;
        }
      }
    } catch (error: any) {
      console.error("❌ Error checking for call:", error);
      console.error("❌ Error response:", error.response?.data);
      // Se erro, não fazer nada (pode ser que não há chamada ativa)
      if (error.response?.status === 404 || error.response?.status === 500) {
        // Se não há chamada ativa e foi tabulada, resetar
        if (hasActiveCall && isTabulated) {
          setCallData(null);
          setHasActiveCall(false);
          setIsTabulated(false);
          lastCallIdRef.current = null;
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = () => {
    if (isPolling) {
      console.log("📋 Polling já está ativo, ignorando startPolling");
      return;
    }
    
    console.log("📋 Iniciando polling automático...");
    setIsPolling(true);
    
    // Verificar imediatamente
    checkForCall();
    
    // Depois verificar a cada 2 segundos
    intervalRef.current = setInterval(() => {
      checkForCall();
    }, 2000);
    
    console.log("📋 Polling iniciado - verificando a cada 2 segundos");
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      console.log("📋 Parando polling - limpando intervalo");
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  };


  useEffect(() => {
    // Iniciar polling automaticamente quando o hook é montado
    console.log("📋 Hook useCallPolling montado - iniciando polling automático");
    startPolling();

    // Limpar ao desmontar
    return () => {
      console.log("📋 Hook useCallPolling desmontado - parando polling");
      stopPolling();
    };
  }, []);

  // Se a chamada foi tabulada e não há mais chamada ativa, resetar
  useEffect(() => {
    if (isTabulated && !hasActiveCall) {
      console.log("📋 Resetando estado: chamada tabulada e não há mais chamada ativa");
      setIsTabulated(false);
      lastCallIdRef.current = null;
    }
  }, [isTabulated, hasActiveCall]);

  // Debug: Log do estado atual
  useEffect(() => {
    console.log("📋 Estado do polling:", {
      hasActiveCall,
      isTabulated,
      hasCallData: !!callData,
      lastCallId: lastCallIdRef.current,
      isLoading,
    });
  }, [hasActiveCall, isTabulated, callData, isLoading]);

  const finalHasActiveCall = hasActiveCall && !isTabulated;
  
  // Debug: Log do retorno
  useEffect(() => {
    console.log("📋 Retorno do hook:", {
      hasActiveCall: finalHasActiveCall,
      hasCallData: !!callData,
      isTabulated,
    });
  }, [finalHasActiveCall, callData, isTabulated]);

  return {
    callData,
    hasActiveCall: finalHasActiveCall, // Só mostrar se não foi tabulada ainda
    isLoading,
    startPolling,
    stopPolling,
    onTabulationComplete: () => {
      console.log("📋 Tabulação completa - marcando como tabulada");
      setIsTabulated(true);
      // Continuar polling para detectar próxima chamada
      // Mas não resetar a chamada atual até que ela termine
    },
  };
}

