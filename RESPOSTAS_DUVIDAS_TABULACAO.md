# 📋 Respostas às Dúvidas sobre Tabulação

## ❓ Pergunta 1: Número já tabulado aparece novamente?

### **Resposta: SIM, aparece novamente!**

**Explicação:**

O sistema identifica chamadas pelo **protocolo** (accountCode do Fortics), não pelo número de telefone.

**Como funciona:**

1. **Cada chamada tem um protocolo único:**
   - Quando o Fortics disca um número, gera um `accountCode` único
   - Exemplo: `1762816235042`, `1762816270979`, etc.
   - Esse protocolo é usado para identificar a chamada

2. **Sistema verifica se a chamada ATUAL foi tabulada:**
   - Não verifica se o número já foi tabulado antes
   - Verifica apenas se a chamada atual (com aquele protocolo) foi tabulada

3. **Nova chamada = Novo protocolo:**
   - Se o mesmo número for discado novamente, será uma NOVA chamada
   - Terá um NOVO protocolo (accountCode diferente)
   - O popup aparecerá novamente para tabulação

**Exemplo:**

```
Chamada 1:
- Número: 85997185855
- Protocolo: 1762816235042
- Tabulação: "SEM POSSIBILIDADE"
- ✅ Tabulada

Chamada 2 (mesmo número, discado novamente):
- Número: 85997185855 (mesmo número)
- Protocolo: 1762816270979 (NOVO protocolo)
- Tabulação: (ainda não tabulada)
- ✅ Popup aparece novamente!
```

**Código relevante:**

```typescript
// frontend/src/hooks/useCallPolling.ts
const newCallId = response.data.data.protocolo; // Protocolo único da chamada

// Se é uma nova chamada (diferente da anterior), resetar tabulação
if (newCallId !== lastCallIdRef.current) {
  setIsTabulated(false); // Resetar estado de tabulação
  lastCallIdRef.current = newCallId;
}
```

---

## ❓ Pergunta 2: Tabulação é salva no Fortics ou só no CRM?

### **Resposta: Apenas no CRM (Supabase)!**

**Explicação:**

A tabulação é salva **APENAS** no banco de dados do CRM (Supabase), **NÃO** no banco do Fortics.

**Onde é salva:**

1. **Tabela `call_logs` no Supabase:**
   - Campo `tabulation` (ex: "SEM POSSIBILIDADE")
   - Campo `notes` (observação + descrição)
   - Campo `client_id` (se tiver cliente associado)

2. **Tabela `client_history` no Supabase:**
   - Histórico da interação com o cliente
   - Inclui metadata com a tabulação

**Onde NÃO é salva:**

- ❌ Banco de dados do Fortics
- ❌ API do Fortics não tem endpoint para salvar tabulação
- ❌ Fortics não recebe informações de tabulação do CRM

**Código relevante:**

```typescript
// backend/src/routes/calls.ts
// Rota POST /calls - Criar novo call_log
const { data: callLog, error } = await supabaseAdmin
  .from("call_logs") // ← Apenas Supabase
  .insert({
    tabulation: tabulation || null,
    notes: notes || null,
    // ...
  });

// Rota PUT /:id/tabulation - Atualizar call_log
const { data, error } = await supabaseAdmin
  .from("call_logs") // ← Apenas Supabase
  .update({
    tabulation,
    notes,
    // ...
  });
```

**Por que não salva no Fortics?**

1. **API do Fortics não tem endpoint para tabulação:**
   - A documentação do Fortics não menciona endpoint para salvar tabulação
   - Apenas tem endpoints para:
     - Buscar popup (dados da chamada)
     - Iniciar chamadas (click-to-call)
     - Login/logout de agentes
     - Pausar/despausar agentes
     - Consultar status de chamada

2. **Arquitetura separada:**
   - Fortics gerencia chamadas (discagem, filas, agentes)
   - CRM gerencia relacionamento com clientes (tabulação, histórico, funil)

3. **Vantagens:**
   - CRM tem controle total sobre a tabulação
   - Pode criar relatórios e análises próprias
   - Não depende do Fortics para consultar histórico

---

## 📊 Resumo

### **Pergunta 1: Número já tabulado aparece novamente?**

✅ **SIM!**
- Cada chamada tem um protocolo único
- Sistema verifica apenas se a chamada ATUAL foi tabulada
- Se o mesmo número for discado novamente, será uma NOVA chamada
- Popup aparecerá novamente para tabulação

**Motivo:** Cada chamada é independente, mesmo que seja o mesmo número.

---

### **Pergunta 2: Tabulação é salva no Fortics ou só no CRM?**

✅ **Apenas no CRM (Supabase)!**
- Salva na tabela `call_logs` do Supabase
- Salva no histórico do cliente (`client_history`)
- **NÃO** salva no banco do Fortics
- **NÃO** envia para API do Fortics

**Motivo:** API do Fortics não tem endpoint para salvar tabulação, e a arquitetura é separada.

---

## 🔍 Como Verificar

### **1. Verificar se número aparece novamente:**

1. Tabule uma chamada
2. Peça para o Fortics discar o mesmo número novamente
3. O popup deve aparecer novamente
4. Cada chamada terá um protocolo diferente

### **2. Verificar onde a tabulação é salva:**

**No Supabase:**
```sql
-- Verificar call_logs
SELECT id, phone_number, tabulation, notes, created_at
FROM call_logs
WHERE phone_number = '85997185855'
ORDER BY created_at DESC;

-- Verificar histórico do cliente
SELECT * FROM client_history
WHERE client_id = 'uuid-do-cliente'
ORDER BY created_at DESC;
```

**No Fortics:**
- Acesse o painel do Fortics
- Vá em **Callcenter > Relatórios** ou **CDR**
- A tabulação do CRM **NÃO** aparecerá lá
- Apenas dados da chamada (duração, status, gravação)

---

## 💡 Considerações

### **Sobre aparecer novamente:**

**Vantagem:**
- Permite recontato com clientes
- Cada interação é registrada separadamente
- Histórico completo de todas as chamadas

**Desvantagem:**
- Pode ser repetitivo se o número for discado muitas vezes
- Não há bloqueio automático de números já tabulados

**Solução futura (opcional):**
- Adicionar lógica para verificar última tabulação do número
- Mostrar aviso se número foi tabulado recentemente
- Permitir configurar regras de recontato

---

### **Sobre salvar apenas no CRM:**

**Vantagem:**
- Controle total sobre os dados
- Relatórios e análises próprias
- Não depende do Fortics
- Histórico completo no CRM

**Desvantagem:**
- Fortics não tem acesso à tabulação
- Relatórios do Fortics não incluem tabulação do CRM
- Dados ficam separados

**Solução futura (opcional):**
- Se o Fortics tiver API para salvar tabulação, integrar
- Criar webhook para enviar tabulação ao Fortics
- Sincronizar dados entre sistemas

---

## ✅ Conclusão

1. **Número pode aparecer novamente:** ✅ SIM
   - Cada chamada é independente
   - Identificada pelo protocolo único
   - Não há bloqueio por número

2. **Tabulação salva apenas no CRM:** ✅ SIM
   - Apenas no Supabase (tabela `call_logs`)
   - Não salva no Fortics
   - API do Fortics não suporta salvar tabulação

---

**📝 Essas são as respostas às suas dúvidas!**

