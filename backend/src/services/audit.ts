import { supabaseAdmin } from "../config/supabase.js";
import type { AuthRequest } from "../middleware/auth.js";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "view"
  | "export"
  | "login"
  | "logout"
  | "permission_change";

export async function createAuditLog(
  req: AuthRequest,
  action: AuditAction,
  entityType: string,
  entityId?: string,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>
) {
  try {
    if (!req.user) return;

    const clientIp = req.ip || req.socket.remoteAddress;
    const userAgent = req.get("user-agent");

    await supabaseAdmin.rpc("create_audit_log", {
      p_tenant_id: req.user.tenant_id,
      p_user_id: req.user.id,
      p_action: action,
      p_entity_type: entityType,
      p_entity_id: entityId || null,
      p_old_values: oldValues || null,
      p_new_values: newValues || null,
    });

    // Also insert directly if RPC fails
    await supabaseAdmin.from("audit_logs").insert({
      tenant_id: req.user.tenant_id,
      user_id: req.user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: clientIp,
      user_agent: userAgent,
    });
  } catch (error) {
    console.error("Error creating audit log:", error);
    // Don't throw - audit logs shouldn't break the main flow
  }
}

