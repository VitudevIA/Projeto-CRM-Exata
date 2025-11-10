# ⚠️ Problema e Solução

## 🔴 PROBLEMA IDENTIFICADO

**Erro no seu teste:**
```
curl: (7) Failed to connect to localhost port 3000
```

**Causa:** O servidor backend **NÃO está rodando**

---

## ✅ SOLUÇÃO: 2 Terminais

### Terminal 1: Iniciar Backend (PRIMEIRO!)

```bash
cd backend
npm run dev
```

**Aguarde aparecer:**
```
✅ Fortics API configurado
Server running on port 3000
```

**⚠️ IMPORTANTE:** Deixe este terminal aberto e rodando!

---

### Terminal 2: Testar (DEPOIS que o Terminal 1 estiver rodando)

**Opção A: Comando Simples**
```bash
curl -X POST http://localhost:3000/api/calls/click-to-call -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN" -d "{\"phone_number\":\"11999999999\",\"ramal\":\"1000\"}"
```

**Opção B: Usando Arquivo JSON (Mais Fácil)**
```bash
cd backend
curl -X POST http://localhost:3000/api/calls/click-to-call -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN" -d @test-call.json
```

**Opção C: Script Automático**
```bash
cd backend
# 1. Edite test-click-to-call.js e coloque seu token
# 2. Execute:
node test-click-to-call.js
```

---

## 🔑 Como Obter o Token

### Via Login:

```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"seu_email@example.com\",\"password\":\"sua_senha\"}"
```

**Copie o `access_token` da resposta e use no teste**

---

## 📋 Sequência Correta

1. ✅ **Terminal 1:** `cd backend && npm run dev` (aguarde aparecer "Server running")
2. ✅ **Terminal 2:** Obter token (login)
3. ✅ **Terminal 2:** Testar click-to-call

---

## 🆘 Se Ainda Não Funcionar

### Verificar se Backend Está Rodando:

```bash
curl http://localhost:3000/health
```

**Deve retornar:**
```json
{"status":"ok"}
```

**Se não retornar:** Backend não está rodando!

---

## 📚 Documentos de Ajuda

- **`SOLUCAO_ERRO_CONEXAO.md`** - Solução detalhada
- **`COMANDOS_TESTE_WINDOWS.md`** - Comandos para Windows
- **`INICIAR_BACKEND_E_TESTAR.md`** - Guia completo

---

**🚀 AÇÃO IMEDIATA: Inicie o backend no Terminal 1 primeiro!**


