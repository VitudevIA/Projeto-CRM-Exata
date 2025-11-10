/**
 * Serviço de Integração com Fortics PBX
 * 
 * Este serviço encapsula toda a comunicação com a API do Fortics BPX.
 * A API Fortics usa polling ao invés de webhooks.
 * 
 * Nota: Usa fetch nativo do Node.js 18+
 */

export class ForticsService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.DISCADOR_API_URL || "";
    this.apiKey = process.env.DISCADOR_API_KEY || "";

    if (!this.baseUrl || !this.apiKey) {
      console.warn("⚠️  Fortics API não configurado. Configure DISCADOR_API_URL e DISCADOR_API_KEY");
    }
  }

  /**
   * Verifica se a API está configurada
   */
  isConfigured(): boolean {
    return !!(this.baseUrl && this.apiKey);
  }

  /**
   * Click-to-Call: Inicia uma chamada do ramal para o destino
   * 
   * @param ramal - Número do ramal de origem (ex: "1000")
   * @param numeroDestino - Número de destino (ex: "11999999999")
   * @param accountCode - ID único da chamada (opcional, será gerado se não fornecido)
   * @param assincrono - Se true, executa discagem assíncrona
   * @returns Resposta da API Fortics
   */
  async initiateCall(
    ramal: string,
    numeroDestino: string,
    accountCode?: string,
    assincrono: boolean = false
  ) {
    if (!this.isConfigured()) {
      throw new Error("Fortics API não configurado");
    }

    // Endpoint correto: /lispbx/lisintegra.php (conforme painel Fortics)
    const url = `${this.baseUrl}/lispbx/lisintegra.php`;
    const params: Record<string, string> = {
      gacao: "discar",
      gkey: this.apiKey,
      gsrc: ramal,
      gdst: numeroDestino,
      gresponse: "json",
    };

    if (accountCode) {
      params.gaccountcode = accountCode;
    } else {
      params.gidresponse = "yes"; // Gera accountcode automaticamente
    }

    if (assincrono) {
      params.gassincrono = "yes";
    }

    // Configurar variáveis de canal para definir o Caller ID Name como o número de destino
    // Tentando múltiplos formatos para garantir compatibilidade com o Fortics/Asterisk
    // O 3CXPhone mostra o Caller ID Name da chamada que chega no ramal
    // Formatos testados:
    // 1. CALLERID(name)=valor (padrão Asterisk)
    // 2. CALLERIDNAME=valor (alternativo)
    // 3. Formato com dois pontos (como no exemplo da documentação: add_note:yes)
    const channelVars = [
      `CALLERID(name)=${numeroDestino}`,
      `CALLERIDNAME=${numeroDestino}`,
      `CALLERID(num)=${numeroDestino}`,
      `CALLERID:name:${numeroDestino}`,
    ].join("|");
    
    params.gvariaveis_de_canal = channelVars;
    
    console.log(`📞 Fortics: Variáveis de canal configuradas: ${channelVars}`);

    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${url}?${queryString}`;

    console.log(`📞 Fortics: Iniciando chamada ${ramal} → ${numeroDestino}`);
    console.log(`📞 Fortics: URL completa: ${fullUrl}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 segundos de timeout

      const response = await fetch(fullUrl, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Fortics: HTTP ${response.status} - ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log(`✅ Fortics: Resposta completa:`, JSON.stringify(data, null, 2));
      
      // Verificar se a resposta indica sucesso
      if (data.success === false || (data.msg && data.msg.toLowerCase().includes("erro"))) {
        console.error(`❌ Fortics: Resposta indica erro:`, data);
        throw new Error(data.msg || "Erro ao iniciar chamada no Fortics");
      }
      
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error(`❌ Fortics: Timeout ao iniciar chamada (25s)`);
        throw new Error("Timeout ao comunicar com Fortics (25 segundos)");
      }
      console.error(`❌ Fortics: Erro ao iniciar chamada`, error);
      throw new Error(`Erro ao comunicar com Fortics: ${error.message}`);
    }
  }

  /**
   * Consulta status de uma chamada pelo accountcode
   * 
   * @param accountCode - ID da chamada
   * @param tipo - Formato da resposta (text, xml, csv)
   * @returns Status da chamada
   */
  async getCallStatus(accountCode: string, tipo: "text" | "xml" | "csv" = "text") {
    if (!this.isConfigured()) {
      throw new Error("Fortics API não configurado");
    }

    // Endpoint correto: /lispbx/lisintegra.php (conforme painel Fortics)
    const url = `${this.baseUrl}/lispbx/lisintegra.php`;
    const params = new URLSearchParams({
      gacao: "statuscdr",
      gkey: this.apiKey,
      gaccountcode: accountCode,
      gcdrtipo: tipo,
    });

    const fullUrl = `${url}?${params.toString()}`;

    console.log(`🔍 Fortics: Consultando status da chamada ${accountCode}`);

    try {
      const response = await fetch(fullUrl, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.text();
      
      console.log(`✅ Fortics: Status obtido`);
      
      return data;
    } catch (error: any) {
      console.error(`❌ Fortics: Erro ao consultar status`, error);
      throw new Error(`Erro ao consultar status: ${error.message}`);
    }
  }

  /**
   * Popup: Busca dados da última chamada de um agente
   * 
   * @param loginAgente - Login do agente
   * @returns Dados da última chamada
   */
  async getAgentPopup(loginAgente: string) {
    if (!this.isConfigured()) {
      throw new Error("Fortics API não configurado");
    }

    const url = `${this.baseUrl}/forticsApi.php`;
    const params = new URLSearchParams({
      acao: "popup",
      key: this.apiKey,
      login: loginAgente,
    });

    const fullUrl = `${url}?${params.toString()}`;

    console.log(`📋 Fortics: Buscando popup do agente ${loginAgente}`);

    try {
      const response = await fetch(fullUrl, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log(`✅ Fortics: Popup obtido`);
      console.log(`📋 Fortics: Resposta completa do popup:`, JSON.stringify(data, null, 2));
      
      return data;
    } catch (error: any) {
      console.error(`❌ Fortics: Erro ao buscar popup`, error);
      throw new Error(`Erro ao buscar popup: ${error.message}`);
    }
  }

  /**
   * Gera URL para download de gravação
   * 
   * @param accountCode - ID da chamada
   * @returns URL de download
   */
  getRecordingDownloadUrl(accountCode: string): string {
    if (!this.isConfigured()) {
      throw new Error("Fortics API não configurado");
    }

    return `${this.baseUrl}/lispbx/lisintegra.php?gacao=download&gkey=${this.apiKey}&gaccountcode=${accountCode}`;
  }

  /**
   * Gera URL para download de gravação pelo nome do arquivo
   * 
   * @param fileName - Nome do arquivo de gravação
   * @returns URL de download
   */
  getRecordingDownloadUrlByFile(fileName: string): string {
    if (!this.isConfigured()) {
      throw new Error("Fortics API não configurado");
    }

    return `${this.baseUrl}/lispbx/lisintegra.php?gacao=downloadrec&gkey=${this.apiKey}&gfile=${fileName}`;
  }

  /**
   * Login de agente em fila(s)
   * 
   * @param ramal - Número do ramal
   * @param loginAgente - Login do agente
   * @param filas - Filas para logar (separadas por vírgula)
   * @param tipoRamal - SIP ou AGENTE
   * @param campanha - Nome da campanha (opcional)
   * @returns Resposta do login
   */
  async loginAgent(
    ramal: string,
    loginAgente: string,
    filas: string,
    tipoRamal: "SIP" | "AGENTE" = "SIP",
    campanha?: string
  ) {
    if (!this.isConfigured()) {
      throw new Error("Fortics API não configurado");
    }

    // Endpoint correto: /lispbx/lisintegra.php (conforme painel Fortics)
    const url = `${this.baseUrl}/lispbx/lisintegra.php`;
    const params: Record<string, string> = {
      gacao: "logar",
      gkey: this.apiKey,
      gramal: ramal,
      gagente: loginAgente,
      gtiporamal: tipoRamal,
      gfila: filas,
      gresponse: "json",
    };

    if (campanha) {
      params.gcampanha = encodeURIComponent(campanha);
    }

    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${url}?${queryString}`;

    console.log(`👤 Fortics: Login agente ${loginAgente} nas filas ${filas}`);

    try {
      const response = await fetch(fullUrl, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log(`✅ Fortics: Agente logado`);
      
      return data;
    } catch (error: any) {
      console.error(`❌ Fortics: Erro ao logar agente`, error);
      throw new Error(`Erro ao logar agente: ${error.message}`);
    }
  }

  /**
   * Logout de agente de fila(s)
   * 
   * @param ramal - Número do ramal
   * @param loginAgente - Login do agente
   * @param filas - Filas para deslogar
   * @param tipoRamal - SIP ou AGENTE
   * @returns Resposta do logout
   */
  async logoutAgent(
    ramal: string,
    loginAgente: string,
    filas: string,
    tipoRamal: "SIP" | "AGENTE" = "SIP"
  ) {
    if (!this.isConfigured()) {
      throw new Error("Fortics API não configurado");
    }

    // Endpoint correto: /lispbx/lisintegra.php (conforme painel Fortics)
    const url = `${this.baseUrl}/lispbx/lisintegra.php`;
    const params = new URLSearchParams({
      gacao: "deslogar",
      gkey: this.apiKey,
      gramal: ramal,
      gagente: loginAgente,
      gtiporamal: tipoRamal,
      gfila: filas,
      gresponse: "json",
    });

    const fullUrl = `${url}?${params.toString()}`;

    console.log(`👤 Fortics: Logout agente ${loginAgente}`);

    try {
      const response = await fetch(fullUrl, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log(`✅ Fortics: Agente deslogado`);
      
      return data;
    } catch (error: any) {
      console.error(`❌ Fortics: Erro ao deslogar agente`, error);
      throw new Error(`Erro ao deslogar agente: ${error.message}`);
    }
  }

  /**
   * Pausar agente
   * 
   * @param ramal - Número do ramal
   * @param loginAgente - Login do agente
   * @param nomePausa - Nome da pausa cadastrada
   * @param fila - Fila específica (opcional)
   * @returns Resposta da pausa
   */
  async pauseAgent(ramal: string, loginAgente: string, nomePausa: string, fila?: string) {
    if (!this.isConfigured()) {
      throw new Error("Fortics API não configurado");
    }

    // Endpoint correto: /lispbx/lisintegra.php (conforme painel Fortics)
    const url = `${this.baseUrl}/lispbx/lisintegra.php`;
    const params: Record<string, string> = {
      gacao: "pausar",
      gkey: this.apiKey,
      gramal: ramal,
      gagente: loginAgente,
      gpausa: nomePausa,
      gresponse: "json",
    };

    if (fila) {
      params.gfila = fila;
    }

    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${url}?${queryString}`;

    console.log(`⏸️  Fortics: Pausando agente ${loginAgente} - ${nomePausa}`);

    try {
      const response = await fetch(fullUrl, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log(`✅ Fortics: Agente pausado`);
      
      return data;
    } catch (error: any) {
      console.error(`❌ Fortics: Erro ao pausar agente`, error);
      throw new Error(`Erro ao pausar agente: ${error.message}`);
    }
  }

  /**
   * Despausar agente
   * 
   * @param ramal - Número do ramal
   * @param loginAgente - Login do agente
   * @param nomePausa - Nome da pausa
   * @param fila - Fila específica (opcional)
   * @returns Resposta da despausa
   */
  async unpauseAgent(ramal: string, loginAgente: string, nomePausa: string, fila?: string) {
    if (!this.isConfigured()) {
      throw new Error("Fortics API não configurado");
    }

    // Endpoint correto: /lispbx/lisintegra.php (conforme painel Fortics)
    const url = `${this.baseUrl}/lispbx/lisintegra.php`;
    const params: Record<string, string> = {
      gacao: "despausar",
      gkey: this.apiKey,
      gramal: ramal,
      gagente: loginAgente,
      gpausa: nomePausa,
      gresponse: "json",
    };

    if (fila) {
      params.gfila = fila;
    }

    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${url}?${queryString}`;

    console.log(`▶️  Fortics: Despausando agente ${loginAgente}`);

    try {
      const response = await fetch(fullUrl, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log(`✅ Fortics: Agente despausado`);
      
      return data;
    } catch (error: any) {
      console.error(`❌ Fortics: Erro ao despausar agente`, error);
      throw new Error(`Erro ao despausar agente: ${error.message}`);
    }
  }
}

// Instância singleton
export const forticsService = new ForticsService();

