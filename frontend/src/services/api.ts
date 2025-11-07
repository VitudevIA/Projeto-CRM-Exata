import axios from "axios";
import { supabase } from "./supabase";

// Em desenvolvimento, usar proxy do Vite (requisição relativa)
// Em produção, usar a URL completa
const isDevelopment = import.meta.DEV;
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Se estiver em desenvolvimento, usar proxy do Vite (requisição relativa)
// Se estiver em produção, usar a URL completa
const baseURL = isDevelopment ? "/api" : `${apiUrl}/api`;

console.log("API URL configured:", baseURL);
console.log("Environment:", isDevelopment ? "development" : "production");

export const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 segundos de timeout
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

