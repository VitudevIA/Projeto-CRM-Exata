import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "@/services/supabase";
import { User, Session } from "@/types";
import api from "@/services/api";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef<User | null>(null);

  // Atualizar ref sempre que user mudar
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    // Verificar sessão existente
    checkSession();

    // Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session ? "has session" : "no session");
      
      // Se já temos um usuário no estado e a sessão mudou, não sobrescrever
      // Isso evita que o onAuthStateChange sobrescreva o estado que acabamos de definir
      // Usar ref para evitar stale closure
      if (session && !userRef.current) {
        console.log("Fetching user data from onAuthStateChange");
        await fetchUserData(session.access_token);
      } else if (!session) {
        console.log("No session, clearing user state");
        setUser(null);
        setSession(null);
        setLoading(false);
      } else {
        // Se já temos usuário e sessão, apenas garantir que loading está false
        console.log("User already set, ensuring loading is false");
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (currentSession) {
        await fetchUserData(currentSession.access_token);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error checking session:", error);
      setLoading(false);
    }
  };

  const fetchUserData = async (accessToken: string) => {
    try {
      const response = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setUser(response.data.user);
      setSession({
        access_token: accessToken,
        refresh_token: "",
        expires_at: undefined,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Não fazer logout automático se o endpoint não existir ainda
      // Isso permite que o usuário veja a tela de login
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting login for:", email);
      console.log("API base URL:", api.defaults.baseURL);
      console.log("Full URL will be:", `${api.defaults.baseURL}/auth/login`);
      
      const response = await api.post("/auth/login", { email, password });
      console.log("Login response full:", response);
      console.log("Login response data:", response.data);
      console.log("Login response user:", response.data?.user);
      console.log("Login response session:", response.data?.session);

      if (!response || !response.data) {
        console.error("Invalid response structure:", response);
        throw new Error("Resposta inválida do servidor");
      }

      const userData = response.data.user;
      const sessionData = response.data.session;

      if (!userData || !userData.id) {
        console.error("User data is missing or invalid:", userData);
        throw new Error("Dados do usuário não encontrados na resposta");
      }

      if (!sessionData || !sessionData.access_token) {
        console.error("Session data is missing or invalid:", sessionData);
        throw new Error("Dados de sessão não encontrados na resposta");
      }

      console.log("Setting user:", userData);
      console.log("Setting session:", sessionData);

      // Atualizar estado PRIMEIRO (antes de setSession no Supabase)
      // Isso garante que o ProtectedRoute veja o usuário imediatamente
      const userObject = {
        id: userData.id,
        email: userData.email,
        tenant_id: userData.tenant_id,
        role: userData.role,
        full_name: userData.full_name,
        phone: userData.phone,
        avatar_url: userData.avatar_url,
      };
      
      const sessionObject = {
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
        expires_at: sessionData.expires_at,
      };

      // Atualizar estado de forma síncrona ANTES de setSession
      setUser(userObject);
      setSession(sessionObject);
      setLoading(false); // IMPORTANTE: Setar loading como false após login bem-sucedido
      
      console.log("User and session set successfully (state updated)");
      console.log("Current user state:", userObject);
      console.log("Loading set to false");

      // Definir sessão no Supabase DEPOIS de atualizar o estado
      // Isso dispara o onAuthStateChange, mas o estado já está atualizado
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
      });

      if (sessionError) {
        console.error("Error setting session in Supabase:", sessionError);
        // Continuar mesmo se houver erro ao definir sessão no Supabase
        // O estado já foi atualizado acima
      } else {
        console.log("Session set in Supabase successfully");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage = error.response?.data?.error || error.message || "Erro ao fazer login";
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      await api.post("/auth/logout");
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error("Error signing out:", error);
      // Forçar logout mesmo se houver erro
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    }
  };

  const refreshSession = async () => {
    try {
      const {
        data: { session: newSession },
      } = await supabase.auth.refreshSession();

      if (newSession) {
        await fetchUserData(newSession.access_token);
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

