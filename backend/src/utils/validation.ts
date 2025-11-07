import { z } from "zod";

// CPF validation
export function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, "");

  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleanCPF)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
}

// Phone validation (Brazilian format)
export function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, "");
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

// Schemas
export const clientSchema = z.object({
  cpf: z.string().refine(validateCPF, "CPF inválido"),
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phone: z.string().refine(validatePhone, "Telefone inválido"),
  is_whatsapp: z.boolean().default(false),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().optional(),
  state: z.string().length(2).optional(),
  address: z.string().optional(),
  zip_code: z.string().optional(),
  birth_date: z.string().optional(),
  registration_number: z.string().optional(),
  nis_pis: z.string().optional(),
  organization: z.string().optional(),
  available_margin: z.number().positive().optional(),
  lead_source: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
});

export const taskSchema = z.object({
  client_id: z.string().uuid().optional(),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).default("pending"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  due_date: z.string().datetime().optional(),
  assigned_to: z.string().uuid().optional(),
});

export const proposalSchema = z.object({
  client_id: z.string().uuid(),
  loan_amount: z.number().positive("Valor deve ser positivo"),
  interest_rate: z.number().positive("Taxa deve ser positiva"),
  installments: z.number().int().positive("Número de parcelas deve ser positivo"),
  installment_value: z.number().positive("Valor da parcela deve ser positivo"),
  status: z.enum(["draft", "sent", "accepted", "rejected", "expired"]).default("draft"),
  notes: z.string().optional(),
  expires_at: z.string().datetime().optional(),
});

