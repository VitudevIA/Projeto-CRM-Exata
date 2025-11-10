# 📞 Guia Completo: Integração com Discador

## 🎯 O Que É Um Discador?

Um **discador** é um sistema que automatiza a realização de chamadas telefônicas. No seu caso, você usa o **Fortics BPX**, que:

- **Disca automaticamente** números de uma lista (mailing)
- **Conecta chamadas atendidas** ao operador no 3CXPhone
- **Registra informações** sobre cada chamada (duração, gravação, etc.)

### Por Que Precisamos Integrar?

A integração permite que:
- ✅ O CRM **receba notificações** quando uma chamada acontece
- ✅ O CRM **inicie chamadas** diretamente (click-to-call)
- ✅ O CRM **registre automaticamente** todas as chamadas
- ✅ O CRM **abra a tela de tabulação** quando o operador atende

---

## 🔑 As 3 Variáveis de Ambiente

### 1. `DISCADOR_WEBHOOK_SECRET`

**O que é:**
- Uma **senha secreta** que garante que as notificações vêm realmente do discador
- É como uma "chave" que só você e o discador conhecem

**Para que serve:**
- Quando o discador envia uma notificação (ex: "chamada iniciada"), ele envia essa senha
- O CRM verifica se a senha está correta antes de processar
- **Segurança**: Evita que pessoas mal-intencionadas enviem notificações falsas

**Exemplo:**
```
DISCADOR_WEBHOOK_SECRET=abc123xyz789segredo456
```

**O que solicitar à empresa:**
> "Preciso de uma **chave secreta (secret key)** para validar os webhooks que o discador enviará para o meu CRM. Esta chave será usada no header `x-webhook-secret` das requisições."

---

### 2. `DISCADOR_API_URL`

**O que é:**
- O **endereço (URL)** da API do discador
- É onde o CRM vai fazer requisições para iniciar chamadas

**Para que serve:**
- Quando você clica em "Ligar" no CRM, ele envia uma requisição para essa URL
- O discador recebe a requisição e inicia a chamada

**Exemplo:**
```
DISCADOR_API_URL=https://api.fortics.com
```
ou
```
DISCADOR_API_URL=https://bpx.fortics.com.br/api
```

**O que solicitar à empresa:**
> "Preciso da **URL base da API** do Fortics BPX. Por exemplo: `https://api.fortics.com` ou `https://bpx.fortics.com.br/api`. Esta é a URL onde o CRM enviará requisições para iniciar chamadas."

---

### 3. `DISCADOR_API_KEY`

**O que é:**
- Uma **chave de autenticação** (token) que identifica seu sistema
- É como uma "senha" que permite ao CRM fazer requisições na API do discador

**Para que serve:**
- Toda vez que o CRM quer iniciar uma chamada, ele envia essa chave
- O discador verifica se a chave é válida antes de processar
- **Autenticação**: Garante que apenas sistemas autorizados podem iniciar chamadas

**Exemplo:**
```
DISCADOR_API_KEY=Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
ou
```
DISCADOR_API_KEY=FTX-1234567890-ABCDEFGHIJKLMNOP
```

**O que solicitar à empresa:**
> "Preciso de uma **chave de API (API Key)** ou **token de autenticação** para o Fortics BPX. Esta chave será usada para autenticar as requisições que o CRM enviará para iniciar chamadas. Pode ser um token JWT, uma API key, ou outro formato que vocês utilizem."

---

## 🔄 Como Funciona a Integração?

### Fluxo 1: Discador Notifica o CRM (Webhook)

```
1. Discador inicia chamada
   ↓
2. Discador envia notificação para: https://seu-crm.com/api/calls/webhook
   Headers: x-webhook-secret: abc123xyz789segredo456
   Body: { event: "call_started", data: { call_id: "123", phone: "11999999999" } }
   ↓
3. CRM verifica se o secret está correto
   ↓
4. CRM cria registro da chamada no banco de dados
   ↓
5. CRM abre tela de tabulação para o operador
```

### Fluxo 2: CRM Inicia Chamada (Click-to-Call)

```
1. Operador clica em "Ligar" no CRM
   ↓
2. CRM envia requisição para: https://api.fortics.com/api/call/initiate
   Headers: Authorization: Bearer FTX-1234567890-ABCDEFGHIJKLMNOP
   Body: { phone_number: "11999999999", operator_id: "user123", tenant_id: "tenant456" }
   ↓
3. Discador recebe e valida a chave
   ↓
4. Discador inicia a chamada
   ↓
5. Discador retorna: { call_id: "123", status: "initiated" }
   ↓
6. CRM registra a chamada no banco de dados
```

---

## 📋 O Que Solicitar à Empresa (Fortics)

### Email/Chamada Modelo

```
Assunto: Solicitação de Credenciais para Integração API - Fortics BPX

Olá equipe Fortics,

Estou integrando o sistema Fortics BPX com nosso CRM e preciso das seguintes informações:

1. **URL da API**
   - Qual é a URL base da API do Fortics BPX?
   - Exemplo: https://api.fortics.com ou https://bpx.fortics.com.br/api

2. **Chave de API (API Key)**
   - Preciso de uma chave de autenticação para fazer requisições na API
   - Esta chave será usada no header "Authorization" das requisições
   - Pode ser um token JWT, API key, ou outro formato que vocês utilizem

3. **Secret para Webhook**
   - Preciso de uma chave secreta para validar os webhooks
   - O CRM receberá notificações em: https://meu-crm.com/api/calls/webhook
   - Esta chave será enviada no header "x-webhook-secret"

4. **Documentação da API**
   - Se possível, gostaria de receber a documentação da API
   - Especialmente sobre:
     - Endpoint para iniciar chamadas (click-to-call)
     - Formato dos webhooks (eventos e dados enviados)
     - Formato de autenticação

5. **Eventos de Webhook**
   - Quais eventos o discador pode enviar?
   - Exemplos: call_started, call_answered, call_ended, call_failed
   - Qual é o formato exato dos dados enviados em cada evento?

Agradeço desde já pela atenção!

Atenciosamente,
[Seu Nome]
```

---

## 🔧 Como Configurar Após Receber as Informações

### Passo 1: Adicionar no `backend/.env`

Após receber as informações da Fortics, edite o arquivo `backend/.env`:

```env
# Substitua pelos valores reais fornecidos pela Fortics
DISCADOR_WEBHOOK_SECRET=abc123xyz789segredo456  # ← Valor fornecido pela Fortics
DISCADOR_API_URL=https://api.fortics.com        # ← URL fornecida pela Fortics
DISCADOR_API_KEY=FTX-1234567890-ABCDEFGHIJKLMNOP  # ← Chave fornecida pela Fortics
```

### Passo 2: Adicionar na Vercel (Produção)

1. Acesse: https://vercel.com/vitu-dev-ias-projects/projeto_crm_exata/settings/environment-variables

2. Adicione cada variável:
   - **Key**: `DISCADOR_WEBHOOK_SECRET`
   - **Value**: `abc123xyz789segredo456` (valor fornecido)
   - **Environment**: Production, Preview, Development
   - Clique em **Save**

   Repita para:
   - `DISCADOR_API_URL`
   - `DISCADOR_API_KEY`

### Passo 3: Configurar Webhook no Discador

Você precisará configurar no painel do Fortics BPX para onde enviar os webhooks:

1. Acesse o painel administrativo do Fortics BPX
2. Procure por "Webhooks" ou "Integrações" ou "API"
3. Configure:
   - **URL do Webhook**: `https://projetocrmexata.vercel.app/api/calls/webhook`
   - **Secret**: O mesmo valor que você colocou em `DISCADOR_WEBHOOK_SECRET`
   - **Eventos**: Selecione os eventos que deseja receber:
     - `call_started` (chamada iniciada)
     - `call_answered` (chamada atendida)
     - `call_ended` (chamada finalizada)
     - `call_failed` (chamada falhou)

---

## 🧪 Como Testar a Integração

### Teste 1: Verificar Configuração

1. Inicie o backend localmente:
   ```bash
   cd backend
   npm run dev
   ```

2. Verifique os logs ao iniciar:
   - Deve aparecer: "Supabase config check: { hasUrl: true, ... }"
   - Não deve aparecer erros sobre variáveis faltando

### Teste 2: Testar Webhook (Simulação)

Você pode simular um webhook usando Postman ou curl:

```bash
curl -X POST http://localhost:3000/api/calls/webhook \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: abc123xyz789segredo456" \
  -d '{
    "event": "call_started",
    "data": {
      "call_id": "test-123",
      "phone_number": "11999999999",
      "direction": "outbound",
      "operator_id": "user-id-aqui",
      "tenant_id": "tenant-id-aqui"
    }
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "call_log_id": "uuid-do-log-criado"
}
```

### Teste 3: Testar Click-to-Call

1. Faça login no CRM
2. Vá até um cliente
3. Clique no botão "Ligar" ou "Click-to-Call"
4. Verifique se a chamada é iniciada no discador

---

## ⚠️ Importante: Segurança

### 🔒 Mantenha as Chaves Secretas

- ❌ **NUNCA** compartilhe essas chaves publicamente
- ❌ **NUNCA** commite o arquivo `.env` no Git
- ✅ Use variáveis de ambiente na Vercel
- ✅ Use diferentes chaves para desenvolvimento e produção (se possível)

### 🔒 Validação de Webhook

O sistema valida automaticamente:
- ✅ Se o `x-webhook-secret` está correto
- ✅ Se a requisição vem de uma origem confiável (via CORS)
- ❌ Rejeita requisições sem o secret correto

---

## 📚 Glossário de Termos

| Termo | Significado |
|-------|-------------|
| **API** | Interface de Programação de Aplicações - forma de sistemas se comunicarem |
| **Webhook** | Notificação enviada automaticamente por um sistema para outro |
| **Secret** | Chave secreta usada para validar a autenticidade de uma requisição |
| **API Key** | Chave de autenticação que identifica seu sistema na API |
| **Click-to-Call** | Funcionalidade de clicar em um botão para iniciar uma chamada |
| **Bearer Token** | Formato de autenticação onde a chave é enviada como "Bearer {chave}" |
| **Header** | Cabeçalho HTTP - informações adicionais enviadas com a requisição |

---

## 🆘 Problemas Comuns

### Erro: "Configuração do discador não encontrada"

**Causa:** Variáveis de ambiente não configuradas

**Solução:**
1. Verifique se o arquivo `backend/.env` existe
2. Verifique se as 3 variáveis estão preenchidas
3. Reinicie o servidor backend

### Erro: "Unauthorized" no webhook

**Causa:** Secret incorreto ou não enviado

**Solução:**
1. Verifique se o `DISCADOR_WEBHOOK_SECRET` está correto
2. Verifique se o discador está enviando o header `x-webhook-secret`
3. Confirme com a Fortics qual é o secret correto

### Erro: "Erro ao iniciar chamada"

**Causa:** API Key incorreta ou URL da API errada

**Solução:**
1. Verifique se `DISCADOR_API_URL` está correto
2. Verifique se `DISCADOR_API_KEY` está correto
3. Teste a API diretamente (Postman/curl) para verificar se funciona
4. Confirme com a Fortics o formato correto da autenticação

---

## ✅ Checklist de Integração

- [ ] Solicitar informações à Fortics (URL, API Key, Secret)
- [ ] Receber documentação da API (se disponível)
- [ ] Configurar variáveis no `backend/.env`
- [ ] Configurar variáveis na Vercel (produção)
- [ ] Configurar webhook no painel do Fortics BPX
- [ ] Testar webhook (simulação)
- [ ] Testar click-to-call
- [ ] Verificar se chamadas estão sendo registradas no CRM
- [ ] Verificar se tela de tabulação abre automaticamente

---

## 📞 Próximos Passos

1. **Envie o email modelo** para a Fortics solicitando as informações
2. **Aguarde a resposta** com as credenciais
3. **Configure as variáveis** conforme este guia
4. **Teste a integração** seguindo os passos acima
5. **Entre em contato** se precisar de ajuda adicional

---

**Tempo estimado para configuração:** 30-60 minutos (após receber as credenciais)

**Dúvidas?** Consulte a documentação da API da Fortics ou entre em contato com o suporte deles.

