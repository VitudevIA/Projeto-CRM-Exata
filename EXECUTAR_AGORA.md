# ⚡ EXECUTAR AGORA - Comandos Prontos

**Seus dados:**
- 📞 Telefone: **85997185855**
- 📱 Ramal: **1501**

---

## 🚀 TERMINAL 1: Iniciar Backend

**Copie e cole:**

```bash
cd backend && npm run dev
```

**Aguarde aparecer:** `✅ Fortics API configurado` e `Server running on port 3000`

**⚠️ Deixe este terminal aberto!**

---

## 🔑 TERMINAL 2: Obter Token

**Copie e cole (substitua SEU_EMAIL e SUA_SENHA):**

```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"SEU_EMAIL\",\"password\":\"SUA_SENHA\"}"
```

**Exemplo real:**
```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"SuaSenha123\"}"
```

**📋 Copie o `access_token` da resposta!**

---

## 🧪 TERMINAL 2: Testar Click-to-Call

**Copie e cole (substitua SEU_TOKEN pelo token copiado acima):**

```bash
curl -X POST http://localhost:3000/api/calls/click-to-call -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN" -d "{\"phone_number\":\"85997185855\",\"ramal\":\"1501\"}"
```

---

## ✅ Resposta Esperada

**Se funcionou, você verá:**

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

## 🎯 Opção Alternativa: Usar Arquivo JSON

**Se o comando acima não funcionar, use:**

```bash
cd backend
curl -X POST http://localhost:3000/api/calls/click-to-call -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN" -d @test-call.json
```

**O arquivo `test-call.json` já está configurado com seus dados!**

---

## 🔍 Verificar Logs

**No Terminal 1 (backend), você deve ver:**

```
📞 Fortics: Iniciando chamada 1501 → 85997185855
✅ Fortics: Chamada iniciada
```

---

## ⚠️ Se Não Funcionar

### Erro: "Failed to connect"
→ Backend não está rodando. Execute o Terminal 1 primeiro!

### Erro: "401 Unauthorized"
→ Token inválido. Faça login novamente (Terminal 2, Passo 2)

### Erro: "Erro ao iniciar chamada no Fortics"
→ Verifique se:
- Ramal 1501 está logado no Fortics
- Há rota configurada para o número 85997185855

---

**🚀 COMECE: Terminal 1 primeiro, depois Terminal 2!**


