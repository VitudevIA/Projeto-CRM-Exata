# 🔍 Diagnóstico: Popup Não Aparece Mais

## 📋 Checklist de Verificação

### **1. Verificar Console do Navegador (F12)**

**Procure por:**
- ✅ `📋 Resposta do popup:` - Mostra o que o backend retornou
- ✅ `📋 Chamada ativa detectada:` - Mostra quando detecta chamada
- ✅ `📋 CallPopupWrapper state:` - Mostra o estado do componente
- ❌ Erros em vermelho
- ⚠️ Avisos em amarelo

**O que verificar:**
- Se há chamada ativa sendo detectada
- Se `hasActiveCall` está `true`
- Se `callData` tem dados
- Se há erros de API

---

### **2. Verificar Logs do Servidor**

**Procure por:**
- ✅ `📋 Buscando popup do agente:` - Login usado
- ✅ `📋 Resposta completa do Fortics popup:` - Resposta do Fortics
- ✅ `📋 Dados da chamada recebidos:` - Dados processados
- ❌ `📋 Nenhuma chamada ativa` - Quando não há chamada
- ❌ `Login nao cadastrado` - Erro de login

**O que verificar:**
- Se o Fortics está retornando dados
- Se o login do agente está correto
- Se há erros no backend

---

### **3. Verificar Estado do Polling**

**No console do navegador, execute:**
```javascript
// Verificar se o polling está ativo
// (Não há forma direta, mas os logs devem aparecer a cada 2 segundos)
```

**Verifique:**
- Se os logs aparecem a cada 2 segundos
- Se há requisições para `/api/calls/popup`

---

### **4. Verificar Configuração do Fortics**

**Verifique:**
- ✅ Login do agente está correto no banco (`fortics_login`)
- ✅ Agente está logado no Fortics
- ✅ Há uma campanha ativa no Fortics
- ✅ Há uma chamada sendo atendida no momento

---

## 🔧 Possíveis Causas

### **Causa 1: Login do Agente Incorreto**

**Sintoma:**
- Logs mostram: `"Login nao cadastrado - X"`
- Backend retorna `success: false`

**Solução:**
```sql
-- Verificar login configurado
SELECT email, fortics_login 
FROM users 
WHERE email = 'seu_email@exemplo.com';

-- Configurar login correto
UPDATE users 
SET fortics_login = 'SEU_LOGIN_FORTICS'
WHERE email = 'seu_email@exemplo.com';
```

---

### **Causa 2: Agente Não Está Logado no Fortics**

**Sintoma:**
- Fortics retorna `success: false`
- Mensagem: "Nenhuma chamada ativa"

**Solução:**
- Fazer login no Fortics (painel ou 3CXPhone)
- Verificar se está logado na fila correta

---

### **Causa 3: Não Há Chamada Ativa**

**Sintoma:**
- Fortics retorna `success: false`
- Mensagem: "Nenhuma chamada ativa no momento"

**Solução:**
- Iniciar uma campanha no Fortics
- Aguardar uma chamada ser atendida
- Verificar se há chamada ativa no painel do Fortics

---

### **Causa 4: Estado do Popup Bloqueado**

**Sintoma:**
- `hasActiveCall` está `false`
- `isTabulated` está `true` (bloqueando)

**Solução:**
- Recarregar a página (F5)
- Verificar se há chamada anterior não finalizada

---

### **Causa 5: Erro no Backend**

**Sintoma:**
- Erro 500 ou 404 no console
- Logs do servidor mostram erro

**Solução:**
- Verificar logs do servidor
- Verificar se o backend está rodando
- Verificar variáveis de ambiente

---

## 🧪 Teste Manual

### **1. Testar API Diretamente**

**No terminal (com backend rodando):**
```bash
curl -X GET "http://localhost:3000/api/calls/popup" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "x-tenant-id: SEU_TENANT_ID"
```

**Ou via Postman/Insomnia:**
- GET `http://localhost:3000/api/calls/popup`
- Headers:
  - `Authorization: Bearer SEU_TOKEN`
  - `x-tenant-id: SEU_TENANT_ID`

---

### **2. Verificar Resposta do Fortics**

**No console do servidor, procure por:**
```
📋 Fortics: Resposta completa do popup: {...}
```

**Verifique:**
- Se `success` é `true`
- Se `dados` tem conteúdo
- Se há mensagem de erro

---

## 📝 Informações Necessárias para Diagnóstico

**Por favor, forneça:**

1. **Console do Navegador (F12 > Console):**
   - Últimos logs (especialmente os que começam com `📋`)
   - Erros em vermelho
   - Avisos em amarelo

2. **Logs do Servidor:**
   - Últimas linhas do log do backend
   - Especialmente linhas com `📋` ou `❌`

3. **Estado Atual:**
   - Há uma campanha ativa no Fortics?
   - Há uma chamada sendo atendida agora?
   - O agente está logado no Fortics?

4. **Configuração:**
   - Qual é o `fortics_login` configurado no banco?
   - Qual é o login do agente no Fortics?

---

## 🔧 Solução Rápida (Tentativa)

### **1. Recarregar a Página**
- Pressione F5 para recarregar
- Isso reseta o estado do polling

### **2. Verificar Login do Fortics**
```sql
SELECT email, fortics_login 
FROM users 
WHERE email = 'seu_email@exemplo.com';
```

### **3. Reiniciar Backend**
```bash
# Parar backend (Ctrl+C)
cd backend
npm run dev
```

### **4. Verificar Fortics**
- Fazer login no Fortics
- Iniciar uma campanha
- Aguardar uma chamada ser atendida

---

**📋 Envie os logs para diagnóstico preciso!**

