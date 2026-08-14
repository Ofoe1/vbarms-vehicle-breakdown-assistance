import { Link, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, History as HistoryIcon, Shield } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function NavBar() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut(auth);
    navigate("/login");
  }

  const homePath = profile?.role === "provider" ? "/provider" : "/driver";

  return (
    <header className="border-b border-trust-100 bg-white shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to={homePath} className="flex items-center gap-2 hover:opacity-80 transition">
          <Shield className="w-5 h-5 text-trust-700" />
          <span className="font-bold text-trust-900 tracking-tight">VBARMS</span>
        </Link>
        {profile && (
          <div className="flex items-center gap-5 text-sm">
            <nav className="flex items-center gap-4">
              <Link
                to={homePath}
                className="text-trust-700 hover:text-trust-900 flex items-center gap-1 transition"
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
              <Link
                to={`${homePath}/history`}
                className="text-trust-700 hover:text-trust-900 flex items-center gap-1 transition"
              >
                <HistoryIcon size={16} />
                <span>History</span>
              </Link>
            </nav>
            <div className="h-6 w-px bg-trust-200" />
            <span className="text-trust-700 font-medium">{profile.name}</span>
            <button
              onClick={handleLogout}
              className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 whitespace-nowrap"
            >
              <LogOut size={14} />
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
