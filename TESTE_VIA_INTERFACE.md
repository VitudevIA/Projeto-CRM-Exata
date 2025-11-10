# 🖥️ Teste Via Interface do CRM

**Status:** ✅ Código atualizado e pronto para testar!

---

## 🚀 Passo a Passo

### 1️⃣ Iniciar Backend

**Terminal 1:**

```bash
cd backend
npm run dev
```

**Aguarde:** `Server running on port 3000`

---

### 2️⃣ Iniciar Frontend

**Terminal 2:**

```bash
cd frontend
npm run dev
```

**Aguarde:** `Local: http://localhost:5173`

---

### 3️⃣ Acessar o CRM

**Abra no navegador:**
```
http://localhost:5173
```

---

### 4️⃣ Fazer Login

- **Email:** victormatheuss669@gmail.com
- **Senha:** (sua senha)
- Clique em **"Entrar"**

---

### 5️⃣ Testar Click-to-Call

#### Opção A: Na Lista de Clientes

1. Vá em **"Clientes"** no menu lateral
2. Encontre um cliente na lista
3. Clique no botão **"Ligar"** (ícone de telefone)
4. Digite o ramal: **1501**
5. Clique em **"OK"**

#### Opção B: Na Página de Detalhes do Cliente

1. Vá em **"Clientes"** no menu lateral
2. Clique em um cliente para ver os detalhes
3. No topo da página, clique no botão **"Ligar"** (ícone de telefone)
4. No modal que abrir:
   - Verifique o telefone do cliente
   - Digite ou confirme o ramal: **1501**
   - Clique em **"Iniciar Chamada"**

---

## ✅ Resultado Esperado

### Sucesso:

**Aparecerá um alerta:**
```
Chamada iniciada com sucesso!
Ramal: 1501
Telefone: 85997185855
```

**No console do backend (Terminal 1), você verá:**
```
📞 Fortics: Iniciando chamada 1501 → 85997185855
✅ Fortics: Chamada iniciada { success: true, id: '...', ... }
```

**No painel Fortics:**
- O ramal 1501 receberá a chamada
- O número 85997185855 será discado

---

## 🔍 Verificar no CRM

### Histórico do Cliente

1. Após iniciar a chamada, vá na página de detalhes do cliente
2. Role até a seção **"Histórico de Interações"**
3. Você deve ver uma nova entrada:
   - Tipo: "Chamada realizada"
   - Data: Agora
   - Descrição: Informações da chamada

---

## ⚠️ Se Não Funcionar

### Erro: "Ramal é obrigatório"

**Causa:** Ramal não foi preenchido

**Solução:** Sempre preencha o ramal no modal

---

### Erro: "Erro ao iniciar chamada"

**Possíveis causas:**

1. **Ramal não está autenticado**
   - Verifique no painel Fortics se o ramal 1501 está logado
   - O ramal deve estar disponível

2. **Backend não está rodando**
   - Verifique Terminal 1
   - Deve aparecer "Server running on port 3000"

3. **Variáveis não configuradas**
   - Verifique `backend/.env`
   - Deve ter `DISCADOR_API_URL` e `DISCADOR_API_KEY`

---

### Erro: "Failed to fetch" ou "Network Error"

**Causa:** Backend não está acessível

**Solução:**
1. Verifique se o backend está rodando
2. Verifique se a URL está correta: `http://localhost:3000`
3. Verifique o console do navegador (F12) para mais detalhes

---

## 📊 Checklist de Teste

- [ ] Backend rodando (Terminal 1)
- [ ] Frontend rodando (Terminal 2)
- [ ] Login realizado no CRM
- [ ] Navegou até "Clientes"
- [ ] Clicou em "Ligar"
- [ ] Preencheu ramal: 1501
- [ ] Clicou em "Iniciar Chamada"
- [ ] Mensagem de sucesso apareceu
- [ ] Chamada iniciada no Fortics
- [ ] Histórico atualizado no CRM

---

## 🎯 Funcionalidades Implementadas

### ✅ Botão "Ligar" na Lista de Clientes
- Aparece ao lado de cada cliente
- Abre prompt para digitar ramal
- Inicia chamada diretamente

### ✅ Botão "Ligar" na Página de Detalhes
- Botão no topo da página
- Abre modal com informações
- Ramal padrão: 1501 (seu ramal)
- Pode editar antes de ligar

### ✅ Modal de Chamada
- Mostra nome do cliente
- Mostra telefone
- Campo para ramal (pré-preenchido com 1501)
- Botão "Iniciar Chamada"

---

## 🎉 Pronto para Testar!

**Siga os passos acima e teste a integração via interface!**

**Tempo estimado:** 2 minutos

---

**🚀 COMECE: Inicie backend e frontend, depois teste no navegador!**


