import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const { firebaseUser, profile, loading } = useAuth();

  if (loading) return null;
  if (!firebaseUser) return <Navigate to="/login" replace />;
  if (role && profile?.role !== role) return <Navigate to="/" replace />;

  return children;
}
