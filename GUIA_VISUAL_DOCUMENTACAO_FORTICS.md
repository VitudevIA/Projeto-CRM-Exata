# 🔍 Guia Visual: Como Navegar na Documentação Fortics

## 🎯 Objetivo

Este guia vai te ensinar **O QUE PROCURAR** e **ONDE PROCURAR** na documentação do Fortics BPX.

---

## 📖 Passo 1: Abrindo a Documentação

1. Abra seu navegador
2. Digite: `http://docpbx.fortics.com.br:9090/`
3. Pressione Enter

### O Que Você Pode Ver:

#### Cenário A: Página com Menu Lateral
```
┌─────────────────────────────────────┐
│ 📚 Fortics BPX - Documentação       │
├───────────┬─────────────────────────┤
│ 📋 Início │                         │
│ 🔐 Auth   │   Bem-vindo à          │
│ 📞 Calls  │   Documentação API     │
│ 🔔 Events │                         │
│ ⚙️ Config │   Versão: 1.0          │
└───────────┴─────────────────────────┘
```
👉 **Clique em cada item do menu e explore**

#### Cenário B: Página com Índice
```
═══════════════════════════════════════
    FORTICS BPX - API DOCUMENTATION
═══════════════════════════════════════

1. Getting Started
2. Authentication
3. API Endpoints
   3.1. Call Management
   3.2. Campaign Management
4. Webhooks
5. Examples
```
👉 **Role a página e veja todas as seções**

#### Cenário C: Swagger/OpenAPI
```
┌─────────────────────────────────────┐
│ Swagger UI                          │
│                                     │
│ Fortics BPX API v1.0               │
│                                     │
│ ▼ Authentication                    │
│ ▼ Calls                            │
│ ▼ Campaigns                        │
│ ▼ Webhooks                         │
└─────────────────────────────────────┘
```
👉 **Clique nas setas ▼ para expandir cada seção**

---

## 🔑 Passo 2: Encontrando a URL Base da API

### O Que Procurar:

Procure por palavras-chave (use Ctrl+F):
- "Base URL"
- "API URL"
- "Endpoint"
- "Server"
- "Host"

### Exemplos Visuais:

#### Exemplo 1: Documentação em Texto
```
═══════════════════════════════════════
Base URL
═══════════════════════════════════════
http://pbx.fortics.com.br:8080/api
                                      👆 COPIE ISTO!
```

#### Exemplo 2: Swagger
```
Servers
  ┌─────────────────────────────────┐
  │ http://pbx.fortics.com.br:8080  │  👆 COPIE ISTO!
  └─────────────────────────────────┘
```

#### Exemplo 3: Dentro de Exemplo
```
Example Request:
curl -X POST http://api.fortics.com.br/v1/call/originate \
              👆 COPIE ESTA PARTE (até /v1)
```

### ✅ Como Anotar:

```
DISCADOR_API_URL=http://pbx.fortics.com.br:8080
```

---

## 🔐 Passo 3: Encontrando Autenticação (API Key)

### O Que Procurar:

Procure seções com:
- "Authentication"
- "Authorization"
- "API Key"
- "Token"
- "Credentials"
- "Security"

### Exemplos Visuais:

#### Exemplo 1: Header Bearer Token
```
═══════════════════════════════════════
Authentication
═══════════════════════════════════════
All requests must include:

Header: Authorization
Value: Bearer YOUR_API_KEY
              👆 ANOTE: Bearer Token
```

➡️ **Anote:** Formato é `Bearer {token}`

#### Exemplo 2: Header Custom
```
Authentication
--------------
Include the following header:

X-API-Key: your_api_key_here
👆 ANOTE: Header customizado
```

➡️ **Anote:** Formato é `X-API-Key: {key}`

#### Exemplo 3: Como Obter
```
Getting Your API Key
--------------------
1. Log in to admin panel: http://pbx.fortics.com.br/admin
2. Navigate to Settings > API
3. Click "Generate New Key"
4. Copy the generated key
   👆 SIGA ESTES PASSOS!
```

### ✅ Como Anotar:

```
Formato: Bearer Token
Como obter:
1. Acessar http://pbx.fortics.com.br/admin
2. Menu Settings > API
3. Gerar nova chave

DISCADOR_API_KEY=sua_chave_aqui
```

---

## 🔔 Passo 4: Encontrando Webhooks

### O Que Procurar:

Procure seções com:
- "Webhooks"
- "Callbacks"
- "Events"
- "Notifications"
- "Real-time Events"

### Exemplos Visuais:

#### Exemplo 1: Configuração de Webhook
```
═══════════════════════════════════════
Webhooks Configuration
═══════════════════════════════════════

To receive call events:

1. Configure webhook URL in admin panel
2. Set secret key for validation
3. Select events to receive
   
Secret Header: X-Webhook-Secret
           👆 ANOTE O NOME DO HEADER
```

#### Exemplo 2: Eventos Disponíveis
```
Available Events:
-----------------
☐ call.started    - Call initiated
☐ call.answered   - Call was answered
☐ call.ended      - Call ended normally
☐ call.failed     - Call failed
  👆 ANOTE TODOS OS EVENTOS
```

#### Exemplo 3: Payload Example
```json
Event: call.started
Payload:
{
  "event": "call.started",
  "call_id": "123abc",
  "phone": "11999999999",
  "timestamp": "2025-11-10T15:30:00Z"
}
👆 COPIE O EXEMPLO COMPLETO
```

### ✅ Como Anotar:

```
Header webhook: X-Webhook-Secret
Eventos disponíveis:
- call.started
- call.answered
- call.ended
- call.failed

Exemplo de payload:
{
  "event": "call.started",
  "call_id": "123abc",
  ...
}

DISCADOR_WEBHOOK_SECRET=secret_aqui
```

---

## 📞 Passo 5: Encontrando Click-to-Call

### O Que Procurar:

Procure seções com:
- "Click to Call"
- "Initiate Call"
- "Make Call"
- "Originate"
- "Start Call"
- "Call Endpoints"

### Exemplos Visuais:

#### Exemplo 1: Endpoint Documentado
```
═══════════════════════════════════════
POST /api/call/originate
═══════════════════════════════════════

Initiates a new outbound call

Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
  {
    "phone_number": "11999999999",  👈 CAMPO OBRIGATÓRIO
    "extension": "8001",             👈 CAMPO OBRIGATÓRIO
    "caller_id": "1140001000"        👈 CAMPO OPCIONAL
  }

Response 200:
  {
    "call_id": "abc123",
    "status": "initiated"
  }
```

👆 **COPIE TUDO ISSO!**

#### Exemplo 2: Swagger Expandido
```
▼ POST /api/call/originate

  Parameters:
    phone_number (required)  string   Phone to call
    extension (required)     string   Extension to use
    
  Response 200:
    {
      "call_id": "string",
      "status": "initiated"
    }
    
  Try it out
```

👆 **Clique em "Try it out" para testar!**

### ✅ Como Anotar:

```
Endpoint: POST /api/call/originate
URL completa: http://pbx.fortics.com.br:8080/api/call/originate

Headers:
- Authorization: Bearer {token}
- Content-Type: application/json

Payload:
{
  "phone_number": "11999999999",  // obrigatório
  "extension": "8001",             // obrigatório
  "caller_id": "1140001000"        // opcional
}

Resposta:
{
  "call_id": "abc123",
  "status": "initiated"
}
```

---

## 🎯 Dicas de Navegação

### 1. Use a Busca do Navegador
```
Ctrl + F (Windows/Linux)
Cmd + F (Mac)

Palavras-chave úteis:
- authentication
- webhook
- call
- API
- token
- secret
```

### 2. Explore Todas as Abas/Menus
```
Se vir um menu lateral, clique em TUDO:
☐ Home
☐ Getting Started
☐ Authentication  👈 IMPORTANTE!
☐ API Reference
☐ Webhooks        👈 IMPORTANTE!
☐ Examples        👈 MUITO ÚTIL!
☐ FAQ
```

### 3. Procure por "Examples" ou "Exemplos"
```
Exemplos geralmente mostram:
✓ URL completa
✓ Headers necessários
✓ Payload completo
✓ Resposta esperada
```

### 4. Se Tiver Swagger, USE!
```
Swagger permite:
✓ Ver todos os endpoints
✓ Testar na hora
✓ Ver exemplos automáticos
✓ Baixar especificação
```

---

## 📸 O Que Fazer Se Encontrar

### Encontrou uma Página de Login?
```
┌─────────────────────────────────┐
│   🔐 Fortics BPX Admin          │
│                                 │
│   Username: [____________]      │
│   Password: [____________]      │
│   [  Login  ]                   │
└─────────────────────────────────┘
```

👉 **AÇÃO:**
1. Se tiver credenciais, faça login
2. Se não tiver, solicite à Fortics
3. Procure por "API" ou "Integrations" após login

### Encontrou Swagger/OpenAPI?
```
┌─────────────────────────────────┐
│   📘 Swagger UI                 │
│   Fortics BPX API v1.0         │
└─────────────────────────────────┘
```

👉 **AÇÃO:**
1. Expanda todas as seções (▼)
2. Leia cada endpoint
3. Use "Try it out" para testar
4. Copie os exemplos

### Encontrou Só Texto?
```
Fortics BPX - API Documentation
================================

This API allows you to...
```

👉 **AÇÃO:**
1. Role a página inteira
2. Use Ctrl+F para buscar palavras-chave
3. Copie todos os exemplos de código

### Encontrou PDF ou Download?
```
[📄 Download API Documentation]
```

👉 **AÇÃO:**
1. Baixe o arquivo
2. Abra e leia com atenção
3. Use Ctrl+F para buscar no PDF

---

## ✅ Checklist de Informações

Enquanto explora, marque o que encontrou:

### Informações Básicas
- [ ] URL base da API
- [ ] Versão da API (se houver)
- [ ] Porta (se não for padrão 80/443)

### Autenticação
- [ ] Tipo de autenticação (Bearer, API Key, Basic)
- [ ] Nome do header
- [ ] Como obter a chave
- [ ] Exemplo de uso

### Webhooks
- [ ] Como configurar no painel
- [ ] Nome do header do secret
- [ ] Lista de eventos disponíveis
- [ ] Exemplo de payload completo
- [ ] URL onde configurar webhooks

### Click-to-Call
- [ ] URL do endpoint
- [ ] Método HTTP (POST/GET/PUT)
- [ ] Headers necessários
- [ ] Campos obrigatórios do payload
- [ ] Campos opcionais do payload
- [ ] Exemplo de resposta

### Extras
- [ ] Rate limits (limite de requisições)
- [ ] Códigos de erro possíveis
- [ ] Exemplos de código
- [ ] Contato do suporte

---

## 🆘 Se Ficar Perdido

### Não Encontrei Nada Sobre API

**Possíveis causas:**
- Documentação é para usuários finais, não desenvolvedores
- API não está documentada publicamente
- Precisa de credenciais para acessar docs

**O que fazer:**
1. Procure por "Developer", "API", "Integration" no menu
2. Verifique se há link para "API docs" no footer
3. Entre em contato com suporte Fortics: 0800 367 8427

### A Documentação Está em Inglês e Não Entendo

**O que fazer:**
1. Use Google Tradutor na página inteira
2. Copie os trechos importantes e me envie em inglês mesmo
3. Foque em copiar os **exemplos de código** (não precisa traduzir)

### Encontrei Mas Não Entendi

**O que fazer:**
1. Tire screenshots de TUDO que vir
2. Copie e cole os textos (mesmo sem entender)
3. Me envie tudo junto com suas dúvidas
4. Eu vou interpretar e configurar

---

## 📤 Como Me Enviar as Informações

### Formato Ideal:

```
=== URL BASE ===
http://pbx.fortics.com.br:8080

=== AUTENTICAÇÃO ===
Tipo: Bearer Token
Header: Authorization: Bearer {token}
Como obter: [descreva ou cole screenshot]

=== WEBHOOK ===
Header: X-Webhook-Secret
Eventos: call.started, call.answered, call.ended
Payload exemplo:
{...}

=== CLICK-TO-CALL ===
POST http://pbx.fortics.com.br:8080/api/call/originate
Body: {...}

=== SCREENSHOTS ===
[Anexe screenshots aqui]

=== DÚVIDAS ===
[Suas dúvidas aqui]
```

### Ou Use o Template:

Preencha o arquivo `TEMPLATE_INFORMACOES_FORTICS.md` que criei.

---

## 🎓 Resumo: 5 Passos Simples

1. **Abra** http://docpbx.fortics.com.br:9090/
2. **Procure** por "Authentication", "Webhooks", "API", "Call"
3. **Copie** todos os exemplos e URLs que encontrar
4. **Tire screenshots** das páginas importantes
5. **Me envie** tudo no formato acima

---

**Você consegue! É só seguir o passo a passo. Se tiver qualquer dúvida, me envie o que encontrou que eu te ajudo a interpretar! 🚀**

