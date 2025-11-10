import axios from "axios";
import { supabase } from "./supabase";

// Sempre usar requisições relativas - o vercel.json faz o rewrite para /api/index
// Isso funciona tanto em desenvolvimento (proxy do Vite) quanto em produção (rewrite da Vercel)
const isDevelopment = import.meta.DEV;
const baseURL = "/api";

console.log("API URL configured:", baseURL);
console.log("Environment:", isDevelopment ? "development" : "production");

export const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 segundos de timeout (chamadas podem demorar)
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  async (config) => {
    try {
      // Não buscar sessão para requisições de login
      if (config.url?.includes("/auth/login") || config.url?.includes("/auth/register")) {
        return config;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.error("Error in request interceptor:", error);
      // Continuar mesmo se houver erro
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data,
    });

    if (error.response?.status === 401) {
      // Token expirado, fazer logout (mas não para login)
      if (!error.config?.url?.includes("/auth/login")) {
        await supabase.auth.signOut();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

