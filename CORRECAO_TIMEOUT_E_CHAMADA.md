# 🔧 Correção: Timeout e Chamada para Próprio Ramal

**Data:** 10 de novembro de 2025  
**Problemas Identificados e Corrigidos**

---

## 🐛 Problemas Identificados

### 1. Timeout de 10 segundos
- **Sintoma:** Frontend dando timeout após 10 segundos
- **Causa:** Chamadas podem demorar mais que 10 segundos para processar
- **Impacto:** Usuário vê erro mesmo quando a chamada está sendo processada

### 2. Chamada indo para o próprio ramal
- **Sintoma:** Ramal 1501 ligando para 85997185855, mas chamada chega no 3CXPhone do próprio 1501
- **Causa Possível:** 
  - Número de telefone pode precisar de formatação específica
  - API Fortics pode estar interpretando parâmetros incorretamente
  - Falta de validação/formatação do número

---

## ✅ Correções Aplicadas

### 1. Timeout Aumentado no Frontend

**Arquivo:** `frontend/src/services/api.ts`

**Mudança:**
```typescript
// ANTES
timeout: 10000, // 10 segundos

// DEPOIS
timeout: 30000, // 30 segundos (chamadas podem demorar)
```

**Motivo:** Chamadas podem demorar mais que 10 segundos para processar, especialmente se o Fortics estiver ocupado.

---

### 2. Timeout no Backend para API Fortics

**Arquivo:** `backend/src/services/fortics.ts`

**Mudança:**
- Adicionado `AbortController` com timeout de 25 segundos
- Melhor tratamento de erros de timeout
- Logs mais detalhados

**Código:**
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 25000);

const response = await fetch(fullUrl, {
  method: "GET",
  signal: controller.signal,
});
```

---

### 3. Formatação e Validação do Número de Telefone

**Arquivo:** `backend/src/routes/calls.ts`

**Mudanças:**
- **Limpeza do número:** Remove todos os caracteres não numéricos
- **Validação:** Verifica se tem pelo menos 10 dígitos
- **Logs detalhados:** Mostra número original e formatado

**Código:**
```typescript
// Limpar e formatar número de telefone
const phoneNumberClean = phone_number.replace(/\D/g, "");

// Verificar se o número tem pelo menos 10 dígitos
if (phoneNumberClean.length < 10) {
  return res.status(400).json({ 
    error: "Número de telefone inválido. Deve ter pelo menos 10 dígitos" 
  });
}
```

**Exemplo:**
- **Entrada:** `(85) 99718-5855` ou `85997185855`
- **Saída:** `85997185855` (apenas dígitos)

---

### 4. Logs Detalhados para Debug

**Adicionado em:**
- `backend/src/routes/calls.ts`
- `backend/src/services/fortics.ts`

**Logs incluem:**
- Número original e formatado
- URL completa da chamada Fortics
- Resposta completa do Fortics
- Erros detalhados com stack trace

**Exemplo de log:**
```
📞 Click-to-call recebido: { phone_number: '85997185855', ramal: '1501' }
📞 Número formatado: 85997185855 (original: 85997185855)
📞 Iniciando chamada via Fortics: Ramal 1501 → 85997185855
📞 Fortics: URL completa: http://192.168.1.10/lispbx/lisintegra.php?gacao=discar&...
✅ Fortics: Resposta completa: { success: true, id: '...', msg: '...' }
```

---

### 5. Tratamento de Erros Melhorado

**Mudanças:**
- Erros do Fortics são capturados separadamente
- Mensagens de erro mais específicas
- Stack trace em desenvolvimento
- Resposta do Fortics incluída em erros

---

## 🧪 Como Testar

### 1. Reiniciar Backend

```bash
cd backend
npm run dev
```

**Verifique nos logs:**
- ✅ Mensagens detalhadas sobre a chamada
- ✅ Número formatado corretamente
- ✅ URL completa da chamada Fortics
- ✅ Resposta do Fortics

---

### 2. Testar no Frontend

1. Acesse: `http://localhost:5173`
2. Faça login
3. Vá em "Clientes"
4. Clique em "Ligar"
5. Digite ramal: **1501**
6. Aguarde até 30 segundos (timeout aumentado)

**O que observar:**
- ✅ Não deve dar timeout antes de 30 segundos
- ✅ Logs detalhados no console do backend
- ✅ Mensagem de sucesso ou erro específico

---

### 3. Verificar Logs do Backend

**Procure por:**
```
📞 Click-to-call recebido: { phone_number: '...', ramal: '1501' }
📞 Número formatado: 85997185855
📞 Fortics: URL completa: http://192.168.1.10/lispbx/lisintegra.php?...
✅ Fortics: Resposta completa: { ... }
```

---

## 🔍 Diagnóstico do Problema do Ramal

### Possíveis Causas

1. **Formato do número incorreto**
   - ✅ **CORRIGIDO:** Número agora é limpo e validado

2. **API Fortics interpretando errado**
   - Verificar logs da URL completa
   - Comparar com teste manual que funcionou

3. **Configuração do Fortics**
   - Pode precisar de prefixo (ex: `5585997185855` para internacional)
   - Pode precisar de código de área específico

4. **Roteamento interno do Fortics**
   - Verificar se há regra de roteamento que redireciona para ramal interno

---

## 📋 Próximos Passos

### Se o problema persistir:

1. **Verificar logs do backend:**
   - URL completa sendo chamada
   - Resposta do Fortics
   - Comparar com teste manual que funcionou

2. **Testar com número formatado diferente:**
   - Com código do país: `5585997185855`
   - Sem código do país: `85997185855`
   - Com DDD: `85997185855`

3. **Verificar configuração do Fortics:**
   - Regras de roteamento
   - Configuração de troncos
   - Logs do Fortics PBX

4. **Testar diretamente na API Fortics:**
   ```bash
   curl "http://192.168.1.10/lispbx/lisintegra.php?gacao=discar&gkey=lispbx@123&gsrc=1501&gdst=85997185855&gresponse=json"
   ```

---

## ✅ Checklist de Correções

- [x] Timeout aumentado no frontend (10s → 30s)
- [x] Timeout adicionado no backend (25s)
- [x] Formatação do número de telefone
- [x] Validação do número (mínimo 10 dígitos)
- [x] Logs detalhados adicionados
- [x] Tratamento de erros melhorado
- [x] Stack trace em desenvolvimento

---

## 🎯 Resultado Esperado

Após as correções:

1. **Timeout:** Não deve dar timeout antes de 30 segundos
2. **Logs:** Logs detalhados para debug
3. **Número:** Número formatado corretamente
4. **Erros:** Mensagens de erro mais específicas

**Se o problema do ramal persistir:**
- Verificar logs detalhados
- Comparar URL com teste manual
- Verificar configuração do Fortics

---

**🚀 TESTE AGORA: Reinicie o backend e teste novamente!**


