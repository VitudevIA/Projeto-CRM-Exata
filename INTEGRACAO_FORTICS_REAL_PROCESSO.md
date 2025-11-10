# 🔧 Integração Fortics BPX - Processo Completo e Ajustes

**Data:** 10 de novembro de 2025  
**Status:** 🟡 Em Andamento - Ajustando para API Real

---

## 🎯 Descobertas Importantes

### ❗ MUDANÇA CRÍTICA: API Não Usa Webhooks

**O que planejamos inicialmente:**
```
Fortics → Webhook automático → CRM recebe notificação
```

**O que a API realmente faz:**
```
CRM → Consulta periódica (polling) → Fortics responde
```

**Impacto:**
- ✅ Mais simples (não precisa expor webhook público)
- ⚠️ Requer polling (consultas periódicas)
- ✅ Mais controle (consultamos quando quisermos)

---

## 📊 Variáveis Necessárias (Atualizadas)

### 1. DISCADOR_API_URL ✅
**O que é:** URL do servidor Fortics  
**Formato:** `http://pbx.fortics.com.br` ou `http://IP:PORTA`  
**Onde obter:** Suporte Fortics ou painel administrativo

### 2. DISCADOR_API_KEY ✅
**O que é:** Chave de integração  
**Formato:** String alfanumérica  
**Onde obter:** PBX > Cadastro > Serviços > Discagem Rápida

### 3. ~~DISCADOR_WEBHOOK_SECRET~~ ❌ NÃO NECESSÁRIO
**Motivo:** API não usa webhooks push

---

## 🔄 Ajustes no Código

### Arquivo 1: `backend/src/routes/calls.ts`

**Mudanças necessárias:**

#### Antes (Webhook):
```typescript
router.post("/webhook", async (req: Request, res: Response) => {
  const webhookSecret = req.headers["x-webhook-secret"];
  // ...
});
```

#### Depois (Polling):
```typescript
// Remover endpoint webhook
// Adicionar endpoint de polling
router.get("/poll-fortics", async (req: AuthRequest, res: Response) => {
  // Consulta periódica ao Fortics
});
```

---

### Arquivo 2: `backend/src/services/fortics.ts` (NOVO)

Criar serviço dedicado para comunicação com Fortics:

```typescript
// Serviço para integração com Fortics PBX
export class ForticsService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.DISCADOR_API_URL || "";
    this.apiKey = process.env.DISCADOR_API_KEY || "";
  }

  // Click-to-call
  async initiateCall(ramal: string, numeroDestino: string, accountCode?: string) {
    const url = `${this.baseUrl}/lisintegra.php`;
    const params = new URLSearchParams({
      gacao: "discar",
      gkey: this.apiKey,
      gsrc: ramal,
      gdst: numeroDestino,
      gresponse: "json",
      ...(accountCode && { gaccountcode: accountCode }),
    });

    const response = await fetch(`${url}?${params}`);
    return await response.json();
  }

  // Consultar status de chamada
  async getCallStatus(accountCode: string) {
    const url = `${this.baseUrl}/lisintegra.php`;
    const params = new URLSearchParams({
      gacao: "statuscdr",
      gkey: this.apiKey,
      gaccountcode: accountCode,
      gcdrtipo: "text",
    });

    const response = await fetch(`${url}?${params}`);
    return await response.text();
  }

  // Popup (dados da última chamada do agente)
  async getAgentPopup(loginAgente: string) {
    const url = `${this.baseUrl}/forticsApi.php`;
    const params = new URLSearchParams({
      acao: "popup",
      key: this.apiKey,
      login: loginAgente,
    });

    const response = await fetch(`${url}?${params}`);
    return await response.json();
  }

  // Download de gravação
  getRecordingUrl(accountCode: string) {
    return `${this.baseUrl}/lisintegra.php?gacao=download&gkey=${this.apiKey}&gaccountcode=${accountCode}`;
  }
}
```

---

### Arquivo 3: `backend/src/routes/calls.ts` (Atualizado)

```typescript
import { ForticsService } from "../services/fortics.js";

const forticsService = new ForticsService();

// Click-to-call ATUALIZADO
router.post("/click-to-call", async (req: AuthRequest, res: Response) => {
  try {
    const { phone_number, client_id, ramal } = req.body;

    if (!phone_number || !ramal) {
      return res.status(400).json({ error: "phone_number e ramal são obrigatórios" });
    }

    // Gerar accountcode único
    const accountCode = `${Date.now()}.${Math.random().toString(36).substring(7)}`;

    // Chamar API Fortics
    const forticsResponse = await forticsService.initiateCall(ramal, phone_number, accountCode);

    if (!forticsResponse.success) {
      return res.status(500).json({ error: "Erro ao iniciar chamada no Fortics" });
    }

    // Criar log de chamada no banco
    const { data: callLog, error } = await supabaseAdmin
      .from("call_logs")
      .insert({
        tenant_id: req.user!.tenant_id,
        call_id: forticsResponse.id || accountCode,
        client_id,
        direction: "outbound",
        status: "initiated",
        phone_number,
        operator_id: req.user!.id,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating call log:", error);
    }

    await createAuditLog(req, "create", "call", callLog?.id);

    res.json({
      success: true,
      call_id: forticsResponse.id,
      account_code: accountCode,
      call_log_id: callLog?.id,
      message: "Chamada iniciada",
    });
  } catch (error: any) {
    console.error("Error initiating call:", error);
    res.status(500).json({ error: "Erro ao iniciar chamada" });
  }
});

// NOVO: Consultar status de chamada
router.get("/:id/status", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Buscar chamada no banco
    const { data: callLog } = await supabaseAdmin
      .from("call_logs")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", req.user!.tenant_id)
      .single();

    if (!callLog) {
      return res.status(404).json({ error: "Chamada não encontrada" });
    }

    // Consultar status no Fortics
    const forticsStatus = await forticsService.getCallStatus(callLog.call_id);

    // Atualizar status no banco se necessário
    // (parsing do retorno do Fortics e atualização)

    res.json({
      call_log: callLog,
      fortics_status: forticsStatus,
    });
  } catch (error: any) {
    console.error("Error getting call status:", error);
    res.status(500).json({ error: "Erro ao consultar status" });
  }
});

// NOVO: Polling periódico (chamado pelo frontend via setTimeout/setInterval)
router.get("/poll-active", async (req: AuthRequest, res: Response) => {
  try {
    // Buscar chamadas ativas do usuário
    const { data: activeCalls } = await supabaseAdmin
      .from("call_logs")
      .select("*")
      .eq("operator_id", req.user!.id)
      .eq("tenant_id", req.user!.tenant_id)
      .in("status", ["initiated", "ringing"])
      .order("started_at", { ascending: false })
      .limit(10);

    // Para cada chamada ativa, consultar status no Fortics
    const callsWithStatus = await Promise.all(
      (activeCalls || []).map(async (call) => {
        try {
          const forticsStatus = await forticsService.getCallStatus(call.call_id);
          return {
            ...call,
            fortics_status: forticsStatus,
          };
        } catch (error) {
          return { ...call, fortics_status: null };
        }
      })
    );

    res.json({ calls: callsWithStatus });
  } catch (error: any) {
    console.error("Error polling calls:", error);
    res.status(500).json({ error: "Erro ao consultar chamadas" });
  }
});

// NOVO: Popup do agente (última chamada)
router.get("/popup/:agente", async (req: AuthRequest, res: Response) => {
  try {
    const { agente } = req.params;

    const popupData = await forticsService.getAgentPopup(agente);

    res.json(popupData);
  } catch (error: any) {
    console.error("Error getting agent popup:", error);
    res.status(500).json({ error: "Erro ao buscar popup do agente" });
  }
});

// Remover endpoint webhook (não é necessário)
// router.post("/webhook", ...) ❌ REMOVER
```

---

## 📝 Variáveis de Ambiente Atualizadas

### `backend/.env`
```env
# Fortics BPX
DISCADOR_API_URL=http://pbx.fortics.com.br
DISCADOR_API_KEY=abc123xyz456789

# Remover (não é necessário):
# DISCADOR_WEBHOOK_SECRET=xxx
```

### `frontend/.env`
```env
# Não precisa de variáveis adicionais
# Usa as mesmas do backend via API
```

---

## 🧪 Testes

### Teste 1: Click-to-Call

**Requisição:**
```bash
curl -X POST http://localhost:3000/api/calls/click-to-call \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "phone_number": "11999999999",
    "ramal": "1000",
    "client_id": "uuid-do-cliente"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "call_id": "4444",
  "account_code": "1699999999999.abc123",
  "message": "Chamada iniciada"
}
```

---

### Teste 2: Polling (Consultar Chamadas Ativas)

**Requisição:**
```bash
curl -X GET http://localhost:3000/api/calls/poll-active \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta esperada:**
```json
{
  "calls": [
    {
      "id": "uuid",
      "call_id": "4444",
      "phone_number": "11999999999",
      "status": "initiated",
      "fortics_status": "..."
    }
  ]
}
```

---

## ⚠️ Problemas Identificados e Soluções

### Problema 1: Não Há Webhooks

**Impacto:** CRM não recebe notificações automáticas  
**Solução:** Implementar polling (consultas periódicas)

**Como funciona o polling:**
```javascript
// Frontend
setInterval(async () => {
  const response = await api.get('/calls/poll-active');
  // Atualizar UI com chamadas ativas
}, 5000); // A cada 5 segundos
```

---

### Problema 2: Formato de Resposta Diferente

**Impacto:** Resposta do Fortics é diferente do planejado  
**Solução:** Criar camada de adaptação (ForticsService)

**Adaptação:**
```typescript
// Fortics retorna:
{
  "success": true,
  "retorno": "DISCANDO...",
  "id": "4444"
}

// Adaptamos para:
{
  "success": true,
  "call_id": "4444",
  "message": "Chamada iniciada"
}
```

---

### Problema 3: Status da Chamada em Texto

**Impacto:** Fortics retorna status em texto, não JSON estruturado  
**Solução:** Parser para interpretar resposta

**Parser necessário:**
```typescript
function parseCallStatus(textStatus: string) {
  // Interpretar resposta em texto do Fortics
  // e converter para objeto estruturado
  // Ex: "ANSWERED - 120s" → { status: "answered", duration: 120 }
}
```

---

## 📋 Checklist de Implementação

### Código Backend
- [ ] Criar `backend/src/services/fortics.ts`
- [ ] Atualizar `backend/src/routes/calls.ts`
- [ ] Remover endpoint webhook
- [ ] Adicionar endpoint de polling
- [ ] Adicionar endpoint de popup
- [ ] Criar parser de status

### Variáveis de Ambiente
- [ ] Atualizar `backend/.env`
- [ ] Remover `DISCADOR_WEBHOOK_SECRET`
- [ ] Adicionar `DISCADOR_API_URL`
- [ ] Adicionar `DISCADOR_API_KEY`

### Frontend
- [ ] Atualizar chamadas de API
- [ ] Implementar polling
- [ ] Atualizar UI em tempo real

### Testes
- [ ] Testar click-to-call
- [ ] Testar polling
- [ ] Testar popup
- [ ] Testar status de chamada

### Documentação
- [x] Analisar API real
- [x] Documentar diferenças
- [ ] Atualizar guias
- [ ] Testar integração

---

## 🎯 Próximos Passos

### 1. Obter Credenciais (VOCÊ) ⏳
```
Entre em contato com Fortics e obtenha:
- URL do servidor (DISCADOR_API_URL)
- Chave de integração (DISCADOR_API_KEY)
```

### 2. Implementar Código (EU) ⏳
```
- Criar ForticsService
- Atualizar rotas
- Implementar polling
- Testar integração
```

### 3. Testar (NÓS) ⏳
```
- Teste de click-to-call
- Teste de polling
- Teste de gravações
```

---

## 📞 Como Obter as Credenciais

### Opção 1: Suporte Fortics
```
Telefone: 0800 367 8427
Email: Via portal https://support.fortics.com.br

Solicite:
"Olá, preciso da URL do servidor Fortics PBX e 
da chave de integração para conectar meu CRM.
Onde encontro essas informações?"
```

### Opção 2: Painel Administrativo
```
1. Acesse o painel Fortics PBX
2. PBX > Cadastro > Serviços > Discagem Rápida
3. Copie:
   - URL do servidor
   - Chave de integração
```

---

## 📊 Resumo Executivo

**Descoberta:** API Fortics não usa webhooks, usa polling  
**Impacto:** Código precisa ser adaptado  
**Tempo estimado:** 2-3 horas de desenvolvimento  
**Status:** Aguardando credenciais para iniciar

**Você precisa:**
1. URL do servidor Fortics
2. Chave de integração

**Eu vou:**
1. Criar serviço de integração
2. Adaptar código
3. Implementar polling
4. Testar tudo

---

**Próxima ação:** Me envie as 2 credenciais para eu começar a implementação! 🚀

