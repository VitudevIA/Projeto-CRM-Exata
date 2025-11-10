# ✅ Credenciais Fortics Configuradas

**Data:** 10 de novembro de 2025  
**Status:** 🟢 Configurado e Pronto para Testes

---

## 🔑 Credenciais Obtidas

### DISCADOR_API_URL
```
http://192.168.1.10
```

**Observação:** 
- URL base do servidor Fortics PBX
- Endpoint completo: `http://192.168.1.10/lispbx/lisintegra.php`
- **Importante:** Usar HTTP (não HTTPS) conforme painel

---

### DISCADOR_API_KEY
```
lispbx@123
```

**Localização no painel:**
- PBX > Cadastro > Serviços > Discagem Rápida
- Campo: "Chave de discagem"

---

## 📝 Configuração Aplicada

### Arquivo: `backend/.env`

```env
# Fortics BPX Integration
DISCADOR_API_URL=http://192.168.1.10
DISCADOR_API_KEY=lispbx@123
```

**⚠️ IMPORTANTE:** 
- Use `http://` (não `https://`)
- URL base sem o caminho `/lispbx/lisintegra.php`
- O código já adiciona o caminho automaticamente

---

## 🔧 Ajustes Realizados no Código

### 1. Endpoint Corrigido ✅

**Antes:**
```typescript
const url = `${this.baseUrl}/lisintegra.php`;
```

**Depois:**
```typescript
const url = `${this.baseUrl}/lispbx/lisintegra.php`;
```

**Motivo:** Conforme painel Fortics, o endpoint correto é `/lispbx/lisintegra.php`

---

### 2. Rota Click-to-Call Atualizada ✅

**Mudanças:**
- ✅ Agora usa `ForticsService` ao invés de fetch direto
- ✅ Adicionado parâmetro obrigatório `ramal`
- ✅ Gera `accountcode` único automaticamente
- ✅ Melhor tratamento de erros
- ✅ Logs detalhados

**Exemplo de requisição:**
```json
POST /api/calls/click-to-call
{
  "phone_number": "11999999999",
  "ramal": "1000",
  "client_id": "uuid-do-cliente"
}
```

---

## 🧪 Como Testar

### Teste 1: Verificar Configuração

```bash
cd backend
npm run dev

# Deve aparecer no console:
✅ Fortics API configurado
```

---

### Teste 2: Click-to-Call (Manual)

**Via curl:**
```bash
curl -X POST http://localhost:3000/api/calls/click-to-call \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "phone_number": "11999999999",
    "ramal": "1000",
    "client_id": "uuid-do-cliente"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "call_id": "4444",
  "account_code": "1699999999999.abc123",
  "call_log_id": "uuid-do-log",
  "message": "DISCANDO PARA 11999999999...",
  "fortics_response": {
    "success": true,
    "retorno": "DISCANDO PARA 11999999999...",
    "id": "4444"
  }
}
```

---

### Teste 3: Via Interface do CRM

1. Faça login no CRM
2. Vá até um cliente
3. Clique no botão "Ligar" ou "Click-to-Call"
4. Preencha o ramal (ex: "1000")
5. Clique em "Iniciar Chamada"
6. Verifique se a chamada é iniciada no Fortics

---

## ⚠️ Requisitos para Funcionar

### 1. Ramal Deve Estar Autenticado
- O ramal informado deve estar logado no Fortics PBX
- Deve estar disponível (não em chamada)

### 2. Rota de Discagem
- Deve haver rota configurada para o número de destino
- Configurado em: PBX > Cadastro > Serviços > Discagem Rápida

### 3. Grupo de Discagem
- O grupo de discagem será o configurado em "Discagem Rápida"
- Verifique se está correto no painel

---

## 🔍 Troubleshooting

### Erro: "Configuração do discador não encontrada"

**Causa:** Variáveis de ambiente não configuradas

**Solução:**
1. Verifique se `backend/.env` existe
2. Verifique se as variáveis estão preenchidas:
   ```env
   DISCADOR_API_URL=http://192.168.1.10
   DISCADOR_API_KEY=lispbx@123
   ```
3. Reinicie o servidor backend

---

### Erro: "Erro ao iniciar chamada no Fortics"

**Causas possíveis:**
1. Ramal não está autenticado
2. Não há rota para o número de destino
3. URL incorreta (verifique se é HTTP, não HTTPS)
4. Chave de integração incorreta

**Solução:**
1. Verifique no painel Fortics se o ramal está logado
2. Verifique se há rota para o número
3. Teste a URL diretamente no navegador:
   ```
   http://192.168.1.10/lispbx/lisintegra.php?gacao=discar&gkey=lispbx@123&gsrc=1000&gdst=11999999999&gresponse=json
   ```

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

## 📊 Status da Integração

```
[██████████████] 95% Completo

✅ Credenciais obtidas             100%
✅ Código atualizado               100%
✅ Endpoint corrigido              100%
✅ Rota click-to-call atualizada   100%
✅ Documentação atualizada         100%
⏳ Testes em produção                0% ← PRÓXIMO PASSO
```

---

## 🎯 Próximos Passos

### 1. Testar Localmente (AGORA) ⏳

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Testar no navegador:
# http://localhost:5173
```

---

### 2. Configurar na Vercel (DEPOIS) ⏳

1. Acesse: https://vercel.com/vitu-dev-ias-projects/projeto_crm_exata/settings/environment-variables

2. Adicione:
   - **Key:** `DISCADOR_API_URL`
   - **Value:** `http://192.168.1.10`
   - **Environment:** Production, Preview, Development

3. Adicione:
   - **Key:** `DISCADOR_API_KEY`
   - **Value:** `lispbx@123`
   - **Environment:** Production, Preview, Development

4. Faça novo deploy

---

### 3. Implementar Polling (DEPOIS) ⏳

- Criar hook `useCallPolling()` no frontend
- Consultar status a cada 5 segundos
- Atualizar UI em tempo real

---

## ✅ Checklist Final

- [x] Credenciais obtidas
- [x] Código atualizado
- [x] Endpoint corrigido
- [x] Variáveis documentadas
- [ ] Testar localmente
- [ ] Configurar na Vercel
- [ ] Testar em produção
- [ ] Implementar polling
- [ ] Testes finais

---

## 📞 Suporte

**Se algo não funcionar:**

1. Verifique os logs do backend
2. Teste a URL diretamente no navegador
3. Verifique se o ramal está logado no Fortics
4. Consulte `TROUBLESHOOTING.md` (se criado)

---

**🎉 INTEGRAÇÃO CONFIGURADA! PRONTO PARA TESTES! 🚀**

**Próxima ação:** Testar localmente e depois configurar na Vercel!


