# 🔧 Correção: Mostrar Número de Destino no 3CXPhone

## 📋 Problema Identificado

**Situação:**
- ✅ A chamada está funcionando corretamente
- ❌ O 3CXPhone mostra o ramal (1501) ao invés do número de destino (ex: 85997185855)

**Causa:**
O Fortics PBX está configurando o Caller ID Name como o ramal de origem, fazendo com que o 3CXPhone exiba o ramal ao invés do número de destino.

---

## ✅ Solução Implementada

**Mudança no código:**
Adicionado o parâmetro `gvariaveis_de_canal` na chamada da API Fortics para definir o Caller ID Name como o número de destino.

**Arquivo modificado:**
- `backend/src/services/fortics.ts`

**Código adicionado:**
```typescript
// Configurar variável de canal para definir o Caller ID Name como o número de destino
// Isso faz com que o 3CXPhone mostre o número de destino ao invés do ramal
// Formato: CALLERID(name)=numero_destino
params.gvariaveis_de_canal = `CALLERID(name)=${numeroDestino}`;
```

---

## 🧪 Como Testar

### 1. Reiniciar o Backend

**Se o backend estiver rodando localmente:**
```bash
# Parar o backend (Ctrl+C)
# Depois iniciar novamente
cd backend
npm run dev
```

### 2. Testar a Chamada

1. **Acesse o CRM:**
   - Vá até a lista de clientes ou detalhes de um cliente
   - Clique no ícone de telefone para ligar

2. **Digite o ramal:**
   - Quando solicitado, digite o ramal (ex: 1501)
   - Clique em "OK"

3. **Verificar no 3CXPhone:**
   - ✅ O 3CXPhone deve mostrar o **número de destino** (ex: 85997185855)
   - ❌ Não deve mais mostrar o ramal (1501)

---

## 🔍 Se Não Funcionar

### Alternativa 1: Formato Diferente da Variável

Se o formato `CALLERID(name)=numero` não funcionar, podemos tentar:

```typescript
// Tentar formato alternativo
params.gvariaveis_de_canal = `CALLERIDNAME=${numeroDestino}`;
```

Ou:

```typescript
// Tentar múltiplas variáveis
params.gvariaveis_de_canal = `CALLERID(name)=${numeroDestino}|CALLERID(num)=${numeroDestino}`;
```

### Alternativa 2: Verificar Configuração do Fortics

**No painel do Fortics:**
1. Acesse `PBX > Cadastro > Serviços > Discagem Rápida`
2. Verifique se há opções de configuração de Caller ID
3. Verifique se há configurações de variáveis de canal padrão

### Alternativa 3: Configuração no Grupo de Discagem

**No painel do Fortics:**
1. Acesse o grupo de discagem configurado
2. Verifique se há opções de Caller ID ou variáveis de canal
3. Configure para usar o número de destino como Caller ID Name

---

## 📝 Notas Técnicas

**Parâmetro `gvariaveis_de_canal`:**
- Permite definir variáveis de canal do Asterisk
- Formato: `VARIAVEL=valor` ou `VARIAVEL1=valor1|VARIAVEL2=valor2`
- Variáveis comuns do Asterisk:
  - `CALLERID(name)` - Nome do chamador (exibido no telefone)
  - `CALLERID(num)` - Número do chamador
  - `CHANNEL` - Canal da chamada
  - `EXTEN` - Extensão discada

**Documentação Fortics:**
- Parâmetro documentado na linha 149 da `API FORTICS - DOCUMENTAÇÃO.md`
- Exemplo: `gvariaveis_de_canal=add_note:yes`

---

## 🎯 Resultado Esperado

**Antes:**
- 3CXPhone mostra: `1501` (ramal)

**Depois:**
- 3CXPhone mostra: `85997185855` (número de destino)

---

## 📞 Próximos Passos

1. ✅ Testar a correção
2. ✅ Verificar se o 3CXPhone mostra o número correto
3. ✅ Se não funcionar, tentar formatos alternativos
4. ✅ Se ainda não funcionar, verificar configurações do Fortics

---

**🔍 TESTE AGORA: Reinicie o backend e teste uma chamada!**

