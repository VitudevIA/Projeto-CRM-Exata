# Documentação da API

## Autenticação

Todas as rotas (exceto `/api/auth/login` e `/api/auth/register`) requerem autenticação via Bearer Token no header:

```
Authorization: Bearer <token>
```

## Endpoints

### Autenticação

#### POST /api/auth/login
Login de usuário.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "tenant_id": "uuid",
    "role": "admin"
  },
  "session": {
    "access_token": "token",
    "refresh_token": "token",
    "expires_at": 1234567890
  }
}
```

#### POST /api/auth/logout
Logout do usuário atual.

#### GET /api/auth/me
Retorna informações do usuário autenticado.

### Clientes

#### GET /api/clients
Lista clientes com paginação e filtros.

**Query Params:**
- `search`: Busca por nome, CPF ou telefone
- `stage_id`: Filtrar por estágio
- `status`: Filtrar por status (ativo, perdido, contratado)
- `assigned_to`: Filtrar por responsável
- `page`: Número da página (default: 1)
- `limit`: Itens por página (default: 50)

#### GET /api/clients/:id
Busca cliente por ID.

#### POST /api/clients
Cria novo cliente.

**Body:**
```json
{
  "cpf": "12345678900",
  "name": "João Silva",
  "phone": "11999999999",
  "is_whatsapp": true,
  "email": "joao@example.com"
}
```

#### PUT /api/clients/:id
Atualiza cliente.

#### DELETE /api/clients/:id
Deleta cliente (apenas admin).

#### POST /api/clients/:id/mark-lost
Marca cliente como perdido.

**Body:**
```json
{
  "loss_reason_id": "uuid",
  "observations": "Observações sobre a perda"
}
```

#### GET /api/clients/:id/history
Busca histórico de interações do cliente.

### Estágios

#### GET /api/stages
Lista todos os estágios do funil.

#### GET /api/stages/:id
Busca estágio por ID.

#### POST /api/stages
Cria novo estágio (apenas admin).

#### PUT /api/stages/:id
Atualiza estágio (apenas admin).

#### DELETE /api/stages/:id
Deleta estágio (apenas admin).

#### GET /api/stages/loss-reasons/:stage_type
Lista motivos de perda por tipo de estágio.

### Tarefas

#### GET /api/tasks
Lista tarefas com filtros.

**Query Params:**
- `status`: Filtrar por status
- `assigned_to`: Filtrar por responsável
- `client_id`: Filtrar por cliente
- `due_date_from`: Data inicial
- `due_date_to`: Data final

#### GET /api/tasks/:id
Busca tarefa por ID.

#### POST /api/tasks
Cria nova tarefa.

#### PUT /api/tasks/:id
Atualiza tarefa.

#### DELETE /api/tasks/:id
Deleta tarefa.

### Propostas

#### GET /api/proposals
Lista propostas.

#### GET /api/proposals/:id
Busca proposta por ID.

#### POST /api/proposals
Cria nova proposta.

#### PUT /api/proposals/:id
Atualiza proposta.

#### DELETE /api/proposals/:id
Deleta proposta.

### Documentos

#### POST /api/documents/upload
Upload de documento.

**Form Data:**
- `file`: Arquivo (imagem ou PDF)
- `client_id`: ID do cliente
- `document_type`: Tipo do documento

#### GET /api/documents/client/:client_id
Lista documentos de um cliente.

#### GET /api/documents/:id/download
Download de documento.

#### DELETE /api/documents/:id
Deleta documento.

### Chamadas

#### GET /api/calls
Lista chamadas.

#### GET /api/calls/:id
Busca chamada por ID.

#### POST /api/calls/click-to-call
Inicia chamada via click-to-call.

**Body:**
```json
{
  "phone_number": "11999999999",
  "client_id": "uuid"
}
```

#### PUT /api/calls/:id/tabulation
Atualiza tabulação da chamada.

**Body:**
```json
{
  "tabulation": "Sem Interesse",
  "notes": "Observações",
  "client_id": "uuid"
}
```

#### POST /api/calls/webhook
Webhook do discador (não requer autenticação normal).

### Relatórios

#### GET /api/reports/conversion
Relatório de conversão por estágio.

#### GET /api/reports/productivity
Relatório de produtividade por operador.

#### GET /api/reports/loss-reasons
Relatório de motivos de perda.

#### GET /api/reports/tabulation
Relatório de tabulação.

### Importação

#### POST /api/import/preview
Preview de arquivo antes de importar.

#### POST /api/import/leads
Importa leads em massa (CSV ou Excel).

## Códigos de Status

- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Erro de validação
- `401`: Não autenticado
- `403`: Acesso negado
- `404`: Não encontrado
- `500`: Erro interno do servidor

