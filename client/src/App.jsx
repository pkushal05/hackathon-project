import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import FleetMap from "./pages/FleetMap";
import Buses from "./pages/Buses";
import Maintenance from "./pages/Maintenance";
import Parts from "./pages/Parts";
import Services from "./pages/Services";
import Forecast from "./pages/Forecast";
import AboutPage from "./pages/About";
import AuthPage from "./pages/Auth";
import AdminApprovals from "./pages/AdminApprovals";
import { authApi, getStoredToken, setStoredToken } from "./api/client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30000 },
  },
});

export default function App() {
  const [authState, setAuthState] = useState({
    isChecking: true,
    token: getStoredToken(),
    user: null,
  });

  useEffect(() => {
    let mounted = true;

    async function hydrateUserSession() {
      const token = getStoredToken();
      if (!token) {
        if (mounted) {
          setAuthState({ isChecking: false, token: "", user: null });
        }
        return;
      }

      try {
        const response = await authApi.me();
        if (mounted) {
          setAuthState({
            isChecking: false,
            token,
            user: response.data,
          });
        }
      } catch {
        setStoredToken("");
        if (mounted) {
          setAuthState({ isChecking: false, token: "", user: null });
        }
      }
    }

    const onUnauthorized = () => {
      setStoredToken("");
      queryClient.clear();
      setAuthState({ isChecking: false, token: "", user: null });
    };

    window.addEventListener("auth:unauthorized", onUnauthorized);
    hydrateUserSession();

    return () => {
      mounted = false;
      window.removeEventListener("auth:unauthorized", onUnauthorized);
    };
  }, []);

  const handleAuthenticated = ({ token, user }) => {
    setStoredToken(token);
    setAuthState({ isChecking: false, token, user });
  };

  const handleLogout = () => {
    setStoredToken("");
    queryClient.clear();
    setAuthState({ isChecking: false, token: "", user: null });
  };

  if (authState.isChecking) {
    return (
      <div className="auth-shell">
        <div className="auth-card">Checking session...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {!authState.token ? (
          <Routes>
            <Route
              path="/auth"
              element={<AuthPage onAuthenticated={handleAuthenticated} />}
            />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        ) : (
          <Layout user={authState.user} onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/fleet-map" element={<FleetMap />} />
              <Route path="/buses" element={<Buses />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/parts" element={<Parts />} />
              <Route path="/services" element={<Services />} />
              <Route path="/forecast" element={<Forecast />} />
              <Route
                path="/admin/approvals"
                element={
                  authState.user?.role === "admin" ? (
                    <AdminApprovals />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route path="/about" element={<AboutPage />} />
              <Route
                path="/settings"
                element={<Navigate to="/about" replace />}
              />
              <Route path="/auth" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        )}
      </BrowserRouter>
    </QueryClientProvider>
  );
}
