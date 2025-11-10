# ⚡ COMECE AQUI - Teste Rápido

**Seus dados já configurados:**
- 📞 Telefone: **85997185855**
- 📱 Ramal: **1501**

---

## 🚀 TERMINAL 1: Iniciar Backend

**Copie e cole:**

```bash
cd backend && npm run dev
```

**Aguarde:** `Server running on port 3000`

**⚠️ Deixe este terminal aberto!**

---

## 🧪 TERMINAL 2: Testar (3 Comandos)

### 1. Login (substitua email e senha):

```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"SEU_EMAIL\",\"password\":\"SUA_SENHA\"}"
```

**Copie o `access_token` da resposta!**

---

### 2. Teste Click-to-Call (substitua SEU_TOKEN):

```bash
curl -X POST http://localhost:3000/api/calls/click-to-call -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN" -d "{\"phone_number\":\"85997185855\",\"ramal\":\"1501\"}"
```

---

## ✅ Se Aparecer Isso, Funcionou!

```json
{
  "success": true,
  "call_id": "4444",
  "message": "DISCANDO PARA 85997185855..."
}
```

---

## 🎯 Opção Mais Fácil: Script Automático

**Windows:**
```bash
cd backend
teste-rapido.bat
```

**Linux/Mac:**
```bash
cd backend
chmod +x teste-rapido.sh
./teste-rapido.sh
```

---

**🚀 COMECE: Terminal 1 primeiro!**


