# 🪟 Comandos de Teste para Windows

## ⚠️ Problema no Comando curl

O comando curl no Windows/Git Bash pode ter problemas com JSON multilinha.

**Solução:** Use comandos adaptados para Windows

---

## 🚀 Passo 1: Iniciar Backend

**Terminal 1 (Git Bash ou PowerShell):**

```bash
cd backend
npm run dev
```

**Aguarde aparecer:**
```
✅ Fortics API configurado
Server running on port 3000
```

---

## 🧪 Passo 2: Testar (3 Opções)

### Opção A: Comando Simples (Uma Linha)

**Git Bash:**
```bash
curl -X POST http://localhost:3000/api/calls/click-to-call -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN" -d "{\"phone_number\":\"11999999999\",\"ramal\":\"1000\"}"
```

**PowerShell:**
```powershell
$body = '{"phone_number":"11999999999","ramal":"1000"}'; Invoke-RestMethod -Uri "http://localhost:3000/api/calls/click-to-call" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer SEU_TOKEN"} -Body $body
```

---

### Opção B: Usando Arquivo JSON (Recomendado)

**1. Use o arquivo:** `backend/test-call.json`

**2. Git Bash:**
```bash
curl -X POST http://localhost:3000/api/calls/click-to-call -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN" -d @test-call.json
```

**3. PowerShell:**
```powershell
$body = Get-Content backend/test-call.json -Raw; Invoke-RestMethod -Uri "http://localhost:3000/api/calls/click-to-call" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer SEU_TOKEN"} -Body $body
```

---

### Opção C: Via Postman ou Insomnia

**1. Método:** POST  
**2. URL:** `http://localhost:3000/api/calls/click-to-call`  
**3. Headers:**
```
Content-Type: application/json
Authorization: Bearer SEU_TOKEN
```
**4. Body (JSON):**
```json
{
  "phone_number": "11999999999",
  "ramal": "1000"
}
```

---

## 🔑 Como Obter o Token

### Via Login API:

**Git Bash:**
```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"seu_email@example.com\",\"password\":\"sua_senha\"}"
```

**PowerShell:**
```powershell
$login = '{"email":"seu_email@example.com","password":"sua_senha"}'; $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $login; $response.session.access_token
```

**Copie o `access_token` da resposta**

---

## ✅ Teste Completo (Sequência)

### 1. Terminal 1: Backend
```bash
cd backend
npm run dev
```

### 2. Terminal 2: Login e Obter Token
```bash
# Git Bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"seu_email@example.com\",\"password\":\"sua_senha\"}"

# Copie o access_token da resposta
```

### 3. Terminal 2: Testar Click-to-Call
```bash
# Git Bash (substitua SEU_TOKEN pelo token copiado)
curl -X POST http://localhost:3000/api/calls/click-to-call -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN" -d @test-call.json
```

---

## 📊 Resposta Esperada

**Sucesso:**
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

---

## 🆘 Se Ainda Não Funcionar

### Verificar se Backend Está Rodando

**Teste simples:**
```bash
curl http://localhost:3000/health
```

**Deve retornar:**
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

**Se não retornar:** Backend não está rodando!

---

### Verificar Variáveis de Ambiente

**No Terminal 1 (onde o backend está rodando), deve aparecer:**
```
✅ Fortics API configurado
```

**Se aparecer:**
```
⚠️  Fortics API não configurado
```

**Solução:** Configure `backend/.env` e reinicie

---

## 📋 Checklist

- [ ] Backend rodando (Terminal 1)
- [ ] Mensagem "✅ Fortics API configurado"
- [ ] Token obtido (via login)
- [ ] Teste executado (Terminal 2)
- [ ] Resposta recebida

---

**🚀 COMECE: Terminal 1 primeiro, depois Terminal 2!**


