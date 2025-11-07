# Guia: Verificar e Habilitar Auto Deploy no Vercel

## 📍 Passo a Passo para Verificar Auto Deploy

### 1. Acessar o Dashboard do Projeto

1. **Acesse o link direto do seu projeto:**
   ```
   https://vercel.com/vitu-dev-ias-projects/projeto_crm_exata
   ```

2. **Ou navegue manualmente:**
   - Acesse: https://vercel.com
   - Faça login (se necessário)
   - Clique em "vitu-dev-ias-projects" (seu time)
   - Clique em "projeto_crm_exata"

### 2. Verificar Integração com GitHub

1. **No menu lateral, clique em "Settings"**
2. **Clique em "Git"** (ou "Integrations" > "Git")
3. **Verifique as seguintes informações:**

   ✅ **Repositório Conectado:**
   - Deve mostrar: `VitudevIA/Projeto-CRM-Exata`
   - Se mostrar "Not connected" ou "Disconnected", você precisa conectar

   ✅ **Production Branch:**
   - Deve estar configurado como: `main`
   - Se estiver diferente, altere para `main`

   ✅ **Auto Deploy:**
   - Procure por um toggle/switch chamado "Auto Deploy" ou "Automatic deployments"
   - Deve estar **HABILITADO** (verde/ON)
   - Se estiver desabilitado (cinza/OFF), clique para habilitar

### 3. Verificar Configurações de Deploy

1. **Ainda em Settings, clique em "General"**
2. **Verifique as seguintes configurações:**

   - **Framework Preset:** `Other` ou `Vite`
   - **Root Directory:** `./` (raiz)
   - **Build Command:** `npm run build`
   - **Output Directory:** `frontend/dist`
   - **Install Command:** `npm install`

### 4. Verificar Deployments Recentes

1. **No menu lateral, clique em "Deployments"**
2. **Verifique:**
   - Se há deployments listados
   - Se o último deployment corresponde ao último commit no GitHub
   - Se há algum erro nos deployments

### 5. Verificar Webhooks do GitHub

1. **No GitHub, acesse:**
   ```
   https://github.com/VitudevIA/Projeto-CRM-Exata/settings/hooks
   ```

2. **Procure por um webhook da Vercel:**
   - Deve haver um webhook com URL contendo `vercel.com`
   - Status deve estar "Active" (verde)
   - Se não houver, a Vercel criará automaticamente ao conectar

## 🔧 Como Habilitar Auto Deploy (Se Estiver Desabilitado)

### Opção A: Se o Repositório Já Está Conectado

1. **Vercel Dashboard** > **Settings** > **Git**
2. **Procure pelo toggle "Auto Deploy"**
3. **Clique para habilitar** (deve ficar verde/ON)
4. **Salve as alterações**

### Opção B: Se o Repositório NÃO Está Conectado

1. **Vercel Dashboard** > **Settings** > **Git**
2. **Clique em "Connect Git Repository"**
3. **Selecione "GitHub"**
4. **Autorize a Vercel** (se solicitado)
5. **Selecione o repositório:** `VitudevIA/Projeto-CRM-Exata`
6. **Configure:**
   - **Production Branch:** `main`
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `frontend/dist`
   - **Install Command:** `npm install`
7. **Marque a opção "Auto Deploy"** (se houver checkbox)
8. **Clique em "Deploy"**

## 🧪 Testar Auto Deploy

Após habilitar, teste fazendo um pequeno commit:

1. **No terminal:**
   ```bash
   echo "# Teste Auto Deploy" >> README.md
   git add README.md
   git commit -m "test: Verificar auto deploy"
   git push origin main
   ```

2. **No Vercel Dashboard:**
   - Vá para "Deployments"
   - Deve aparecer um novo deployment automaticamente em alguns segundos
   - Status deve ser "Building" e depois "Ready"

## ⚠️ Problemas Comuns

### Problema 1: "Auto Deploy" não aparece
- **Solução:** O repositório pode não estar conectado. Conecte primeiro.

### Problema 2: Auto Deploy está habilitado, mas não funciona
- **Verifique:**
  - Se o branch está correto (`main`)
  - Se há webhook ativo no GitHub
  - Se há erros nos logs do último deployment

### Problema 3: Deploy manual funciona, mas automático não
- **Solução:** Pode ser problema de permissões. Verifique se a Vercel tem acesso ao repositório no GitHub.

## 📸 Onde Encontrar no Dashboard

```
Vercel Dashboard
├── projeto_crm_exata
    ├── Deployments (ver deployments)
    ├── Settings
    │   ├── General (configurações de build)
    │   ├── Git (integração e auto deploy) ⭐ AQUI
    │   ├── Environment Variables
    │   └── ...
    └── ...
```

## ✅ Checklist Final

- [ ] Repositório está conectado no Vercel
- [ ] Branch `main` está configurado como Production
- [ ] Auto Deploy está HABILITADO
- [ ] Webhook da Vercel existe no GitHub
- [ ] Último commit do GitHub aparece no Vercel
- [ ] Teste de commit funcionou (deploy automático)

## 🆘 Se Ainda Não Funcionar

1. **Desconectar e Reconectar:**
   - Settings > Git > Disconnect
   - Conectar novamente

2. **Verificar Permissões no GitHub:**
   - GitHub > Settings > Applications > Authorized OAuth Apps
   - Verifique se Vercel está autorizado

3. **Contatar Suporte Vercel:**
   - Se nada funcionar, pode ser um problema da plataforma

