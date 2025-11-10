# 📋 Como e Onde o Popup Aparece no CRM

## 🎯 Onde o Popup Aparece

### **Localização:**
O popup aparece **em TODAS as telas do CRM** quando há uma chamada ativa.

**Telas onde aparece:**
- ✅ Dashboard
- ✅ Clientes
- ✅ Detalhes do Cliente
- ✅ Funil
- ✅ Tarefas
- ✅ Relatórios
- ✅ Importar
- ✅ Auditoria

**Características:**
- 🎯 **Modal centralizado** - Aparece no centro da tela
- 🎯 **Sobreposição** - Fica por cima de qualquer conteúdo
- 🎯 **Bloqueia interação** - Não permite clicar em nada até tabular
- 🎯 **Automático** - Abre sozinho quando detecta chamada

---

## 🎨 Como o Popup Aparece

### **Visual:**

```
┌─────────────────────────────────────────────────────────┐
│  [Fundo escuro semi-transparente - bloqueia tela]        │
│                                                           │
│              ┌─────────────────────────────────┐        │
│              │  [POPUP CENTRALIZADO]            │        │
│              │                                   │        │
│              │  ┌─────────────┬──────────────┐ │        │
│              │  │  INFORMAÇÕES│   TABS       │ │        │
│              │  │  DO CLIENTE │              │ │        │
│              │  │             │              │ │        │
│              │  │  Protocolo  │  Script      │ │        │
│              │  │  Nome       │  Abandonos   │ │        │
│              │  │  Número     │  Histórico   │ │        │
│              │  │  Código     │  Tabulação   │ │        │
│              │  │  Campos 1-5│  Agendamentos│ │        │
│              │  │  Fila/URA   │              │ │        │
│              │  │             │              │ │        │
│              │  │  [TABULAÇÃO]│              │ │        │
│              │  │  Dropdown   │              │ │        │
│              │  │  Observação │              │ │        │
│              │  │  Descrição  │              │ │        │
│              │  │  [Salvar]   │              │ │        │
│              │  └─────────────┴──────────────┘ │        │
│              └─────────────────────────────────┘        │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Aparição

### **1. Campanha Ativa no Fortics**
- Fortics disca números automaticamente
- Quando cliente atende, Fortics registra a chamada

### **2. Detecção Automática (a cada 2 segundos)**
- Sistema verifica se há chamada ativa
- Detecta via API do Fortics

### **3. Popup Abre Automaticamente**
- **Aparece no centro da tela**
- **Bloqueia toda a interface**
- **Não pode ser fechado sem tabular**

### **4. Operador Vê Informações**
- Dados do cliente (Protocolo, Nome, Número, etc.)
- Campos 1-5 (se preenchidos)
- Informações da chamada

### **5. Tabulação Obrigatória**
- Operador **DEVE** selecionar uma tabulação
- Pode preencher observação e descrição
- Clica em "Salvar"

### **6. Popup Fecha Automaticamente**
- Após salvar, popup fecha
- Sistema permite próxima chamada
- Processo se repete

---

## 📱 Exemplo Visual

**Quando você está na tela de Clientes:**

```
┌─────────────────────────────────────────────────┐
│  CRM Consignado                    [Menu] [User] │
├─────────────────────────────────────────────────┤
│  Dashboard | Clientes | Funil | ...             │
├─────────────────────────────────────────────────┤
│                                                  │
│  [FUNDO ESCURO]                                  │
│                                                  │
│        ┌──────────────────────────┐             │
│        │  📞 Chamada Ativa        │             │
│        │  Ramal: 1501        [X]  │             │
│        ├──────────────┬───────────┤             │
│        │ Protocolo:   │ Script    │             │
│        │ Nome: João   │ Abandonos │             │
│        │ Número:      │ Histórico │             │
│        │ 85997185855  │ Tabulação │             │
│        │              │ Agendam.  │             │
│        │ [Tabulação]  │           │             │
│        │ [Salvar]     │           │             │
│        └──────────────┴───────────┘             │
│                                                  │
└─────────────────────────────────────────────────┘
```

**O popup aparece por cima de TUDO, bloqueando a tela.**

---

## 🎯 Características do Popup

### **1. Tamanho e Posição**
- **Largura:** ~90% da largura da tela (máximo 6xl)
- **Altura:** ~90% da altura da tela
- **Posição:** Centralizado vertical e horizontalmente
- **Z-index:** 50 (muito alto, fica por cima de tudo)

### **2. Layout**
- **Painel Esquerdo (1/3):**
  - Informações do cliente
  - Seção de tabulação
  
- **Painel Direito (2/3):**
  - Tabs: Script, Abandonos, Histórico, Tabulação, Agendamentos
  - Área de conteúdo

### **3. Cores**
- **Header:** Azul (`bg-blue-600`)
- **Fundo:** Branco/Dark mode
- **Tabs:** Laranja (`bg-orange-500`)
- **Botão Salvar:** Verde

---

## 🚫 Bloqueio de Interface

**Quando o popup está aberto:**
- ❌ Não pode clicar em nada da tela
- ❌ Não pode navegar para outras páginas
- ❌ Não pode fechar sem tabular
- ❌ Não pode iniciar outra ação

**Só pode:**
- ✅ Ver informações do cliente
- ✅ Selecionar tabulação
- ✅ Preencher observação/descrição
- ✅ Salvar tabulação

---

## 📋 Informações Exibidas

### **Painel Esquerdo:**

1. **Protocolo:** ID único da chamada
2. **Nome:** Nome do cliente (se disponível)
3. **Número:** Telefone do cliente
4. **Código:** Código do cliente (se disponível)
5. **Campo 1-5:** Campos customizados (se preenchidos)
6. **Fila/URA:** Ramal e fila da chamada

### **Painel Direito:**

- **Tab Script:** Script da campanha (quando implementado)
- **Tab Abandonos:** Chamadas abandonadas (quando implementado)
- **Tab Histórico:** Histórico de chamadas (quando implementado)
- **Tab Tabulação:** Mesma seção do painel esquerdo
- **Tab Agendamentos:** Agendamentos futuros (quando implementado)

---

## ⚡ Quando Aparece

### **Condições:**
1. ✅ Usuário está logado no CRM
2. ✅ Há uma chamada ativa no Fortics
3. ✅ O agente está logado na fila do Fortics
4. ✅ A chamada foi atendida

### **Timing:**
- **Detecção:** A cada 2 segundos (polling automático)
- **Abertura:** Imediata quando detecta chamada
- **Fechamento:** Após salvar tabulação

---

## 🔧 Configuração Necessária

### **Para o Popup Funcionar:**

1. **Backend:**
   - ✅ Variáveis de ambiente configuradas
   - ✅ Fortics API acessível

2. **Frontend:**
   - ✅ Usuário logado
   - ✅ Polling ativo (automático)

3. **Fortics:**
   - ✅ Campanha ativa
   - ✅ Agente logado na fila
   - ✅ Chamada sendo atendida

---

## 📸 Exemplo Prático

**Cenário:**
1. Você está na tela de **Clientes**
2. Uma campanha está ativa no Fortics
3. Um cliente atende a chamada
4. **POPUP APARECE AUTOMATICAMENTE** no centro da tela
5. Você vê:
   - Protocolo: `20251110174159`
   - Nome: `João Silva`
   - Número: `85997185855`
   - Campos preenchidos
6. Você seleciona tabulação: `INTERESSADO`
7. Preenche observação: `Cliente interessado em consignado`
8. Clica em **Salvar**
9. Popup fecha automaticamente
10. Próxima chamada pode aparecer

---

## 🎯 Resumo

**Onde:** Em TODAS as telas do CRM (centralizado)

**Como:** Modal grande que bloqueia toda a interface

**Quando:** Automaticamente quando detecta chamada ativa

**O que mostra:** Informações do cliente e campos de tabulação

**Bloqueio:** Não pode fechar sem tabular

---

**✅ Após corrigir os erros, o popup aparecerá automaticamente quando houver uma chamada ativa!**

