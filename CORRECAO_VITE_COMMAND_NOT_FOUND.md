# ✅ Correção: `vite: command not found`

## 🔍 Problema Identificado

O erro `vite: command not found` ocorre porque o comando `vite` não está disponível no PATH durante o build na Vercel.

**Erro:**
```
sh: line 1: vite: command not found
npm error command failed
npm error command sh -c tsc && vite build
```

## ✅ Solução Aplicada

### Alterado script de build para usar `npx`

**Arquivo:** `frontend/package.json`

```json
{
  "scripts": {
    "build": "tsc && npx vite build"  // ✅ Usa npx para encontrar vite
  }
}
```

**Antes:**
```json
{
  "scripts": {
    "build": "tsc && vite build"  // ❌ Pode não encontrar vite no PATH
  }
}
```

## 📋 Por Que Isso Funciona?

### `npx` vs comando direto

- **`vite build`**: Procura o executável `vite` no PATH do sistema
- **`npx vite build`**: Procura o executável `vite` no `node_modules/.bin` do projeto atual

### Por que o `vite` não está no PATH?

Na Vercel (e em muitos ambientes de CI/CD):
1. As dependências são instaladas localmente no projeto
2. O `node_modules/.bin` não é adicionado automaticamente ao PATH global
3. Usar `npx` garante que o executável local seja encontrado

## 🚀 Próximos Passos

1. **Fazer commit e push:**
   ```bash
   git add frontend/package.json
   git commit -m "fix: Usar npx para executar vite no build"
   git push origin main
   ```

2. **Aguardar novo deploy:**
   - O Vercel deve detectar automaticamente
   - O build deve encontrar o `vite` via `npx`
   - Deve compilar com sucesso

## ✅ Resultado Esperado

Após essa correção:
- ✅ `npx vite build` encontrará o Vite no `node_modules/.bin`
- ✅ O build TypeScript (`tsc`) executará primeiro
- ✅ O build do Vite executará depois
- ✅ O bundle será gerado em `frontend/dist`
- ✅ O deploy será bem-sucedido

---

**Status:** ✅ Correção aplicada
**Próximo passo:** Fazer commit e push



