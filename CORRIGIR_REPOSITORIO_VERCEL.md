# 🔧 Corrigir Repositório Conectado na Vercel

## 🔍 Problema Identificado

Na tela de configuração Git da Vercel, o repositório conectado é:
- **Vercel mostra:** `VitudevIA/projeto_crm_exata` (com underscore)
- **GitHub real:** `VitudevIA/Projeto-CRM-Exata` (com hífen e maiúsculas)

**Isso pode estar causando o problema do auto-deploy!**

## ✅ Solução: Reconectar Repositório Corretamente

### Passo 1: Desconectar Repositório Atual

1. **Na página:** https://vercel.com/vitu-dev-ias-projects/projeto_crm_exata/settings/git
2. **Na seção "Connected Git Repository"**
3. **Clique no botão "Disconnect"** (no canto direito)
4. **Confirme a desconexão**

### Passo 2: Conectar Repositório Correto

1. **Após desconectar, clique em "Connect Git Repository"**

2. **Selecione "GitHub"**

3. **Autorize a Vercel** (se solicitado)

4. **Procure e selecione o repositório correto:**
   - Procure por: `Projeto-CRM-Exata` ou `Projeto CRM Exata`
   - **IMPORTANTE:** Selecione `VitudevIA/Projeto-CRM-Exata` (com hífen e maiúsculas)
   - Não selecione `projeto_crm_exata` (com underscore)

5. **Configure as seguintes opções:**

   **Production Branch:**
   - Selecione: `main`

   **Root Directory:**
   - Deixe: `./` (raiz do projeto)

   **Build Command:**
   - Configure: `cd frontend && npm install && npm run build`

   **Output Directory:**
   - Configure: `frontend/dist`

   **Install Command:**
   - Configure: `npm install`

6. **Verifique se "Auto Deploy" está habilitado:**
   - Deve haver um toggle/switch para "Automatic deployments" ou "Auto Deploy"
   - Deixe **HABILITADO** (verde/ON)

7. **Clique em "Deploy"** ou "Save"

### Passo 3: Verificar Configuração

Após conectar, verifique:

1. **Repositório conectado deve mostrar:**
   - `VitudevIA/Projeto-CRM-Exata` (com hífen e maiúsculas)
   - Status: `Connected` (recém conectado)

2. **Vercel Comments and Events:**
   - Deixe como está (Pull Request Comments e deployment_status Events habilitados)

3. **Ignored Build Step:**
   - Deixe como `Automatic`

### Passo 4: Verificar Webhook no GitHub

Após reconectar, a Vercel deve criar automaticamente um webhook:

1. **Acesse:** https://github.com/VitudevIA/Projeto-CRM-Exata/settings/hooks

2. **Procure por webhook da Vercel:**
   - Deve aparecer um novo webhook
   - Status deve estar "Active" (verde)
   - URL deve conter `vercel.com` ou `vercel.app`

3. **Se não aparecer:**
   - Aguarde alguns minutos
   - Ou reconecte o repositório novamente

### Passo 5: Testar Auto-Deploy

Após reconectar, teste:

```bash
# Fazer um pequeno commit de teste
echo "\n# Teste auto deploy após reconexão - $(date)" >> README.md
git add README.md
git commit -m "test: Verificar auto deploy após reconectar repositório"
git push origin main
```

**Depois:**
1. Acesse: https://vercel.com/vitu-dev-ias-projects/projeto_crm_exata
2. Vá em **Deployments**
3. Deve aparecer um novo deployment em **alguns segundos**
4. Aguarde o build completar

## ⚠️ Observações Importantes

### Por Que Isso Pode Estar Causando o Problema?

1. **Nome diferente:** Se a Vercel está conectada a `projeto_crm_exata` mas o repositório real é `Projeto-CRM-Exata`, o webhook pode não estar configurado corretamente.

2. **Webhook pode estar apontando para o repositório errado:** O webhook no GitHub pode estar configurado para um repositório que não existe ou está incorreto.

3. **Permissões:** A Vercel pode não ter permissões corretas no repositório com nome diferente.

### Verificação Adicional

Se após reconectar ainda não funcionar:

1. **Verifique se o repositório `projeto_crm_exata` existe no GitHub:**
   - Acesse: https://github.com/VitudevIA/projeto_crm_exata
   - Se existir, pode ser um repositório diferente
   - Se não existir, confirma que a conexão estava incorreta

2. **Verifique os webhooks:**
   - Acesse: https://github.com/VitudevIA/Projeto-CRM-Exata/settings/hooks
   - Veja se há webhooks apontando para `projeto_crm_exata`
   - Se houver, delete-os e reconecte

## 📋 Checklist Pós-Reconexão

Após reconectar, verifique:

- [ ] Repositório conectado mostra: `VitudevIA/Projeto-CRM-Exata`
- [ ] Status mostra: `Connected` (recém conectado)
- [ ] Production Branch está configurado como `main`
- [ ] Build Command está: `cd frontend && npm install && npm run build`
- [ ] Output Directory está: `frontend/dist`
- [ ] Webhook da Vercel existe no GitHub
- [ ] Webhook está "Active" (verde)
- [ ] Fazer push e verificar se novo deployment aparece

---

**Próximo passo:** Reconecte o repositório seguindo o Passo 1 e 2, e me informe o resultado!

