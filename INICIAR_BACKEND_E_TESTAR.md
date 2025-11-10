# 🚀 Iniciar Backend e Testar

## ⚠️ Problema Identificado

**Erro:** `Failed to connect to localhost port 3000`

**Causa:** Backend não está rodando

**Solução:** Iniciar o servidor backend primeiro

---

## 📝 PASSO 1: Verificar Configuração

### Verificar se .env existe e está configurado

```bash
cd backend
cat .env | grep DISCADOR
```

**Deve aparecer:**
```
DISCADOR_API_URL=http://192.168.1.10
DISCADOR_API_KEY=lispbx@123
```

**Se não aparecer:**
1. Crie/edite `backend/.env`
2. Adicione as 2 linhas acima

---

## 🚀 PASSO 2: Iniciar Backend

### Terminal 1: Backend

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

## 🧪 PASSO 3: Testar (Em Outro Terminal)

### Terminal 2: Teste

**Opção A: Comando Simples (Windows/Git Bash)**

```bash
curl -X POST http://localhost:3000/api/calls/click-to-call -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN" -d "{\"phone_number\":\"11999999999\",\"ramal\":\"1000\"}"
```

**Opção B: Usando Arquivo JSON**

1. Crie arquivo `test-call.json`:
```json
{
  "phone_number": "11999999999",
  "ramal": "1000"
}
```

2. Execute:
```bash
curl -X POST http://localhost:3000/api/calls/click-to-call -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN" -d @test-call.json
```

**Opção C: PowerShell (Windows)**

```powershell
$body = @{
    phone_number = "11999999999"
    ramal = "1000"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/calls/click-to-call" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer SEU_TOKEN"} -Body $body
```

---

## ✅ Resposta Esperada

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

**Erro (se ramal não estiver autenticado):**
```json
{
  "error": "Erro ao iniciar chamada no Fortics"
}
```

---

## 🔍 Verificar Logs do Backend

**No Terminal 1 (onde o backend está rodando), você deve ver:**

```
📞 Fortics: Iniciando chamada 1000 → 11999999999
✅ Fortics: Chamada iniciada { success: true, id: '4444', ... }
```

**Se houver erro:**
```
❌ Fortics: Erro ao iniciar chamada Error: ...
```

---

## ⚠️ Troubleshooting

### Erro: "Failed to connect to localhost port 3000"

**Causa:** Backend não está rodando

**Solução:**
1. Verifique se o backend está rodando no Terminal 1
2. Verifique se apareceu "Server running on port 3000"
3. Se não apareceu, verifique os erros no console

---

### Erro: "Fortics API não configurado"

**Causa:** Variáveis não configuradas

**Solução:**
1. Verifique `backend/.env`
2. Confirme que as variáveis estão corretas
3. Reinicie o servidor

---

### Erro: "401 Unauthorized"

**Causa:** Token inválido ou expirado

**Solução:**
1. Faça login no CRM
2. Obtenha um token válido
3. Use o token correto no curl

---

### Erro: "Ramal é obrigatório"

**Causa:** Parâmetro não enviado corretamente

**Solução:**
- Use a Opção B (arquivo JSON) ou Opção C (PowerShell)
- Verifique se o JSON está correto

---

## 📋 Checklist

- [ ] Backend rodando em `http://localhost:3000`
- [ ] Mensagem "✅ Fortics API configurado" aparece
- [ ] Arquivo `.env` configurado
- [ ] Token de autenticação válido
- [ ] Ramal autenticado no Fortics
- [ ] Teste executado
- [ ] Resposta recebida

---

## 🎯 Próximos Passos

### Se Funcionou:

1. ✅ Testar via interface do CRM
2. ✅ Configurar na Vercel
3. ✅ Deploy em produção

### Se Não Funcionou:

1. ⚠️ Verificar logs do backend
2. ⚠️ Verificar se ramal está logado no Fortics
3. ⚠️ Testar URL diretamente no navegador
4. ⚠️ Me avisar o erro específico

---

**🚀 COMECE: Inicie o backend no Terminal 1 e depois teste no Terminal 2!**


