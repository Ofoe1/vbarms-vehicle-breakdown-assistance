import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ role, children }) {
  const { firebaseUser, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-trust-500">
        Loading…
      </div>
    );
  }
  if (!firebaseUser) return <Navigate to="/login" replace />;
  if (role && profile?.role !== role) {
    return <Navigate to={profile?.role === "provider" ? "/provider" : "/driver"} replace />;
  }
  return children;
}
