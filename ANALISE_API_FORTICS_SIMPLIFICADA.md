# 📘 API Fortics BPX - Explicação Simples

## 🎯 O Que É Esta API?

A API do Fortics BPX é uma forma de **fazer seu CRM conversar com o discador** da Fortics através da internet. É como se fosse uma "ponte" que permite:

- **Iniciar chamadas** do CRM (click-to-call)
- **Consultar status** de chamadas
- **Gerenciar agentes** (login, pausa, logout)
- **Baixar gravações** de chamadas
- **Importar contatos** para o discador

---

## 🔑 As 3 Informações Importantes

### 1. **DISCADOR_API_URL** (URL Base)

**O que é:** O endereço do servidor Fortics  
**Onde está na documentação:** Aparece como `{{ base_url }}`  
**Exemplo:** `http://pbx.fortics.com.br` ou `http://seu-servidor-fortics.com`

**Como descobrir o seu:**
- Entre em contato com a Fortics
- Ou verifique no painel administrativo do Fortics PBX

**Valor padrão encontrado:**
```
{{ base_url }}
```

---

### 2. **DISCADOR_API_KEY** (Chave de Integração)

**O que é:** Uma senha que identifica o seu CRM na API  
**Onde está na documentação:** Aparece como `{{ chave_integracao }}` ou `gkey` ou `key`  
**Como encontrar:**
1. Acesse o painel administrativo do Fortics PBX
2. Vá em: **PBX > Cadastro > Serviços > Discagem Rápida**
3. Copie a "Chave de integração"

**Exemplo:**
```
gkey=abc123xyz456
```

---

### 3. **DISCADOR_WEBHOOK_SECRET** ⚠️ **NÃO EXISTE NESTA API**

**Descoberta importante:** A API Fortics **NÃO usa webhooks** no modelo tradicional!

**Como funciona:**
- ❌ **Não é:** O discador envia notificações automaticamente para o CRM
- ✅ **É:** O CRM precisa **consultar** o discador para saber o que aconteceu

**O que fazer:**
- Não precisamos do `DISCADOR_WEBHOOK_SECRET`
- Usaremos **polling** (consultas periódicas) para verificar status

---

## 📊 Como a API Funciona (Explicação Simples)

### Modelo de Comunicação

```
CRM (Você)  →  Requisição  →  Fortics PBX
CRM (Você)  ←  Resposta    ←  Fortics PBX
```

**Exemplo prático:**
1. **Você quer iniciar uma chamada**
   - CRM envia: "Olá Fortics, ligue do ramal 1000 para o número 11999999999"
   - Fortics responde: "Ok, chamada iniciada! ID: 4444"

2. **Você quer saber o resultado**
   - CRM envia: "Olá Fortics, qual o status da chamada ID 4444?"
   - Fortics responde: "A chamada foi atendida e durou 120 segundos"

---

## 🔧 Principais Funcionalidades da API

### 1. Click-to-Call (Iniciar Chamada)

**O que faz:** Inicia uma chamada do discador

**Como usar:**
```http
GET {{ base_url }}/lisintegra.php?gacao=discar&gkey={{ chave }}&gsrc=1000&gdst=11999999999&gresponse=json
```

**Parâmetros:**
- `gacao=discar` - Ação que queremos (discar)
- `gkey` - Sua chave de integração
- `gsrc` - Ramal de origem (ex: 1000)
- `gdst` - Número de destino (ex: 11999999999)
- `gresponse=json` - Formato da resposta

**Resposta:**
```json
{
  "success": true,
  "retorno": "DISCANDO PARA 11999999999...",
  "id": "4444"
}
```

---

### 2. Consultar Status da Chamada

**O que faz:** Verifica o que aconteceu com uma chamada

**Como usar:**
```http
GET {{ base_url }}/lisintegra.php?gacao=statuscdr&gkey={{ chave }}&gaccountcode=4444&gcdrtipo=text
```

**Parâmetros:**
- `gacao=statuscdr` - Ação de consultar status
- `gaccountcode` - ID da chamada (retornado no click-to-call)

---

### 3. Popup (Dados da Última Chamada)

**O que faz:** Busca informações da última chamada de um agente

**Como usar:**
```http
GET {{ base_url }}/forticsApi.php?acao=popup&key={{ chave }}&login=agente01
```

**Resposta:**
```json
{
  "success": true,
  "dados": {
    "nome": "agente01",
    "numero": "11999999999",
    "gravacao": "20200416-161553-IN-...",
    "status": "1",
    "status_descricao": "Atendido"
  }
}
```

---

### 4. Download de Gravação

**O que faz:** Baixa o arquivo de áudio da gravação

**Como usar:**
```http
GET {{ base_url }}/lisintegra.php?gacao=download&gkey={{ chave }}&gaccountcode=4444
```

**Retorna:** Arquivo de áudio (WAV)

---

## 🎓 Glossário (Tradução dos Termos)

| Termo na API | O que significa |
|--------------|-----------------|
| `gacao` | Ação que você quer fazer (discar, logar, pausar, etc.) |
| `gkey` ou `key` | Sua chave de integração (senha) |
| `gsrc` | Ramal de origem (quem liga) |
| `gdst` | Número de destino (para quem liga) |
| `gramal` | Número do ramal |
| `gagente` | Nome/login do agente |
| `gfila` | Número da fila de atendimento |
| `gresponse` | Formato da resposta (json ou text) |
| `gaccountcode` | ID único da chamada |
| `gpausa` | Nome da pausa (ex: BANHEIRO, REUNIAO) |

---

## 📋 Endpoints Importantes

### URL Base Padrão
```
{{ base_url }}/lisintegra.php
{{ base_url }}/forticsApi.php
{{ base_url }}/lispbx/lisintegra.php
```

### Ações Disponíveis (parâmetro `gacao`)

| Ação | O que faz |
|------|-----------|
| `discar` | Inicia chamada (click-to-call) |
| `statuscdr` | Consulta status de chamada |
| `logar` | Faz login de agente na fila |
| `deslogar` | Faz logout de agente |
| `pausar` | Pausa agente |
| `despausar` | Despausa agente |
| `agendamento` | Agenda chamada futura |
| `download` | Baixa gravação |
| `importarDiscador` | Importa lista de contatos |
| `statusDiscador` | Consulta status de discagens |

---

## ⚠️ Diferenças do Que Planejamos

### O Que Planejamos Inicialmente
```
Fortics → Envia notificação automática → CRM
```

### O Que Realmente É
```
CRM → Consulta periodicamente → Fortics
```

**O que isso significa:**
- O CRM precisa "perguntar" ao Fortics o que aconteceu
- Não há webhooks automáticos
- Precisamos usar **polling** (consultas a cada X segundos)

---

## 🔄 Como Integrar (Passo a Passo)

### Passo 1: Obter as Credenciais

**O que você precisa:**
1. **URL do servidor Fortics** ({{ base_url }})
   - Entre em contato com a Fortics
   - Exemplo: `http://pbx.fortics.com.br`

2. **Chave de integração** ({{ chave_integracao }})
   - Acesse: PBX > Cadastro > Serviços > Discagem Rápida
   - Copie a chave

**Não precisa:**
- ❌ Webhook secret (não existe nesta API)

---

### Passo 2: Configurar no Código

Editar `backend/.env`:
```env
DISCADOR_API_URL=http://pbx.fortics.com.br
DISCADOR_API_KEY=abc123xyz456789
```

---

### Passo 3: Testar Click-to-Call

**Teste manual com curl:**
```bash
curl "http://pbx.fortics.com.br/lisintegra.php?gacao=discar&gkey=abc123&gsrc=1000&gdst=11999999999&gresponse=json"
```

**Resposta esperada:**
```json
{
  "success": true,
  "id": "4444"
}
```

---

## 🆘 Perguntas Frequentes

### ❓ Onde encontro a URL base?
**R:** Entre em contato com a Fortics ou verifique no painel administrativo.

### ❓ Onde encontro a chave de integração?
**R:** PBX > Cadastro > Serviços > Discagem Rápida

### ❓ A API envia webhooks automaticamente?
**R:** Não. Você precisa consultar periodicamente (polling).

### ❓ Preciso de senha/login?
**R:** Não. Só a chave de integração (`gkey`) já é suficiente.

### ❓ Como saber se uma chamada foi atendida?
**R:** Use `gacao=statuscdr` com o `gaccountcode` da chamada.

### ❓ Posso baixar as gravações?
**R:** Sim! Use `gacao=download` com o `gaccountcode`.

---

## 📊 Resumo Visual

```
┌─────────────────────────────────────────┐
│  VOCÊ PRECISA:                          │
├─────────────────────────────────────────┤
│  1. DISCADOR_API_URL                    │
│     └─ Ex: http://pbx.fortics.com.br    │
│                                         │
│  2. DISCADOR_API_KEY                    │
│     └─ Ex: abc123xyz456789              │
│     └─ Onde: PBX > Serviços > Discagem  │
│                                         │
│  3. WEBHOOK SECRET                      │
│     └─ ❌ NÃO EXISTE (usar polling)     │
└─────────────────────────────────────────┘
```

---

## 🎯 Próximos Passos

1. **Entre em contato com a Fortics**
   - Solicite a URL do servidor
   - Confirme se tem acesso ao painel administrativo

2. **Acesse o painel Fortics PBX**
   - Vá em: PBX > Cadastro > Serviços > Discagem Rápida
   - Copie a chave de integração

3. **Me envie:**
```
DISCADOR_API_URL=cole_aqui
DISCADOR_API_KEY=cole_aqui
```

4. **Eu adapto o código** para funcionar com esta API

---

**Tempo estimado:** 30 minutos para obter as credenciais  
**Dificuldade:** 🟢 Fácil (só precisa acessar o painel e copiar)

**Pronto para começar?** 🚀

