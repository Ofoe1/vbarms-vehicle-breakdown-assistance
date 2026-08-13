import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DriverDashboard from "./pages/DriverDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import History from "./pages/History";

function Home() {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (!profile) return <Navigate to="/login" replace />;
  return <Navigate to={profile.role === "provider" ? "/provider" : "/driver"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/driver" element={<ProtectedRoute role="driver"><DriverDashboard /></ProtectedRoute>} />
          <Route path="/driver/history" element={<ProtectedRoute role="driver"><History /></ProtectedRoute>} />

          <Route path="/provider" element={<ProtectedRoute role="provider"><ProviderDashboard /></ProtectedRoute>} />
          <Route path="/provider/history" element={<ProtectedRoute role="provider"><History /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
