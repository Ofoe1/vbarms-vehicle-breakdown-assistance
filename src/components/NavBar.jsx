import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

export default function NavBar() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut(auth);
    navigate("/login");
  }

  const homePath = profile?.role === "provider" ? "/provider" : "/driver";

  return (
    <header className="border-b border-trust-100 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to={homePath} className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-hazard-500" />
          <span className="font-display font-bold text-trust-900 tracking-tight">VBARMS</span>
        </Link>
        {profile && (
          <div className="flex items-center gap-4 text-sm">
            {profile.role === "driver" && (
              <>
                <Link to="/driver" className="text-trust-700 hover:text-trust-900">Dashboard</Link>
                <Link to="/driver/history" className="text-trust-700 hover:text-trust-900">History</Link>
              </>
            )}
            {profile.role === "provider" && (
              <>
                <Link to="/provider" className="text-trust-700 hover:text-trust-900">Dashboard</Link>
                <Link to="/provider/history" className="text-trust-700 hover:text-trust-900">History</Link>
              </>
            )}
            <span className="text-trust-300">|</span>
            <span className="text-trust-700">{profile.name}</span>
            <button onClick={handleLogout} className="btn-secondary py-1.5 px-3 text-sm">
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
