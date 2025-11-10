# 📋 Guia: Como Acessar Configurações do Fortics PBX

**IP do seu Fortics:** `192.168.1.10`  
**Ramal:** `1501`

---

## 🌐 Passo 1: Acessar o Painel Web do Fortics

### 1.1 Abrir o Navegador

**Abra seu navegador e acesse:**
```
http://192.168.1.10
```

**OU se tiver porta específica:**
```
http://192.168.1.10:8080
http://192.168.1.10:9090
```

**Dica:** Tente também `https://192.168.1.10` se não funcionar com HTTP.

---

### 1.2 Fazer Login

**Você precisará:**
- **Usuário/Login:** (geralmente `admin` ou seu usuário)
- **Senha:** (sua senha de administrador)

**Se não souber as credenciais:**
- Verifique com o administrador do sistema
- Ou use as mesmas credenciais do 3CXPhone (pode funcionar)

---

## 🔧 Passo 2: Navegar até "Discagem Rápida"

### 2.1 Menu Principal

**Após fazer login, procure por:**

1. **Menu:** `PBX` ou `Sistema` ou `Configurações`
2. **Submenu:** `Cadastro` ou `Configurações`
3. **Item:** `Serviços` ou `Integrações`
4. **Opção:** `Discagem Rápida` ou `Click-to-Call`

**Caminho completo (pode variar):**
```
PBX > Cadastro > Serviços > Discagem Rápida
```

**OU:**
```
Sistema > Configurações > Serviços > Discagem Rápida
```

**OU:**
```
Integrações > Discagem Rápida
```

---

### 2.2 O Que Você Deve Ver

**Na tela de "Discagem Rápida", você deve ver:**

1. **Chave de Integração:**
   - Campo mostrando: `lispbx@123` (sua chave atual)
   - ✅ Isso já está configurado corretamente!

2. **Grupo de Discagem:**
   - Dropdown ou campo selecionando um grupo
   - ⚠️ **IMPORTANTE:** Verifique qual grupo está selecionado

3. **Configurações de Roteamento:**
   - Opções de roteamento interno/externo
   - ⚠️ **CRÍTICO:** Verifique se há opção para "Rota Externa" ou "Chamadas Externas"

---

## 📞 Passo 3: Verificar Configuração do Grupo de Discagem

### 3.1 Acessar Grupos de Discagem

**Procure por:**
```
PBX > Cadastro > Grupos de Discagem
```

**OU:**
```
Sistema > Roteamento > Grupos de Discagem
```

---

### 3.2 Verificar o Grupo Selecionado

**Na tela de "Discagem Rápida", anote:**
- Qual grupo de discagem está selecionado?
- Exemplo: `DLPN_default`, `Grupo_Externo`, `Default`, etc.

**Depois, vá até esse grupo e verifique:**

1. **Troncos Configurados:**
   - ✅ Há tronco externo configurado?
   - ✅ Qual tronco está sendo usado?

2. **Rotas:**
   - ✅ Há rota para números externos?
   - ✅ A rota externa está habilitada?

3. **Padrões de Discagem:**
   - ✅ Como os números externos são formatados?
   - ✅ Precisa de prefixo? (ex: `0`, `9`, `55`)

---

## 🔍 Passo 4: Verificar Troncos Externos

### 4.1 Acessar Troncos

**Procure por:**
```
PBX > Cadastro > Troncos
```

**OU:**
```
Sistema > Troncos > Troncos SIP
```

---

### 4.2 Verificar Troncos Externos

**Verifique:**
- ✅ Há tronco externo configurado?
- ✅ O tronco está ativo?
- ✅ O tronco está associado ao grupo de discagem?

**Se não houver tronco externo:**
- ⚠️ **PROBLEMA IDENTIFICADO!**
- Você precisa configurar um tronco externo
- Entre em contato com o administrador ou fornecedor do Fortics

---

## 📋 Passo 5: Testar Discagem Manual

### 5.1 Teste no 3CXPhone

**No seu 3CXPhone (que já está configurado):**

1. **Discar manualmente:** `85997185855`
   - Funciona? → Anote o formato usado
   - Não funciona? → Continue testando

2. **Se não funcionar, tente:**
   - `085997185855` (com 0)
   - `985997185855` (com 9)
   - `5585997185855` (com código do país)

3. **Anote qual formato funciona!**

---

### 5.2 Teste na API Fortics

**Abra o terminal (PowerShell ou CMD) e teste:**

```bash
# Teste 1: Formato atual (11 dígitos)
curl "http://192.168.1.10/lispbx/lisintegra.php?gacao=discar&gkey=lispbx@123&gsrc=1501&gdst=85997185855&gresponse=json"

# Teste 2: Com 0 inicial (12 dígitos)
curl "http://192.168.1.10/lispbx/lisintegra.php?gacao=discar&gkey=lispbx@123&gsrc=1501&gdst=085997185855&gresponse=json"

# Teste 3: Com código do país (13 dígitos)
curl "http://192.168.1.10/lispbx/lisintegra.php?gacao=discar&gkey=lispbx@123&gsrc=1501&gdst=5585997185855&gresponse=json"
```

**Compare os resultados:**
- Qual formato faz a chamada ir para o celular?
- Qual formato faz a chamada ir para o ramal?

---

## 📸 O Que Capturar (Screenshots)

**Para me ajudar a diagnosticar, capture screenshots de:**

1. ✅ **Tela de "Discagem Rápida":**
   - Mostra a chave de integração
   - Mostra o grupo de discagem selecionado
   - Mostra opções de configuração

2. ✅ **Tela do "Grupo de Discagem":**
   - Mostra os troncos configurados
   - Mostra as rotas
   - Mostra padrões de discagem

3. ✅ **Tela de "Troncos":**
   - Mostra os troncos disponíveis
   - Mostra quais estão ativos
   - Mostra configurações dos troncos

---

## 🎯 Informações que Preciso

**Após acessar o painel, me informe:**

### 1. Configuração de Discagem Rápida
- [ ] Qual grupo de discagem está selecionado?
- [ ] Há opção de "Rota Externa"?
- [ ] Está habilitada ou desabilitada?

### 2. Grupo de Discagem
- [ ] Qual grupo está sendo usado?
- [ ] Há tronco externo configurado?
- [ ] A rota externa está habilitada?

### 3. Troncos
- [ ] Há tronco externo configurado?
- [ ] O tronco está ativo?
- [ ] Qual o nome do tronco?

### 4. Teste Manual
- [ ] Qual formato funciona no 3CXPhone?
- [ ] Precisa de prefixo?
- [ ] Funciona discar manualmente?

---

## 🔧 Se Não Conseguir Acessar

**Se não conseguir acessar o painel web:**

1. **Verifique o IP:**
   - Confirme que `192.168.1.10` está correto
   - Tente ping: `ping 192.168.1.10`

2. **Verifique a porta:**
   - Tente diferentes portas: `:8080`, `:9090`, `:80`, `:443`

3. **Verifique credenciais:**
   - Use as mesmas do 3CXPhone
   - Ou contate o administrador

4. **Acesse via servidor:**
   - Se o Fortics estiver em um servidor, acesse diretamente no servidor
   - Ou use acesso remoto (RDP, SSH, etc.)

---

## 📞 Próximos Passos

**Após coletar as informações:**

1. ✅ Me envie os screenshots
2. ✅ Me informe as respostas do checklist
3. ✅ Me informe qual formato funciona no teste manual

**Com essas informações, posso:**
- Identificar exatamente o problema
- Ajustar o código se necessário
- Fornecer instruções específicas para corrigir

---

## 🚨 Dica Importante

**Baseado nas configurações do seu 3CXPhone:**
- ✅ IP do Fortics: `192.168.1.10` (confirmado)
- ✅ Ramal: `1501` (confirmado)
- ✅ Está na mesma rede local

**O problema provavelmente é:**
- ⚠️ Grupo de discagem sem rota externa
- ⚠️ Tronco externo não configurado
- ⚠️ Formato do número precisa de prefixo

**Acesse o painel e verifique essas configurações!**

---

**🔍 COMECE AGORA: Acesse http://192.168.1.10 e siga os passos acima!**


