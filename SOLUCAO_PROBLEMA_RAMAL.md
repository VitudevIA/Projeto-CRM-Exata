# 🔧 Solução: Chamada Indo para Próprio Ramal

**Problema:** Chamada do ramal 1501 para 85997185855 está chegando no próprio 3CXPhone do ramal 1501

---

## 🎯 Solução Principal: Configuração do Fortics

**O problema NÃO está no código do CRM. Está na configuração do Fortics PBX.**

### ⚠️ Ação Necessária no Painel Fortics

1. **Acesse:** PBX > Cadastro > Serviços > Discagem Rápida

2. **Verifique:**
   - ✅ Grupo de discagem configurado
   - ✅ **Rota externa habilitada** (CRÍTICO)
   - ✅ Tronco externo configurado
   - ✅ Permissão para discar externamente

3. **Se necessário, configure:**
   - Grupo de discagem com rota externa
   - Tronco externo para chamadas externas
   - Regras de roteamento para números externos

---

## 🔍 Testes para Identificar o Problema

### Teste 1: Verificar Formato do Número

**Teste manual no 3CXPhone:**
1. Discar manualmente: `85997185855`
2. Funciona? → O formato está correto
3. Não funciona? → Precisa de prefixo

**Se precisar de prefixo:**
- Tente: `085997185855` (com 0)
- Tente: `985997185855` (com 9)
- Tente: `5585997185855` (com código do país)

### Teste 2: Testar Diretamente na API

```bash
# Formato atual (que está sendo usado)
curl "http://192.168.1.10/lispbx/lisintegra.php?gacao=discar&gkey=lispbx@123&gsrc=1501&gdst=85997185855&gresponse=json"

# Com 0 inicial
curl "http://192.168.1.10/lispbx/lisintegra.php?gacao=discar&gkey=lispbx@123&gsrc=1501&gdst=085997185855&gresponse=json"

# Com código do país
curl "http://192.168.1.10/lispbx/lisintegra.php?gacao=discar&gkey=lispbx@123&gsrc=1501&gdst=5585997185855&gresponse=json"
```

**Compare:** Qual formato faz a chamada ir para o celular?

---

## 🔧 Solução no Código (Se Necessário)

Se descobrir que precisa de um formato específico, podemos adicionar:

### Opção 1: Prefixo Configurável

Adicionar variável de ambiente:
```env
DISCADOR_PREFIXO_EXTERNO=0  # ou 9, ou 55
```

### Opção 2: Detecção Automática

Detectar automaticamente o formato necessário baseado no tamanho do número.

---

## 📋 Checklist de Verificação

- [ ] Verificar configuração do grupo de discagem no Fortics
- [ ] Verificar se há tronco externo configurado
- [ ] Testar discagem manual no 3CXPhone
- [ ] Testar diferentes formatos na API Fortics
- [ ] Verificar logs do Fortics PBX
- [ ] Comparar com formato que funciona manualmente

---

## 🎯 Próximo Passo

**1. Verifique a configuração do Fortics:**
   - Acesse o painel
   - Vá em PBX > Cadastro > Serviços > Discagem Rápida
   - Verifique se há rota externa configurada

**2. Teste manualmente:**
   - Discar do 3CXPhone: `85997185855`
   - Funciona? → O problema é na configuração do grupo de discagem
   - Não funciona? → Precisa de prefixo específico

**3. Me informe:**
   - Qual formato funciona manualmente?
   - Há alguma configuração específica no Fortics?

---

**🚨 AÇÃO IMEDIATA: Verifique a configuração do grupo de discagem no painel Fortics!**


