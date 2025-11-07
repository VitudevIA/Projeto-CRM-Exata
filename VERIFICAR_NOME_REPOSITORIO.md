# 🔍 Verificar Diferença de Nome: GitHub vs Vercel

## 📋 Situação Atual

- **GitHub:** `Projeto-CRM-Exata` (com hífen e maiúsculas)
- **Vercel:** `projeto_crm_exata` (com underscore e minúsculas)

## ❓ A Diferença de Nome Afeta o Auto-Deploy?

### Resposta Curta: **NÃO, normalmente não afeta**

A Vercel identifica repositórios pela **URL completa** ou pelo **ID do repositório**, não pelo nome. O que importa é:

1. ✅ **Repositório conectado corretamente** na Vercel
2. ✅ **Webhook configurado** no GitHub
3. ✅ **Branch correto** configurado (`main`)

### Mas Pode Causar Confusão

A diferença de nome pode causar:
- ❌ Confusão ao verificar qual repositório está conectado
- ❌ Dificuldade para identificar problemas
- ❌ Possível erro se o nome foi digitado incorretamente na conexão

## 🔍 Como Verificar se Está Conectado Corretamente

### Método 1: Verificar na Vercel

1. Acesse: https://vercel.com/vitu-dev-ias-projects/projeto_crm_exata/settings/git
2. Verifique o campo **"Repository"**
3. Deve mostrar: `VitudevIA/Projeto-CRM-Exata` ou `VitudevIA/projeto_crm_exata`

**O que importa:**
- ✅ O **owner** está correto: `VitudevIA`
- ✅ O **nome do repositório** corresponde ao GitHub (mesmo que com formato diferente)

### Método 2: Verificar nos Deployments

1. Acesse: https://vercel.com/vitu-dev-ias-projects/projeto_crm_exata
2. Clique em um deployment
3. Veja os metadados:
   - `githubRepo`: Deve mostrar o nome do repositório
   - `githubCommitRepo`: Deve mostrar o ID do repositório

**Nos logs que vi anteriormente:**
```json
"githubRepo": "projeto_crm_exata",
"githubCommitRepoId": "1091824419"
```

Isso indica que a Vercel está usando `projeto_crm_exata`, mas preciso verificar se corresponde ao repositório real.

### Método 3: Verificar no GitHub

1. Acesse: https://github.com/VitudevIA/Projeto-CRM-Exata/settings/hooks
2. Procure por webhooks da Vercel
3. Verifique se há um webhook ativo

## ⚠️ Possíveis Problemas

### Problema 1: Repositório Conectado Incorreto

**Sintoma:**
- Auto-deploy não funciona
- Deployments não aparecem após push

**Solução:**
- Reconectar o repositório na Vercel com o nome correto

### Problema 2: Webhook Não Configurado

**Sintoma:**
- GitHub não notifica a Vercel sobre novos commits

**Solução:**
- A Vercel deve criar o webhook automaticamente ao conectar
- Se não houver, reconecte o repositório

### Problema 3: Nome Digitado Incorretamente

**Sintoma:**
- Vercel tenta acessar um repositório que não existe

**Solução:**
- Verificar e corrigir o nome na configuração da Vercel

## ✅ Como Corrigir (Se Necessário)

### Opção 1: Reconectar Repositório na Vercel

1. Acesse: https://vercel.com/vitu-dev-ias-projects/projeto_crm_exata/settings/git
2. Clique em **"Disconnect"** (se houver)
3. Clique em **"Connect Git Repository"**
4. Selecione **GitHub**
5. Procure e selecione: `VitudevIA/Projeto-CRM-Exata`
6. Configure:
   - **Production Branch:** `main`
   - **Root Directory:** `./`
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Output Directory:** `frontend/dist`
7. Clique em **"Deploy"**

### Opção 2: Renomear Repositório no GitHub (Não Recomendado)

Se quiser que os nomes sejam iguais:

1. No GitHub, vá em **Settings** > **General**
2. Role até **"Repository name"**
3. Renomeie para: `projeto_crm_exata`
4. ⚠️ **ATENÇÃO:** Isso pode quebrar links e referências existentes

**Não recomendo** fazer isso, pois:
- Pode quebrar links existentes
- Pode causar problemas com outras integrações
- O nome atual está funcionando

## 🧪 Teste para Verificar

### Teste 1: Fazer Push e Verificar

```bash
# Fazer um pequeno commit
echo "\n# Teste auto deploy - $(date)" >> README.md
git add README.md
git commit -m "test: Verificar auto deploy"
git push origin main
```

**Depois:**
1. Acesse: https://vercel.com/vitu-dev-ias-projects/projeto_crm_exata
2. Vá em **Deployments**
3. Deve aparecer um novo deployment em alguns segundos

### Teste 2: Verificar Webhook

1. Acesse: https://github.com/VitudevIA/Projeto-CRM-Exata/settings/hooks
2. Procure por webhook da Vercel
3. Clique nele
4. Veja os **"Recent Deliveries"**
5. Deve haver entregas recentes após cada push

## 📊 Conclusão

### A Diferença de Nome NÃO Deve Afetar o Auto-Deploy

**Se o auto-deploy não está funcionando, as causas mais prováveis são:**

1. ❌ **Configuração incorreta** no `vercel.json` (já corrigido)
2. ❌ **Repositório não conectado** corretamente
3. ❌ **Webhook não configurado** ou inativo
4. ❌ **Branch incorreto** configurado
5. ❌ **Variáveis de ambiente** faltando (causando erro no build)

### Próximos Passos

1. ✅ **Fazer commit e push** das correções do `vercel.json`
2. ✅ **Verificar** se o auto-deploy funciona
3. ✅ **Se não funcionar**, verificar a conexão do repositório na Vercel
4. ✅ **Verificar** os webhooks no GitHub

---

**Resumo:** A diferença de nome normalmente não afeta, mas é melhor verificar se o repositório está conectado corretamente na Vercel.

