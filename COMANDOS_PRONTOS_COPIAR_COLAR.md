# 📋 Comandos Prontos - Copiar e Colar

**Telefone:** 85997185855  
**Ramal:** 1501

---

## 🚀 PASSO 1: Iniciar Backend

**Copie e cole no Terminal 1:**

```bash
cd backend && npm run dev
```

**Aguarde aparecer:**
```
✅ Fortics API configurado
Server running on port 3000
```

**⚠️ Deixe este terminal aberto e rodando!**

---

## 🔑 PASSO 2: Obter Token (Login)

**Copie e cole no Terminal 2 (substitua email e senha):**

```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"SEU_EMAIL_AQUI\",\"password\":\"SUA_SENHA_AQUI\"}"
```

**Exemplo:**
```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"SuaSenha123\"}"
```

**Copie o `access_token` da resposta!**

---

## 🧪 PASSO 3: Testar Click-to-Call

### Opção A: Comando Simples (Uma Linha)

**Copie e cole (substitua SEU_TOKEN pelo token obtido no Passo 2):**

```bash
curl -X POST http://localhost:3000/api/calls/click-to-call -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN" -d "{\"phone_number\":\"85997185855\",\"ramal\":\"1501\"}"
```

---

### Opção B: Usando Arquivo JSON (Recomendado)

**1. Certifique-se de estar na pasta backend:**
```bash
cd backend
```

**2. Copie e cole (substitua SEU_TOKEN):**
```bash
curl -X POST http://localhost:3000/api/calls/click-to-call -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN" -d @test-call.json
```

---

### Opção C: Script Automático

**1. Edite o arquivo `backend/test-click-to-call.js`**

**2. Na linha 18, substitua:**
```javascript
let AUTH_TOKEN = 'SEU_TOKEN_AQUI';
```

**Por:**
```javascript
let AUTH_TOKEN = 'COLE_SEU_TOKEN_AQUI';
```

**3. Execute:**
```bash
cd backend
node test-click-to-call.js
```

---

## 📊 Resposta Esperada (Sucesso)

```json
{
  "success": true,
  "call_id": "4444",
  "account_code": "1699999999999.abc123",
  "call_log_id": "uuid-do-log",
  "message": "DISCANDO PARA 85997185855...",
  "fortics_response": {
    "success": true,
    "retorno": "DISCANDO PARA 85997185855 SIP/1501...",
    "msg": "DISCANDO PARA 85997185855...",
    "id": "4444"
  }
}
```

---

## ⚠️ Requisitos

Para funcionar:

1. ✅ Backend rodando (Terminal 1)
2. ✅ Token válido (obtido no Passo 2)
3. ✅ Ramal 1501 autenticado no Fortics PBX
4. ✅ Rota de discagem configurada para o número 85997185855

---

## 🆘 Se Não Funcionar

### Erro: "Failed to connect"
**Solução:** Inicie o backend primeiro (Passo 1)

### Erro: "401 Unauthorized"
**Solução:** Use um token válido (faça login no Passo 2)

### Erro: "Ramal é obrigatório"
**Solução:** O comando já inclui o ramal. Verifique se copiou corretamente.

### Erro: "Erro ao iniciar chamada no Fortics"
**Solução:**
- Verifique se o ramal 1501 está logado no Fortics
- Verifique se há rota para o número 85997185855
- Teste a URL diretamente no navegador:
  ```
  http://192.168.1.10/lispbx/lisintegra.php?gacao=discar&gkey=lispbx@123&gsrc=1501&gdst=85997185855&gresponse=json
  ```

---

## ✅ Checklist

- [ ] Terminal 1: Backend rodando
- [ ] Terminal 2: Token obtido (Passo 2)
- [ ] Terminal 2: Teste executado (Passo 3)
- [ ] Resposta recebida
- [ ] Chamada iniciada no Fortics

---

**🚀 COMECE: Terminal 1 primeiro, depois Terminal 2!**


