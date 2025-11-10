# 🔍 Verificar Configuração de Caller ID no Fortics

## 📋 Problema

O 3CXPhone está mostrando o ramal (1501) ao invés do número de destino (85997185855) nas chamadas click-to-call.

---

## 🔧 O Que Foi Tentado no Código

**Implementado:**
- ✅ Múltiplas variáveis de canal em diferentes formatos
- ✅ `CALLERID(name)=numero`
- ✅ `CALLERIDNAME=numero`
- ✅ `CALLERID(num)=numero`
- ✅ Formato com dois pontos

**Resultado:**
- ❌ Ainda não funciona

---

## 🎯 Próximo Passo: Verificar no Painel Fortics

**O problema pode estar na configuração do Fortics, não no código!**

### Passo 1: Acessar "Discagem Rápida"

1. **Acesse:** `http://192.168.1.10`
2. **Navegue até:** `PBX > Cadastro > Serviços > Discagem Rápida`
3. **Procure por:**
   - ✅ Campo "Caller ID" ou "Identificação do Chamador"
   - ✅ Campo "Variáveis de Canal Padrão"
   - ✅ Opções de configuração de Caller ID
   - ✅ Checkbox "Usar número de destino como Caller ID"

### Passo 2: Verificar Grupo de Discagem

1. **Anote qual grupo está selecionado** em "Discagem Rápida"
2. **Acesse:** `PBX > Cadastro > Grupos de Discagem`
3. **Selecione o grupo** usado na discagem rápida
4. **Procure por:**
   - ✅ Configurações de Caller ID
   - ✅ Variáveis de canal padrão
   - ✅ Opções de identificação de chamadas

### Passo 3: Verificar Configurações do Ramal

1. **Acesse:** `PBX > Cadastro > Ramais`
2. **Selecione o ramal 1501**
3. **Procure por:**
   - ✅ Configurações de Caller ID
   - ✅ Opções de exibição de chamadas
   - ✅ Configurações de identificação

### Passo 4: Verificar Troncos

1. **Acesse:** `PBX > Cadastro > Troncos`
2. **Verifique os troncos configurados**
3. **Procure por:**
   - ✅ Configurações de Caller ID
   - ✅ Opções de identificação de chamadas externas

---

## 📸 O Que Capturar

**Screenshots necessários:**
1. ✅ Tela de "Discagem Rápida" (completa)
2. ✅ Tela do "Grupo de Discagem" (completa)
3. ✅ Tela de configuração do "Ramal 1501" (se houver opções relevantes)
4. ✅ Qualquer tela que mostre opções de Caller ID ou variáveis de canal

---

## 🧪 Teste Manual via API

**Teste direto na API para verificar se as variáveis são processadas:**

```bash
# Teste com variável CALLERID(name)
curl "http://192.168.1.10/lispbx/lisintegra.php?gacao=discar&gkey=lispbx@123&gsrc=1501&gdst=85997185855&gresponse=json&gvariaveis_de_canal=CALLERID(name)=85997185855"
```

**Depois verifique no 3CXPhone:**
- O número aparece corretamente?
- Ou ainda mostra o ramal?

---

## 💡 Possíveis Soluções no Fortics

### Solução 1: Configurar Caller ID na Discagem Rápida

**Se houver campo de Caller ID:**
- Configure para usar `${gdst}` ou variável similar
- Ou configure para usar o número de destino

### Solução 2: Modificar Dialplan

**Se você tiver acesso ao dialplan do Asterisk:**
- Pode ser necessário modificar o dialplan usado pelo Fortics
- Adicionar comando para definir Caller ID Name como número de destino

### Solução 3: Contatar Suporte Fortics

**Se não houver opções de configuração:**
- Entre em contato com o suporte da Fortics
- Pergunte: "Como fazer o Caller ID Name mostrar o número de destino em chamadas click-to-call?"
- Pode ser uma funcionalidade que precisa ser habilitada ou configurada

---

## 🔍 Informações para o Suporte Fortics

**Se precisar contatar o suporte, informe:**

1. **Problema:**
   - Em chamadas click-to-call, o 3CXPhone mostra o ramal ao invés do número de destino
   - Estamos usando o parâmetro `gvariaveis_de_canal` com `CALLERID(name)=numero`

2. **Configuração atual:**
   - IP: `192.168.1.10`
   - Ramal: `1501`
   - Grupo de discagem: (anote qual está configurado)

3. **O que já tentamos:**
   - Variáveis de canal: `CALLERID(name)`, `CALLERIDNAME`, `CALLERID(num)`
   - Múltiplos formatos de variáveis

4. **Pergunta:**
   - Como configurar para que o Caller ID Name mostre o número de destino?
   - Há alguma configuração no painel que precisa ser ajustada?
   - É possível fazer isso via API ou precisa ser no dialplan?

---

## 📝 Notas Técnicas

**Como funciona o Click-to-Call:**
1. Fortics chama o ramal (gsrc) - **Aqui o 3CXPhone recebe a chamada**
2. Depois conecta ao destino (gdst)
3. O Caller ID que o 3CXPhone vê é da chamada que chega no ramal
4. Pode ser que o Fortics sempre use o próprio sistema como Caller ID nessa primeira chamada

**Limitação possível:**
- O Fortics pode não permitir alterar o Caller ID da chamada que chega no ramal via variáveis de canal
- Pode ser necessário configurar no dialplan do Asterisk
- Ou pode ser uma limitação do sistema que não permite essa customização

---

## 🎯 Ação Imediata

1. ✅ **Acesse o painel Fortics** (`http://192.168.1.10`)
2. ✅ **Verifique "Discagem Rápida"** - procure opções de Caller ID
3. ✅ **Verifique o "Grupo de Discagem"** - procure configurações relevantes
4. ✅ **Capture screenshots** das telas relevantes
5. ✅ **Teste manualmente** via curl (comando acima)
6. ✅ **Me informe** o que encontrou

---

**🔍 COMECE AGORA: Acesse o painel e verifique as configurações!**

