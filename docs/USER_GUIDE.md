# Guia do Usuário - CRM Crédito Consignado

## Primeiros Passos

### Login

1. Acesse a aplicação
2. Digite seu email e senha
3. Clique em "Entrar"

### Dashboard

O dashboard mostra:
- **Total de Clientes**: Número total de clientes cadastrados
- **Clientes Ativos**: Clientes com status ativo
- **Taxa de Conversão**: Percentual de conversão
- **Carteira de Oportunidades**: Valor total das propostas em aberto
- **Clientes Recentes**: Últimos clientes cadastrados
- **Tarefas de Hoje**: Tarefas agendadas para hoje

## Gestão de Clientes

### Cadastrar Novo Cliente

1. Vá em **Clientes** no menu
2. Clique em **Novo Cliente**
3. Preencha os campos obrigatórios:
   - CPF
   - Nome
   - Telefone
   - Marque se é WhatsApp
4. Preencha campos opcionais se necessário
5. Clique em **Criar**

### Buscar Cliente

1. Na página de Clientes, use a barra de busca
2. Digite nome, CPF ou telefone
3. Os resultados aparecerão automaticamente

### Editar Cliente

1. Na lista de clientes, clique no ícone de editar
2. Modifique os campos desejados
3. Clique em **Atualizar**

### Ver Detalhes do Cliente

1. Clique no ícone de visualizar na lista
2. Você verá:
   - Informações completas do cliente
   - Histórico de interações
   - Status e estágio atual
   - Opções para simular crédito ou marcar como perdido

### Ligar para Cliente (Click-to-Call)

1. Na lista de clientes, clique no ícone de telefone
2. A chamada será iniciada automaticamente
3. Um painel aparecerá durante a ligação

## Funil de Vendas

### Visualizar Funil

1. Vá em **Funil** no menu
2. Você verá os estágios em colunas:
   - Lead
   - Qualificação
   - Análise
   - Proposta
   - Contratação
   - Ganho/Perdido

### Mover Cliente entre Estágios

1. Arraste o card do cliente de uma coluna para outra
2. Se mover para "Perdido", será solicitado o motivo da perda
3. Preencha o motivo e observações
4. Clique em **Confirmar**

## Tarefas

### Criar Tarefa

1. Vá em **Tarefas** no menu
2. Clique em **Nova Tarefa**
3. Preencha:
   - Título (obrigatório)
   - Descrição (opcional)
   - Status
   - Prioridade
   - Data de vencimento
   - Cliente associado (opcional)
4. Clique em **Criar**

### Completar Tarefa

1. Na lista de tarefas, clique no ícone de check
2. A tarefa será marcada como concluída automaticamente

### Filtrar Tarefas

Use o filtro de status na parte superior da página.

## Simulador de Crédito

### Usar Simulador

1. Durante uma ligação ou na página de detalhes do cliente
2. Clique em **Simular Crédito**
3. Preencha:
   - Valor do Empréstimo
   - Taxa de Juros (% a.m.)
   - Número de Parcelas
4. Clique em **Calcular**
5. Veja o resultado com valor da parcela e total a pagar

## Relatórios

### Ver Relatórios

1. Vá em **Relatórios** no menu
2. Selecione o tipo de relatório:
   - **Conversão**: Taxa de conversão por estágio
   - **Produtividade**: Performance por operador
   - **Motivos de Perda**: Análise de perdas
   - **Tabulação**: Distribuição de tabulações
3. Selecione o período (data inicial e final)
4. Os dados serão exibidos automaticamente

### Exportar Relatórios

1. Após visualizar um relatório
2. Clique em **Excel** ou **PDF**
3. O arquivo será baixado

## Importação em Massa

### Importar Leads

1. Vá em **Importar** no menu
2. Clique em **Selecionar Arquivo**
3. Escolha um arquivo CSV ou Excel
4. O sistema fará um preview automático
5. Revise os dados
6. Clique em **Confirmar Importação**
7. Veja o resultado com estatísticas

### Formato do Arquivo

O arquivo deve conter as seguintes colunas:
- `cpf` ou `CPF`
- `name` ou `nome` ou `Nome`
- `phone` ou `telefone` ou `Telefone`
- `email` ou `Email` (opcional)
- `lead_source` ou `origem` ou `Origem` (opcional)

## Tabulação de Chamadas

### Durante uma Ligação

1. Quando uma chamada é recebida ou iniciada, um painel aparece
2. O painel mostra:
   - Nome do cliente (se identificado)
   - Número de telefone
   - Tempo de duração
3. Ao encerrar, clique em **Encerrar**
4. Preencha a tabulação:
   - Selecione uma opção (Sem Interesse, Interessado, etc.)
   - Associe a um cliente (se necessário)
   - Adicione observações
5. Clique em **Salvar Tabulação**

## Auditoria (Apenas Admins)

### Ver Logs de Auditoria

1. Vá em **Auditoria** no menu (apenas para admins)
2. Use os filtros para buscar:
   - Por ação (criar, atualizar, deletar, etc.)
   - Por tipo de entidade
   - Por período
3. Veja quem fez o quê e quando

## Dicas

- Use a busca para encontrar clientes rapidamente
- Arraste e solte no funil para mover clientes rapidamente
- Use o simulador durante as ligações para fechar mais vendas
- Revise os relatórios regularmente para identificar gargalos
- Importe leads em massa para acelerar o cadastro

## Suporte

Para dúvidas ou problemas, entre em contato com o administrador do sistema.

