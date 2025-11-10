import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import ClientDetail from "@/pages/ClientDetail";
import Funnel from "@/pages/Funnel";
import Tasks from "@/pages/Tasks";
import Audit from "@/pages/Audit";
import Reports from "@/pages/Reports";
import Import from "@/pages/Import";
import CallPopup from "@/components/CallPopup";
import { useCallPolling } from "@/hooks/useCallPolling";

function CallPopupWrapper() {
  const { user } = useAuth();
  const { callData, hasActiveCall, onTabulationComplete, isLoading } = useCallPolling();

  // Debug logs
  useEffect(() => {
    console.log("📋 CallPopupWrapper state:", {
      hasUser: !!user,
      hasActiveCall,
      hasCallData: !!callData,
      isLoading,
      callData: callData ? {
        protocolo: callData.protocolo,
        numero: callData.numero,
        nome: callData.nome,
      } : null,
    });
  }, [user, hasActiveCall, callData, isLoading]);

  // Garantir que o polling está ativo quando o usuário está logado
  useEffect(() => {
    if (user) {
      console.log("📋 Usuário logado detectado - polling deve estar ativo");
    }
  }, [user]);

  if (!user) {
    console.log("📋 CallPopupWrapper: Sem usuário");
    return null;
  }

  if (!hasActiveCall) {
    console.log("📋 CallPopupWrapper: Sem chamada ativa");
    return null;
  }

  if (!callData) {
    console.log("📋 CallPopupWrapper: Sem dados da chamada");
    return null;
  }

  console.log("📋 CallPopupWrapper: Renderizando popup");

  return (
    <CallPopup
      isOpen={hasActiveCall}
      onClose={() => {
        // Não permitir fechar sem tabular
        console.log("📋 Tentativa de fechar popup bloqueada");
      }}
      data={callData}
      onTabulationComplete={onTabulationComplete}
    />
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-900 dark:text-white">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Layout>{children}</Layout>
      <CallPopupWrapper />
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <Clients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/:id"
        element={
          <ProtectedRoute>
            <ClientDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/funnel"
        element={
          <ProtectedRoute>
            <Funnel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit"
        element={
          <ProtectedRoute>
            <Audit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/import"
        element={
          <ProtectedRoute>
            <Import />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "var(--toast-bg)",
                color: "var(--toast-color)",
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

