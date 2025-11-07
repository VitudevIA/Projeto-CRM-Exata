import { Router, Request, Response } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { authenticate, AuthRequest } from "../middleware/auth.js";

const router = Router();

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const {
      data: { user, session },
      error,
    } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !user || !session) {
      console.error("Auth error:", error);
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    console.log("User authenticated in Supabase Auth:", user.id, user.email);

    // Buscar informações adicionais do usuário
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    console.log("User data query result:", { userData, userError });

    // Se o usuário não existe na tabela users, retornar erro
    if (userError || !userData) {
      console.error("User not found in database:", {
        userId: user.id,
        userEmail: user.email,
        error: userError,
      });
      return res.status(403).json({ 
        error: "Usuário não encontrado no sistema. Entre em contato com o administrador." 
      });
    }

    console.log("User found in database:", userData.email, userData.tenant_id);

    // Buscar role do usuário separadamente
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("tenant_id", userData.tenant_id)
      .single();

    console.log("Role query result:", { roleData, roleError });

    const role = roleData?.role || "funcionario";

    // Atualizar last_login
    await supabaseAdmin
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id);

    if (!userData.tenant_id) {
      console.error("User has no tenant_id:", user.id);
      return res.status(403).json({ 
        error: "Usuário não está associado a um tenant. Entre em contato com o administrador." 
      });
    }

    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        tenant_id: userData.tenant_id,
        role: role,
        full_name: userData.full_name,
      },
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
      },
    };

    console.log("Sending login response:", {
      userId: responseData.user.id,
      email: responseData.user.email,
      tenantId: responseData.user.tenant_id,
      role: responseData.user.role,
      hasSession: !!responseData.session.access_token,
    });

    res.json(responseData);
  } catch (error: any) {
    console.error("Login error:", error);
    console.error("Error stack:", error?.stack);
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      name: error?.name,
    });
    
    // Retornar mensagem de erro mais específica
    const errorMessage = error?.message || "Erro ao fazer login";
    const statusCode = error?.status || error?.statusCode || 500;
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === "development" ? error?.stack : undefined
    });
  }
});

// Registro (apenas para admins criar novos usuários)
router.post("/register", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Apenas administradores podem criar usuários" });
    }

    const { email, password, full_name, role, tenant_id } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: "Email, senha e nome são obrigatórios" });
    }

    const targetTenantId = tenant_id || req.user.tenant_id;

    // Criar usuário no Supabase Auth
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !user) {
      return res.status(400).json({ error: "Erro ao criar usuário" });
    }

    // Criar registro na tabela users
    const { error: userError } = await supabaseAdmin.from("users").insert({
      id: user.id,
      tenant_id: targetTenantId,
      email: user.email || email,
      full_name,
    });

    if (userError) {
      // Rollback: deletar usuário do auth
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      return res.status(400).json({ error: "Erro ao criar perfil do usuário" });
    }

    // Criar role
    const userRole = role || "funcionario";
    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
      tenant_id: targetTenantId,
      user_id: user.id,
      role: userRole,
    });

    if (roleError) {
      console.error("Error creating role:", roleError);
    }

    res.status(201).json({
      message: "Usuário criado com sucesso",
      user: {
        id: user.id,
        email: user.email,
        full_name,
        role: userRole,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
});

// Logout
router.post("/logout", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7);

    if (token) {
      await supabaseAdmin.auth.admin.signOut(token);
    }

    res.json({ message: "Logout realizado com sucesso" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Erro ao fazer logout" });
  }
});

// Verificar sessão atual
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", req.user!.id)
      .single();

    if (!userData) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Buscar role do usuário separadamente
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", req.user!.id)
      .eq("tenant_id", userData.tenant_id)
      .single();

    const role = roleData?.role || "funcionario";

    res.json({
      user: {
        id: req.user!.id,
        email: req.user!.email,
        tenant_id: req.user!.tenant_id,
        role: role,
        full_name: userData?.full_name,
        phone: userData?.phone,
        avatar_url: userData?.avatar_url,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ error: "Erro ao buscar dados do usuário" });
  }
});

// Recuperação de senha
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email é obrigatório" });
    }

    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CORS_ORIGIN || "http://localhost:5173"}/reset-password`,
    });

    if (error) {
      return res.status(400).json({ error: "Erro ao enviar email de recuperação" });
    }

    res.json({ message: "Email de recuperação enviado" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Erro ao processar solicitação" });
  }
});

// Reset de senha
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token e senha são obrigatórios" });
    }

    const { error } = await supabaseAdmin.auth.updateUser({
      password: password,
    });

    if (error) {
      return res.status(400).json({ error: "Erro ao redefinir senha" });
    }

    res.json({ message: "Senha redefinida com sucesso" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Erro ao processar solicitação" });
  }
});

// 2FA - Iniciar setup
router.post("/2fa/setup", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // O Supabase Auth gerencia 2FA via TOTP
    // Esta rota pode ser usada para iniciar o processo
    res.json({ message: "Use o cliente Supabase para configurar 2FA" });
  } catch (error) {
    console.error("2FA setup error:", error);
    res.status(500).json({ error: "Erro ao configurar 2FA" });
  }
});

export default router;

