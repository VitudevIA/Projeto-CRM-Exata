# 🔧 Integração Fortics BPX - Passo a Passo Completo

## 📋 Status da Integração

**Data de início:** 10 de novembro de 2025  
**Status:** 🔄 Em Progresso - Aguardando acesso à documentação  
**Link da documentação:** http://docpbx.fortics.com.br:9090/

---

## 🎯 Objetivo

Integrar o CRM com o discador Fortics BPX para:
- ✅ Receber notificações de chamadas (webhooks)
- ✅ Iniciar chamadas do CRM (click-to-call)
- ✅ Registrar automaticamente todas as chamadas
- ✅ Abrir tela de tabulação quando o operador atende

---

## 🚨 IMPORTANTE: Acesso à Documentação

### Problema Identificado

O link fornecido `http://docpbx.fortics.com.br:9090/` não está acessível externamente. Possíveis causas:

1. **Rede Local/VPN**: A documentação pode estar em uma rede interna da Fortics
2. **Firewall**: Pode haver restrição de acesso externo
3. **IP Dinâmico**: O servidor pode estar temporariamente indisponível

### ✅ Soluções

#### Opção 1: Acesse Você Mesmo e Me Envie (RECOMENDADO)

1. Abra o link no seu navegador: http://docpbx.fortics.com.br:9090/
2. Tire screenshots ou copie o conteúdo relevante
3. Me envie as seguintes informações:
   - Como autenticar na API (exemplo de cabeçalhos)
   - Endpoint para iniciar chamadas
   - Formato dos webhooks
   - Como obter/gerar as chaves de API

#### Opção 2: Solicite PDF ao Suporte Fortics

Entre em contato com a Fortics e solicite:
- Documentação da API em PDF
- Exemplos de requisições (curl/Postman)
- Manual de integração

**Contato Fortics:**
- Telefone: 0800 367 8427
- Portal: https://support.fortics.com.br

#### Opção 3: Compartilhe Acesso VPN

Se a documentação está em uma rede privada, a Fortics pode fornecer:
- Credenciais VPN temporárias
- Link público alternativo
- Documentação por email

---

## 🔍 O Que Precisamos Descobrir na Documentação

### 1. Autenticação (DISCADOR_API_KEY)

Procure na documentação por:
- **Seções**: "Authentication", "API Key", "Token", "Credenciais"
- **Informações necessárias**:
  - Como obter a chave de API?
  - Qual o formato? (Bearer token, API key simples, etc.)
  - Como enviar? (Header Authorization, query parameter, etc.)
  
**Exemplos do que procurar:**
```
Authorization: Bearer {token}
ou
X-API-Key: {sua_chave}
ou
apikey={sua_chave}
```

### 2. URL Base da API (DISCADOR_API_URL)

Procure por:
- **Seções**: "Base URL", "Endpoint", "API URL"
- **Exemplos**:
  - `https://api.fortics.com.br`
  - `http://pbx.fortics.com.br:8080/api`
  - `https://bpx.fortics.com.br/api/v1`

### 3. Webhooks (DISCADOR_WEBHOOK_SECRET)

Procure por:
- **Seções**: "Webhooks", "Callbacks", "Notificações", "Events"
- **Informações necessárias**:
  - Como configurar webhooks no painel?
  - Qual secret/chave é enviado no header?
  - Quais eventos estão disponíveis?
  - Formato do payload

**Exemplos do que procurar:**
```
Webhook Secret: abc123...
Header: X-Webhook-Secret ou X-Fortics-Signature
Eventos: call.started, call.answered, call.ended
```

### 4. Endpoint Click-to-Call

Procure por:
- **Seções**: "Click to Call", "Initiate Call", "Make Call", "Originate"
- **Informações necessárias**:
  - URL do endpoint (ex: `/api/call/initiate`)
  - Método HTTP (POST, GET)
  - Parâmetros necessários
  - Formato da resposta

**Exemplo do que procurar:**
```http
POST /api/call/initiate
Content-Type: application/json
Authorization: Bearer {token}

{
  "phone_number": "11999999999",
  "caller_id": "1140001000",
  "extension": "8001"
}
```

---

## 📝 Checklist de Documentação

Ao acessar a documentação, anote:

- [ ] **URL Base da API**
  - Exemplo: _______________

- [ ] **Formato de Autenticação**
  - Tipo: [ ] Bearer Token [ ] API Key [ ] Basic Auth [ ] Outro: ___
  - Header: _______________
  - Como obter: _______________

- [ ] **Webhook Secret**
  - Como obter: _______________
  - Nome do header: _______________
  
- [ ] **Endpoint Click-to-Call**
  - URL completa: _______________
  - Método: [ ] POST [ ] GET [ ] PUT
  - Parâmetros obrigatórios: _______________
  
- [ ] **Eventos de Webhook Disponíveis**
  - [ ] call_started / call.started
  - [ ] call_answered / call.answered
  - [ ] call_ended / call.ended
  - [ ] call_failed / call.failed
  - [ ] Outros: _______________

- [ ] **Formato do Payload do Webhook**
  - Estrutura JSON: _______________

---

## 🔧 Código Preparado para Integração

### Arquivos Já Configurados

O código já está preparado para receber as variáveis. Veja onde estão sendo usadas:

#### 1. Backend - Rotas de Chamadas (`backend/src/routes/calls.ts`)

```typescript
// Webhook do discador (linhas 9-109)
router.post("/webhook", async (req: Request, res: Response) => {
  const webhookSecret = req.headers["x-webhook-secret"];
  const expectedSecret = process.env.DISCADOR_WEBHOOK_SECRET; // ← VARIÁVEL 1
  
  if (webhookSecret !== expectedSecret) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // ... processa eventos
});

// Click-to-call (linhas 205-275)
router.post("/click-to-call", async (req: AuthRequest, res: Response) => {
  const discadorApiUrl = process.env.DISCADOR_API_URL;      // ← VARIÁVEL 2
  const discadorApiKey = process.env.DISCADOR_API_KEY;      // ← VARIÁVEL 3
  
  const response = await fetch(`${discadorApiUrl}/api/call/initiate`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${discadorApiKey}`,
    },
    body: JSON.stringify({ phone_number, operator_id, tenant_id, client_id }),
  });
});
```

#### 2. Variáveis de Ambiente

**Local (`backend/.env`):**
```env
DISCADOR_WEBHOOK_SECRET=seu_webhook_secret_aqui
DISCADOR_API_URL=https://api.discador.com
DISCADOR_API_KEY=sua_chave_api_discador
```

**Vercel (Produção):**
- Já temos um guia em `CONFIGURAR_VARIAVEIS_VERCEL.md`
- Link direto: https://vercel.com/vitu-dev-ias-projects/projeto_crm_exata/settings/environment-variables

---

## 🎬 Próximos Passos

### Passo 1: Acesse a Documentação ✋ **VOCÊ PRECISA FAZER**

1. Abra http://docpbx.fortics.com.br:9090/ no seu navegador
2. Se não abrir:
   - Verifique se está na VPN da empresa
   - Entre em contato com a Fortics
   - Solicite documentação alternativa

### Passo 2: Extraia as Informações ✋ **VOCÊ PRECISA FAZER**

Use o checklist acima para anotar todas as informações necessárias.

### Passo 3: Me Envie os Dados ✋ **VOCÊ PRECISA FAZER**

Envie as informações no seguinte formato:

```
DISCADOR_API_URL=http://exemplo.com
DISCADOR_API_KEY=abc123
DISCADOR_WEBHOOK_SECRET=xyz789

INFORMAÇÕES ADICIONAIS:
- Endpoint click-to-call: POST /api/calls/originate
- Formato autenticação: Bearer token no header Authorization
- Nome do header webhook: X-Fortics-Signature
- Eventos disponíveis: call.started, call.answered, call.ended
```

### Passo 4: Eu Configuro no Código ✅ **EU FAÇO**

Após receber as informações, eu vou:
- ✅ Atualizar o código com os valores corretos
- ✅ Ajustar endpoints se necessário
- ✅ Configurar formato de autenticação
- ✅ Adaptar webhooks ao formato da Fortics
- ✅ Criar testes
- ✅ Atualizar documentação

---

## 🔬 Testes que Faremos

### Teste 1: Validar Credenciais

```bash
# Testar se a API Key funciona
curl -X GET http://DISCADOR_API_URL/api/status \
  -H "Authorization: Bearer DISCADOR_API_KEY"
```

### Teste 2: Click-to-Call

```bash
# Testar iniciar chamada
curl -X POST http://DISCADOR_API_URL/api/call/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DISCADOR_API_KEY" \
  -d '{
    "phone_number": "11999999999",
    "extension": "8001"
  }'
```

### Teste 3: Webhook Local

```bash
# Simular webhook
curl -X POST http://localhost:3000/api/calls/webhook \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: DISCADOR_WEBHOOK_SECRET" \
  -d '{
    "event": "call_started",
    "data": {
      "call_id": "test-123",
      "phone_number": "11999999999"
    }
  }'
```

---

## 📊 Estrutura Esperada da API

### API Típica de Discadores (Baseado em Padrões)

Discadores como Fortics BPX geralmente seguem padrões similares:

#### Endpoints Comuns:

1. **Autenticação**
   - `POST /api/auth/login` - Obter token
   - `GET /api/auth/validate` - Validar token

2. **Chamadas**
   - `POST /api/call/originate` - Iniciar chamada
   - `GET /api/call/{id}` - Status da chamada
   - `DELETE /api/call/{id}` - Encerrar chamada

3. **Campanhas/Mailing**
   - `GET /api/campaigns` - Listar campanhas
   - `POST /api/campaigns/{id}/contacts` - Adicionar contatos

4. **Webhooks**
   - Configurado no painel administrativo
   - Envia eventos: started, answered, ended, failed

#### Formato Comum de Webhook:

```json
{
  "event": "call.answered",
  "timestamp": "2025-11-10T15:30:00Z",
  "data": {
    "call_id": "abc123",
    "campaign_id": "camp001",
    "phone_number": "11999999999",
    "extension": "8001",
    "agent_id": "agent001",
    "duration": 0
  }
}
```

---

## 🐛 Possíveis Problemas e Soluções

### Problema 1: Não Consigo Acessar a Documentação

**Sintomas:**
- Link não abre
- Timeout
- Erro de conexão

**Soluções:**
1. Verifique se está na VPN da empresa
2. Tente acessar de outro computador/rede
3. Contate a Fortics: 0800 367 8427
4. Solicite PDF da documentação

### Problema 2: Credenciais Não Fornecidas na Documentação

**Sintomas:**
- Documentação não mostra como obter API Key
- Não há seção de credenciais

**Soluções:**
1. Procure por "Painel Administrativo" ou "Admin Panel"
2. Verifique se há seção "Integrações" ou "API"
3. Entre em contato com suporte técnico da Fortics
4. Pode ser necessário ativar o módulo de API

### Problema 3: Formato de Autenticação Diferente

**Sintomas:**
- Bearer token não funciona
- Erro 401 Unauthorized

**Soluções:**
1. Verifique exemplos na documentação
2. Pode usar outros formatos:
   - `X-API-Key: {chave}`
   - `Authorization: Basic {base64}`
   - Query parameter: `?apikey={chave}`
3. Adaptar código conforme necessário

### Problema 4: Webhooks Não São Recebidos

**Sintomas:**
- Chamadas não aparecem no CRM
- Sem notificações

**Soluções:**
1. Verificar se webhook foi configurado no painel Fortics
2. Verificar se URL está correta (produção: https://projetocrmexata.vercel.app/api/calls/webhook)
3. Verificar logs do Vercel para erros
4. Testar webhook localmente primeiro
5. Verificar se secret está correto

---

## 📞 Suporte Fortics

Se precisar de ajuda da Fortics:

**Telefone:** 0800 367 8427  
**Portal:** https://support.fortics.com.br  
**Documentação Geral:** https://support.fortics.com.br/pt-BR/support/solutions/articles/61000305687

---

## 📋 Status Atual

| Item | Status | Observações |
|------|--------|-------------|
| Código preparado | ✅ Completo | Aguardando credenciais |
| Documentação lida | ⏳ Pendente | Aguardando acesso |
| Credenciais obtidas | ⏳ Pendente | Aguardando documentação |
| Variáveis configuradas | ⏳ Pendente | Aguardando credenciais |
| Testes realizados | ⏳ Pendente | Aguardando configuração |
| Integração funcionando | ⏳ Pendente | Aguardando testes |

---

## 🎯 O Que Fazer AGORA

1. **Abra o link da documentação** no seu navegador
2. **Tire screenshots** ou copie as informações relevantes
3. **Me envie as informações** usando o formato do "Passo 3"
4. **Eu configuro tudo** no código e testo

---

**Última atualização:** 10 de novembro de 2025  
**Próxima ação:** Aguardando acesso à documentação pelo usuário

