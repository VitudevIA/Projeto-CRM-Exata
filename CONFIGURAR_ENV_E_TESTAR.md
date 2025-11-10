# ⚙️ Configurar .env e Testar Localmente

**Data:** 10 de novembro de 2025  
**Status:** 🟢 Pronto para Configuração

---

## 📝 Passo 1: Configurar backend/.env

### Opção A: Editar Arquivo Existente

1. Abra o arquivo `backend/.env` no editor
2. Adicione ou atualize estas linhas:

```env
# Fortics BPX Integration
DISCADOR_API_URL=http://192.168.1.10
DISCADOR_API_KEY=lispbx@123
```

### Opção B: Criar Arquivo Novo

Se o arquivo não existir, crie `backend/.env` com este conteúdo:

```env
# Porta do servidor
PORT=3000

# Ambiente
NODE_ENV=development

# Supabase (preencha com seus valores)
SUPABASE_URL=https://bmzhvglbfynzlkdziftg.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_KEY=sua_service_key_aqui

# JWT
JWT_SECRET=seu_jwt_secret_aqui

# CORS
CORS_ORIGIN=http://localhost:5173

# Fortics BPX Integration
DISCADOR_API_URL=http://192.168.1.10
DISCADOR_API_KEY=lispbx@123

# Upload de arquivos
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf
```

**⚠️ IMPORTANTE:**
- Use `http://` (não `https://`)
- URL base: `http://192.168.1.10` (sem o caminho `/lispbx/lisintegra.php`)
- Chave: `lispbx@123` (exatamente como está no painel)

---

## 🧪 Passo 2: Verificar Configuração

### Teste 1: Verificar se o Serviço Detecta as Variáveis

```bash
cd backend
npm run dev
```

**Deve aparecer no console:**
```
✅ Fortics API configurado
Server running on port 3000
```

**Se aparecer:**
```
⚠️  Fortics API não configurado. Configure DISCADOR_API_URL e DISCADOR_API_KEY
```

**Solução:**
1. Verifique se o arquivo `.env` está na pasta `backend/`
2. Verifique se as variáveis estão escritas corretamente
3. Reinicie o servidor

---

## 🧪 Passo 3: Testar Click-to-Call

### Pré-requisitos

1. **Backend rodando** em `http://localhost:3000`
2. **Token de autenticação** válido
3. **Ramal autenticado** no Fortics PBX (ex: ramal "1000")

### Teste Manual com curl

```bash
# Substitua SEU_TOKEN pelo token JWT válido
curl -X POST http://localhost:3000/api/calls/click-to-call \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "phone_number": "11999999999",
    "ramal": "1000",
    "client_id": "uuid-do-cliente-opcional"
  }'
```

**Resposta esperada (sucesso):**
```json
{
  "success": true,
  "call_id": "4444",
  "account_code": "1699999999999.abc123",
  "call_log_id": "uuid-do-log",
  "message": "DISCANDO PARA 11999999999...",
  "fortics_response": {
    "success": true,
    "retorno": "DISCANDO PARA 11999999999 SIP/1000...",
    "msg": "DISCANDO PARA 11999999999...",
    "id": "4444"
  }
}
```

**Resposta esperada (erro - ramal não autenticado):**
```json
{
  "error": "Erro ao iniciar chamada no Fortics",
  "details": "..."
}
```

---

## 🧪 Passo 4: Teste via Interface do CRM

### 1. Iniciar Frontend

```bash
# Terminal 2 (deixe o backend rodando no Terminal 1)
cd frontend
npm run dev
```

### 2. Acessar CRM

```
http://localhost:5173
```

### 3. Fazer Login

- Use suas credenciais
- Aguarde carregar o dashboard

### 4. Testar Click-to-Call

1. Vá até a página de **Clientes**
2. Clique em um cliente
3. Procure o botão **"Ligar"** ou **"Click-to-Call"**
4. Preencha o **ramal** (ex: "1000")
5. Clique em **"Iniciar Chamada"**

**Resultado esperado:**
- Mensagem de sucesso
- Chamada iniciada no Fortics
- Log criado no banco de dados

---

## 🔍 Verificar Logs

### Logs do Backend

Ao fazer uma requisição, você deve ver no console:

```
📞 Fortics: Iniciando chamada 1000 → 11999999999
✅ Fortics: Chamada iniciada { success: true, id: '4444', ... }
```

### Logs de Erro

Se houver erro, você verá:

```
❌ Fortics: Erro ao iniciar chamada Error: ...
```

---

## ⚠️ Troubleshooting

### Erro: "Configuração do discador não encontrada"

**Causa:** Variáveis não configuradas

**Solução:**
1. Verifique se `backend/.env` existe
2. Verifique se as linhas estão corretas:
   ```env
   DISCADOR_API_URL=http://192.168.1.10
   DISCADOR_API_KEY=lispbx@123
   ```
3. Reinicie o servidor backend

---

### Erro: "Ramal é obrigatório"

**Causa:** Parâmetro `ramal` não foi enviado

**Solução:**
- Sempre envie o ramal na requisição:
  ```json
  {
    "phone_number": "11999999999",
    "ramal": "1000"
  }
  ```

---

### Erro: "Erro ao iniciar chamada no Fortics"

**Possíveis causas:**

1. **Ramal não está autenticado**
   - Verifique no painel Fortics se o ramal está logado
   - O ramal deve estar disponível (não em chamada)

2. **Não há rota para o número**
   - Verifique em: PBX > Cadastro > Serviços > Discagem Rápida
   - Deve haver rota configurada para o número de destino

3. **URL incorreta**
   - Verifique se é `http://` (não `https://`)
   - Teste a URL diretamente no navegador:
     ```
     http://192.168.1.10/lispbx/lisintegra.php?gacao=discar&gkey=lispbx@123&gsrc=1000&gdst=11999999999&gresponse=json
     ```

4. **Chave incorreta**
   - Verifique no painel: PBX > Cadastro > Serviços > Discagem Rápida
   - Confirme que a chave é exatamente `lispbx@123`

---

### Erro: "ECONNREFUSED" ou "Network Error"

**Causa:** Servidor Fortics não está acessível

**Solução:**
1. Verifique se o servidor Fortics está ligado
2. Verifique se você está na mesma rede (192.168.1.x)
3. Teste ping: `ping 192.168.1.10`
4. Teste no navegador: `http://192.168.1.10`

---

## ✅ Checklist de Teste

- [ ] Arquivo `backend/.env` criado/editado
- [ ] Variáveis `DISCADOR_API_URL` e `DISCADOR_API_KEY` configuradas
- [ ] Backend iniciado sem erros
- [ ] Mensagem "✅ Fortics API configurado" aparece
- [ ] Teste com curl executado
- [ ] Resposta recebida (sucesso ou erro específico)
- [ ] Frontend iniciado
- [ ] Login realizado no CRM
- [ ] Click-to-call testado via interface
- [ ] Chamada iniciada no Fortics (verificar no painel)

---

## 📊 Resultado Esperado

### Se Tudo Estiver Correto:

1. ✅ Backend inicia sem erros
2. ✅ Mensagem "Fortics API configurado" aparece
3. ✅ Requisição click-to-call retorna sucesso
4. ✅ Chamada é iniciada no Fortics PBX
5. ✅ Log é criado no banco de dados
6. ✅ Interface mostra mensagem de sucesso

### Se Houver Problemas:

1. ⚠️ Verifique os logs do backend
2. ⚠️ Teste a URL diretamente no navegador
3. ⚠️ Verifique se o ramal está logado no Fortics
4. ⚠️ Consulte a seção Troubleshooting acima

---

## 🎯 Próximos Passos Após Teste Local

### Se Funcionou Localmente:

1. ✅ Configurar variáveis na Vercel
2. ✅ Fazer deploy
3. ✅ Testar em produção

### Se Não Funcionou:

1. ⚠️ Verificar logs
2. ⚠️ Testar URL diretamente
3. ⚠️ Verificar requisitos (ramal, rota, etc.)
4. ⚠️ Ajustar código se necessário

---

**🚀 PRONTO PARA TESTAR! Siga os passos acima!**


