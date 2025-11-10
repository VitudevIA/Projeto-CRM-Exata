# 🔧 Solução: Erro de Conexão no Teste

## ⚠️ Problema Identificado

**Erro:** `Failed to connect to localhost port 3000`

**Causa:** O servidor backend não está rodando

**Solução:** Iniciar o backend primeiro

---

## 🚀 SOLUÇÃO: 2 Terminais

### Terminal 1: Iniciar Backend

```bash
cd backend
npm run dev
```

**Deve aparecer:**
```
✅ Fortics API configurado
Server running on port 3000
```

**⚠️ IMPORTANTE:** Deixe este terminal aberto e rodando!

---

### Terminal 2: Testar (Depois que o Terminal 1 estiver rodando)

**Opção A: Comando Simples (Recomendado)**

```bash
curl -X POST http://localhost:3000/api/calls/click-to-call -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN_AQUI" -d "{\"phone_number\":\"11999999999\",\"ramal\":\"1000\"}"
```

**Opção B: Usando Arquivo JSON (Mais Fácil)**

1. Use o arquivo que criei: `backend/test-call.json`

2. Execute:
```bash
curl -X POST http://localhost:3000/api/calls/click-to-call -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN_AQUI" -d @test-call.json
```

**⚠️ IMPORTANTE:** Substitua `SEU_TOKEN_AQUI` pelo token JWT válido!

---

## 🔑 Como Obter o Token

### Opção 1: Via Login no CRM

1. Inicie o frontend:
```bash
cd frontend
npm run dev
```

2. Acesse: `http://localhost:5173`
3. Faça login
4. Abra o DevTools (F12)
5. Vá em: Application > Local Storage
6. Procure por `supabase.auth.token` ou similar
7. Copie o `access_token`

### Opção 2: Via API de Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"seu_email@example.com\",\"password\":\"sua_senha\"}"
```

**Resposta contém:**
```json
{
  "session": {
    "access_token": "eyJhbGc..."
  }
}
```

---

## ✅ Teste Completo (Passo a Passo)

### 1. Terminal 1: Backend

```bash
cd backend
npm run dev
```

**Aguarde aparecer:**
```
✅ Fortics API configurado
Server running on port 3000
```

### 2. Terminal 2: Obter Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"seu_email@example.com\",\"password\":\"sua_senha\"}"
```

**Copie o `access_token` da resposta**

### 3. Terminal 2: Testar Click-to-Call

```bash
curl -X POST http://localhost:3000/api/calls/click-to-call \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer COLE_O_TOKEN_AQUI" \
  -d "{\"phone_number\":\"11999999999\",\"ramal\":\"1000\"}"
```

---

## 📊 Resposta Esperada

### Sucesso:
```json
{
  "success": true,
  "call_id": "4444",
  "account_code": "1699999999999.abc123",
  "message": "DISCANDO PARA 11999999999...",
  "fortics_response": {
    "success": true,
    "id": "4444"
  }
}
```

### Erro (se ramal não estiver autenticado):
```json
{
  "error": "Erro ao iniciar chamada no Fortics"
}
```

---

## 🔍 Verificar Logs

**No Terminal 1 (backend), você deve ver:**

```
📞 Fortics: Iniciando chamada 1000 → 11999999999
✅ Fortics: Chamada iniciada { success: true, id: '4444', ... }
```

**Se houver erro:**
```
❌ Fortics: Erro ao iniciar chamada Error: ...
```

---

## ⚠️ Requisitos

Para funcionar:

1. ✅ Backend rodando em `http://localhost:3000`
2. ✅ Arquivo `.env` configurado com:
   ```env
   DISCADOR_API_URL=http://192.168.1.10
   DISCADOR_API_KEY=lispbx@123
   ```
3. ✅ Token de autenticação válido
4. ✅ Ramal autenticado no Fortics PBX (ex: "1000")
5. ✅ Rota de discagem configurada no Fortics

---

## 🆘 Troubleshooting

### Erro: "Failed to connect"

**Solução:** Inicie o backend primeiro (Terminal 1)

### Erro: "401 Unauthorized"

**Solução:** Use um token válido (faça login primeiro)

### Erro: "Fortics API não configurado"

**Solução:** Configure `backend/.env` e reinicie

### Erro: "Erro ao iniciar chamada no Fortics"

**Solução:**
- Verifique se o ramal está logado no Fortics
- Verifique se há rota para o número
- Teste a URL diretamente no navegador

---

## 📋 Checklist Rápido

- [ ] Backend rodando (Terminal 1)
- [ ] Mensagem "✅ Fortics API configurado" aparece
- [ ] Token obtido (via login)
- [ ] Teste executado (Terminal 2)
- [ ] Resposta recebida

---

**🚀 COMECE: Inicie o backend no Terminal 1 primeiro!**


