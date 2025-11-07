// User types
export interface User {
  id: string;
  email: string;
  tenant_id: string;
  role: "admin" | "funcionario";
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}

// Client types
export type ClientStageType =
  | "lead"
  | "qualificacao"
  | "analise"
  | "proposta"
  | "contratacao"
  | "perdido"
  | "ganho";

export type ClientStatus = "ativo" | "perdido" | "contratado";

export interface Client {
  id: string;
  tenant_id: string;
  cpf: string;
  name: string;
  phone: string;
  is_whatsapp: boolean;
  email?: string;
  city?: string;
  state?: string;
  address?: string;
  zip_code?: string;
  birth_date?: string;
  registration_number?: string;
  nis_pis?: string;
  organization?: string;
  available_margin?: number;
  current_stage_id?: string;
  status: ClientStatus;
  loss_reason_id?: string;
  loss_observations?: string;
  loss_date?: string;
  lead_source?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

// Stage types
export interface ClientStage {
  id: string;
  tenant_id: string;
  name: string;
  stage_type: ClientStageType;
  order_index: number;
  color?: string;
  created_at: string;
  updated_at: string;
}

// Loss reason types
export interface LossReason {
  id: string;
  tenant_id: string;
  stage_type: ClientStageType;
  reason: string;
  description?: string;
  order_index: number;
  created_at: string;
}

// Task types
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  tenant_id: string;
  client_id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  completed_at?: string;
  assigned_to?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Proposal types
export type ProposalStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

export interface Proposal {
  id: string;
  tenant_id: string;
  client_id: string;
  loan_amount: number;
  interest_rate: number;
  installments: number;
  installment_value: number;
  status: ProposalStatus;
  notes?: string;
  sent_at?: string;
  expires_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Call log types
export type CallStatus = "initiated" | "answered" | "no_answer" | "busy" | "failed";
export type CallDirection = "inbound" | "outbound";

export interface CallLog {
  id: string;
  tenant_id: string;
  client_id?: string;
  call_id?: string;
  direction: CallDirection;
  status: CallStatus;
  phone_number: string;
  duration_seconds?: number;
  recording_url?: string;
  tabulation?: string;
  notes?: string;
  operator_id?: string;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

// History types
export type InteractionType =
  | "call"
  | "email"
  | "meeting"
  | "note"
  | "stage_change"
  | "document_upload"
  | "proposal_created"
  | "task_created"
  | "task_completed";

export interface ClientHistory {
  id: string;
  tenant_id: string;
  client_id: string;
  interaction_type: InteractionType;
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
  created_by?: string;
  created_at: string;
}

// Document types
export type DocumentType =
  | "rg"
  | "cpf"
  | "comprovante_renda"
  | "comprovante_residencia"
  | "declaracao"
  | "outro";

export interface Document {
  id: string;
  tenant_id: string;
  client_id: string;
  document_type: DocumentType;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by?: string;
  created_at: string;
}

