# ⚡ FAZER AGORA - 3 Passos Simples

## 🎯 O QUE VOCÊ PRECISA FAZER

### 1️⃣ Criar/Editar `backend/.env`

**Abra o arquivo** `backend/.env` e **adicione estas 2 linhas:**

```env
DISCADOR_API_URL=http://192.168.1.10
DISCADOR_API_KEY=lispbx@123
```

**Se o arquivo não existir, crie ele com essas linhas.**

---

### 2️⃣ Testar Configuração

**Abra um terminal e execute:**

```bash
cd backend
node test-fortics-local.js
```

**Deve aparecer:**
```
✓ DISCADOR_API_URL: http://192.168.1.10
✓ DISCADOR_API_KEY: lispbx@123...
✓ Conectividade OK!
```

---

### 3️⃣ Iniciar Backend

**No mesmo terminal:**

```bash
npm run dev
```

**Deve aparecer:**
```
✅ Fortics API configurado
Server running on port 3000
```

---

## ✅ PRONTO!

Se apareceu "✅ Fortics API configurado", está tudo certo!

**Próximo passo:** Testar click-to-call.

---

## 🆘 Se Não Funcionou

1. Verifique se o arquivo `.env` está na pasta `backend/`
2. Verifique se as variáveis estão escritas corretamente (sem espaços extras)
3. Verifique se não esqueceu o `http://` na URL
4. Reinicie o servidor

---

## 📚 Mais Detalhes

- **Guia completo:** `PASSO_A_PASSO_CONFIGURAR_E_TESTAR.md`
- **Teste rápido:** `TESTE_RAPIDO.md`
- **Exemplo de .env:** `backend/ENV_EXEMPLO.txt`

---

**🚀 É SÓ ISSO! 3 PASSOS E PRONTO!**


