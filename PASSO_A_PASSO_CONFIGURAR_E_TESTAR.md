# 🚀 Passo a Passo: Configurar e Testar

**Siga estes passos na ordem:**

---

## 📝 PASSO 1: Criar/Editar backend/.env

### Opção A: Se o arquivo NÃO existe

1. Crie o arquivo `backend/.env`
2. Adicione este conteúdo:

```env
# Porta do servidor
PORT=3000

# Ambiente
NODE_ENV=development

# Supabase (use seus valores reais)
SUPABASE_URL=https://bmzhvglbfynzlkdziftg.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_KEY=sua_service_key_aqui

# JWT
JWT_SECRET=seu_jwt_secret_aqui

# CORS
CORS_ORIGIN=http://localhost:5173

# Fortics BPX Integration ⭐ ADICIONE ESTAS LINHAS
DISCADOR_API_URL=http://192.168.1.10
DISCADOR_API_KEY=lispbx@123

# Upload de arquivos
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf
```

### Opção B: Se o arquivo JÁ existe

1. Abra `backend/.env` no editor
2. Adicione ou atualize estas 2 linhas:

```env
DISCADOR_API_URL=http://192.168.1.10
DISCADOR_API_KEY=lispbx@123
```

**⚠️ IMPORTANTE:**
- Use `http://` (não `https://`)
- URL base: `http://192.168.1.10` (sem caminho)
- Chave: `lispbx@123` (exatamente como está)

---

## 🧪 PASSO 2: Testar Configuração

### Abra um terminal e execute:

```bash
cd backend
node test-fortics-local.js
```

**Resultado esperado:**
```
═══ TESTE LOCAL - INTEGRAÇÃO FORTICS BPX ═══

═══ 1. Verificando Variáveis de Ambiente ═══
✓ DISCADOR_API_URL: http://192.168.1.10
✓ DISCADOR_API_KEY: lispbx@123...

═══ 2. Testando Conectividade com Fortics ═══
✓ Conectividade OK!
```

**Se aparecer erro:**
- Verifique se o arquivo `.env` está na pasta `backend/`
- Verifique se as variáveis estão escritas corretamente
- Verifique se o servidor Fortics está acessível

---

## 🚀 PASSO 3: Iniciar Backend

### Em um terminal:

```bash
cd backend
npm run dev
```

**Deve aparecer:**
```
✅ Fortics API configurado
Server running on port 3000
```

**Se aparecer:**
```
⚠️  Fortics API não configurado
```

**Solução:**
1. Verifique o arquivo `.env`
2. Reinicie o servidor

---

## 🧪 PASSO 4: Testar Click-to-Call

### Pré-requisitos:

1. ✅ Backend rodando em `http://localhost:3000`
2. ✅ Token de autenticação válido
3. ✅ Ramal autenticado no Fortics (ex: "1000")

### Teste com curl:

```bash
curl -X POST http://localhost:3000/api/calls/click-to-call \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d "{\"phone_number\": \"11999999999\", \"ramal\": \"1000\"}"
```

**Resposta esperada (sucesso):**
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

## 🖥️ PASSO 5: Testar via Interface

### 1. Iniciar Frontend

**Em outro terminal:**

```bash
cd frontend
npm run dev
```

### 2. Acessar CRM

Abra no navegador:
```
http://localhost:5173
```

### 3. Fazer Login

- Use suas credenciais
- Aguarde carregar

### 4. Testar Click-to-Call

1. Vá em **Clientes**
2. Clique em um cliente
3. Procure botão **"Ligar"** ou **"Click-to-Call"**
4. Preencha o **ramal** (ex: "1000")
5. Clique em **"Iniciar Chamada"**

---

## ✅ Checklist Rápido

Execute na ordem:

- [ ] Criar/editar `backend/.env`
- [ ] Adicionar `DISCADOR_API_URL=http://192.168.1.10`
- [ ] Adicionar `DISCADOR_API_KEY=lispbx@123`
- [ ] Executar `node test-fortics-local.js`
- [ ] Verificar se apareceu "✓ Conectividade OK!"
- [ ] Iniciar backend: `npm run dev`
- [ ] Verificar se apareceu "✅ Fortics API configurado"
- [ ] Testar click-to-call (curl ou interface)

---

## 🆘 Se Algo Não Funcionar

### Erro: "Arquivo .env não encontrado"
**Solução:** Crie o arquivo `backend/.env` manualmente

### Erro: "Fortics API não configurado"
**Solução:** Verifique se as variáveis estão no `.env` e reinicie

### Erro: "ECONNREFUSED"
**Solução:** 
- Verifique se o servidor Fortics está ligado
- Verifique se você está na mesma rede (192.168.1.x)
- Teste: `ping 192.168.1.10`

### Erro: "Ramal é obrigatório"
**Solução:** Sempre envie o parâmetro `ramal` na requisição

---

## 📊 Resultado Esperado

### Se Tudo Estiver OK:

1. ✅ Script de teste passa
2. ✅ Backend inicia sem erros
3. ✅ Mensagem "Fortics API configurado" aparece
4. ✅ Click-to-call retorna sucesso
5. ✅ Chamada é iniciada no Fortics

---

**🚀 COMECE AGORA: Crie o arquivo backend/.env e siga os passos!**


