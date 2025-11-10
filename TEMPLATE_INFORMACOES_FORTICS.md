# 📋 Template - Informações da API Fortics BPX

**IMPORTANTE:** Preencha este template com as informações da documentação `http://docpbx.fortics.com.br:9090/`

---

## 1️⃣ URL Base da API

**URL completa:**
```
DISCADOR_API_URL=
```

**Exemplo que encontrei na documentação:**
```
[Cole aqui um screenshot ou trecho da documentação]
```

**Observações:**
- [ ] É HTTP ou HTTPS?
- [ ] Tem porta específica? (ex: :8080, :9090)
- [ ] Tem versão na URL? (ex: /api/v1)

---

## 2️⃣ Autenticação (API Key)

### Como Obter a Chave

**Método encontrado na documentação:**
```
[Descreva o passo a passo]

Exemplo:
1. Acessar painel em http://...
2. Menu "Configurações" > "API"
3. Clicar em "Gerar Nova Chave"
4. Copiar a chave gerada
```

### Formato da Chave

**Tipo de autenticação:**
- [ ] Bearer Token (Authorization: Bearer {token})
- [ ] API Key no header (X-API-Key: {key})
- [ ] Basic Auth (Authorization: Basic {base64})
- [ ] Query Parameter (?apikey={key})
- [ ] Outro: ___________________

**Chave obtida:**
```
DISCADOR_API_KEY=
```

**Exemplo encontrado na documentação:**
```
[Cole aqui um exemplo de requisição com autenticação]
```

---

## 3️⃣ Webhook Secret

### Como Obter o Secret

**Método encontrado na documentação:**
```
[Descreva o passo a passo]

Exemplo:
1. Acessar painel em http://...
2. Menu "Integrações" > "Webhooks"
3. Criar novo webhook
4. Definir URL: https://projetocrmexata.vercel.app/api/calls/webhook
5. Copiar o secret gerado
```

### Formato do Secret

**Nome do header que o Fortics envia:**
- [ ] x-webhook-secret
- [ ] X-Fortics-Signature
- [ ] X-Webhook-Token
- [ ] Authorization
- [ ] Outro: ___________________

**Secret obtido:**
```
DISCADOR_WEBHOOK_SECRET=
```

**Exemplo encontrado na documentação:**
```
[Cole aqui um exemplo de webhook com o header]
```

---

## 4️⃣ Endpoint Click-to-Call

### Informações do Endpoint

**URL completa:**
```
Método: [ ] POST [ ] GET [ ] PUT
URL: _______________________

Exemplo completo:
POST http://pbx.fortics.com.br:8080/api/call/originate
```

**Headers necessários:**
```http
Content-Type: application/json
Authorization: Bearer {token}
[Outros headers...]
```

**Payload (Body):**
```json
{
  "phone_number": "11999999999",
  "extension": "8001",
  // Outros campos necessários...
}
```

**Resposta esperada:**
```json
{
  "call_id": "abc123",
  "status": "initiated"
  // Outros campos...
}
```

**Exemplo da documentação:**
```
[Cole aqui um exemplo completo da documentação]
```

---

## 5️⃣ Eventos de Webhook

### Eventos Disponíveis

**Lista de eventos que o Fortics envia:**

- [ ] call_started ou call.started
  - Quando dispara: ___________________
  
- [ ] call_answered ou call.answered
  - Quando dispara: ___________________
  
- [ ] call_ended ou call.ended
  - Quando dispara: ___________________
  
- [ ] call_failed ou call.failed
  - Quando dispara: ___________________
  
- [ ] Outro: ___________________
  - Quando dispara: ___________________

### Formato do Payload

**Exemplo de webhook enviado pela Fortics:**

```json
{
  // Cole aqui o exemplo EXATO da documentação
}
```

**Campos importantes:**
- `call_id`: Tipo: _____ | Obrigatório: [ ] Sim [ ] Não
- `phone_number`: Tipo: _____ | Obrigatório: [ ] Sim [ ] Não
- `timestamp`: Tipo: _____ | Obrigatório: [ ] Sim [ ] Não
- Outros: _____________________

---

## 6️⃣ Configuração de Webhook no Painel

### Passo a Passo

**Como configurar o webhook no painel da Fortics:**

1. _____________________
2. _____________________
3. _____________________

**URL que devo configurar no painel:**
```
Produção: https://projetocrmexata.vercel.app/api/calls/webhook
Desenvolvimento: http://localhost:3000/api/calls/webhook (usar ngrok)
```

**Campos do formulário de webhook:**
- URL: _____________________
- Secret/Token: _____________________
- Eventos selecionados: _____________________
- Outros campos: _____________________

---

## 7️⃣ Trechos Importantes da Documentação

### Screenshots ou Textos Copiados

**Seção de Autenticação:**
```
[Cole aqui]
```

**Seção de Webhooks:**
```
[Cole aqui]
```

**Seção de Click-to-Call:**
```
[Cole aqui]
```

**Exemplos de Código:**
```
[Cole aqui]
```

---

## 8️⃣ Informações Adicionais

### Limitações ou Requisitos Especiais

**Rate Limits:**
- Requisições por minuto: _____
- Requisições por hora: _____

**Restrições de IP:**
- [ ] Precisa liberar IP do servidor
- [ ] Precisa estar na mesma rede
- [ ] Sem restrições

**Outros requisitos:**
```
[Anote aqui qualquer outra informação importante]
```

---

## 9️⃣ Contatos de Suporte

**Pessoa de contato na Fortics:**
- Nome: _____________________
- Email: _____________________
- Telefone: _____________________
- Horário de atendimento: _____________________

---

## ✅ Checklist Final

Preenchi todas as informações:

- [ ] URL Base da API
- [ ] Formato de autenticação
- [ ] Como obter API Key
- [ ] Como obter Webhook Secret
- [ ] Endpoint de click-to-call completo
- [ ] Lista de eventos de webhook
- [ ] Formato do payload de webhook
- [ ] Como configurar webhook no painel
- [ ] Screenshots ou exemplos da documentação

---

## 📤 Enviar para o Desenvolvedor

Após preencher, envie:

1. Este arquivo preenchido
2. Screenshots da documentação (se possível)
3. Qualquer dúvida ou observação adicional

**Formato para envio rápido:**

```env
# Copie e cole estas linhas preenchidas:
DISCADOR_API_URL=
DISCADOR_API_KEY=
DISCADOR_WEBHOOK_SECRET=

# Informações adicionais:
# - Endpoint click-to-call: 
# - Formato autenticação: 
# - Nome header webhook: 
# - Eventos disponíveis: 
```

---

**Data de preenchimento:** ___/___/___  
**Preenchido por:** ___________________

