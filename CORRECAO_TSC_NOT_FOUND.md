# ✅ Correção: `tsc: command not found`

## 🔍 Análise do Problema

**Erro:** `sh: line 1: tsc: command not found`

**Causa raiz:**
- O TypeScript (`typescript`) está em `devDependencies` no `frontend/package.json`
- Por padrão, em ambientes de produção, o `npm install` pode pular `devDependencies`
- O comando `npm install --legacy-peer-deps` não estava instalando devDependencies
- Resultado: TypeScript não instalado → `tsc` não encontrado

## ✅ Solução Aplicada

### Adicionar flag `--include=dev` no npm install

**Arquivo:** `vercel.json`

```json
{
  "buildCommand": "cd frontend && npm install --include=dev --legacy-peer-deps && npm run build"
}
```

**Antes:**
```json
{
  "buildCommand": "cd frontend && npm install --legacy-peer-deps && npm run build"
}
```

**Por que funciona:**
- `--include=dev`: Garante que `devDependencies` sejam instaladas
- `--legacy-peer-deps`: Mantém compatibilidade com dependências
- Resultado: TypeScript, Vite e todas as devDependencies são instaladas

## 📋 Por Que Isso Funciona?

### Comportamento do npm install

**Sem flags:**
- Em produção (`NODE_ENV=production`): Instala apenas `dependencies`
- Em desenvolvimento: Instala `dependencies` + `devDependencies`

**Com `--include=dev`:**
- Sempre instala `dependencies` + `devDependencies`
- Independente do ambiente (produção ou desenvolvimento)

### Dependências Necessárias para Build

Para o build funcionar, precisamos de:
- ✅ **TypeScript** (`typescript`) - Para `tsc`
- ✅ **Vite** (`vite`) - Para `vite build`
- ✅ **@vitejs/plugin-react** - Plugin do Vite
- ✅ **Outras devDependencies** - Para o build completo

Todas essas estão em `devDependencies`, então precisamos do `--include=dev`.

## 🚀 Próximos Passos

1. **Fazer commit e push:**
   ```bash
   git add vercel.json
   git commit -m "fix: Incluir devDependencies no build para instalar TypeScript e Vite"
   git push origin main
   ```

2. **Aguardar deploy:**
   - O Vercel executará o novo buildCommand
   - TypeScript e Vite serão instalados
   - O build deve funcionar

## ✅ Resultado Esperado

Após essa correção:
- ✅ `npm install --include=dev` instala TypeScript
- ✅ `tsc` será encontrado no PATH
- ✅ `vite` será encontrado no PATH
- ✅ `tsc && vite build` executará com sucesso
- ✅ O bundle será gerado em `frontend/dist`
- ✅ Deploy completa com sucesso

## 📊 Comparação

| Comando | Dependencies | DevDependencies | Resultado |
|---------|--------------|-----------------|-----------|
| `npm install` | ✅ | ❌ (em produção) | ❌ Falha |
| `npm install --include=dev` | ✅ | ✅ | ✅ Funciona |

---

**Status:** ✅ Correção aplicada
**Próximo passo:** Commit e push



