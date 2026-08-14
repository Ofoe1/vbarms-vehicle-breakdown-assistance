import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useToast } from "../contexts/ToastContext";
import { Shield } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      toast.addToast("Please fill in all fields.", "error");
      return;
    }
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.addToast("Welcome back!", "success");
      navigate("/");
    } catch (err) {
      toast.addToast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-trust-900 via-trust-800 to-trust-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8 space-y-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="w-10 h-10 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold font-display text-trust-900">VBARMS</h1>
            <p className="text-sm text-trust-500 mt-1">Roadside Assistance Matching</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                className="field-input"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="field-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
                className="field-input"
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="text-center text-sm">
            <p className="text-trust-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-trust-700 font-semibold hover:text-trust-900">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
