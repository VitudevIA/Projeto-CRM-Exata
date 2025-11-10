# 📋 COMANDOS PRONTOS - Copiar e Colar

**Seus dados:**
- 📞 Telefone: **85997185855**
- 📱 Ramal: **1501**

---

## ⚡ TESTE RÁPIDO (3 Comandos)

### 1️⃣ Iniciar Backend

**Terminal 1 - Copie e cole:**

```bash
cd backend && npm run dev
```

**Aguarde aparecer:** `Server running on port 3000`

---

### 2️⃣ Obter Token

**Terminal 2 - Copie e cole (substitua email e senha):**

```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"SEU_EMAIL\",\"password\":\"SUA_SENHA\"}"
```

**Copie o `access_token` da resposta!**

---

### 3️⃣ Testar Click-to-Call

**Terminal 2 - Copie e cole (substitua SEU_TOKEN):**

```bash
curl -X POST http://localhost:3000/api/calls/click-to-call -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN" -d "{\"phone_number\":\"85997185855\",\"ramal\":\"1501\"}"
```

---

## 🎯 COMANDO ÚNICO (Se Já Tem Token)

**Substitua SEU_TOKEN e execute:**

```bash
curl -X POST http://localhost:3000/api/calls/click-to-call -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN" -d "{\"phone_number\":\"85997185855\",\"ramal\":\"1501\"}"
```

---

## 📊 Resposta Esperada

**Sucesso:**
```json
{
  "success": true,
  "call_id": "4444",
  "account_code": "1699999999999.abc123",
  "message": "DISCANDO PARA 85997185855...",
  "fortics_response": {
    "success": true,
    "id": "4444"
  }
}
```

---

## ✅ Checklist

- [ ] Terminal 1: Backend rodando
- [ ] Terminal 2: Token obtido
- [ ] Terminal 2: Teste executado
- [ ] Resposta de sucesso recebida

---

**🚀 PRONTO! Copie e cole os comandos acima!**


