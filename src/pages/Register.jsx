import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { createUserProfile } from "../lib/firestore";
import { useToast } from "../contexts/ToastContext";
import { Shield, Mail, Lock, User, LogIn } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "driver",
  });
  const [busy, setBusy] = useState(false);

  async function handleEmailSignUp(e) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.addToast("Please fill in all fields.", "error");
      return;
    }

    setBusy(true);
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      await createUserProfile(userCred.user.uid, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      });
      toast.addToast("Account created! Welcome to VBARMS.", "success");
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
              <Shield className="w-10 h-10 text-hazard-500" />
            </div>
            <h1 className="text-2xl font-bold font-display text-trust-900">VBARMS</h1>
            <p className="text-sm text-trust-500 mt-1">Create your account</p>
          </div>

          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div>
              <label className="field-label">Full name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-trust-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={busy}
                  className="field-input pl-9"
                  placeholder="Your name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="field-label">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-trust-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={busy}
                  className="field-input pl-9"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="field-label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-trust-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={busy}
                  className="field-input pl-9"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="field-label">I am a:</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                disabled={busy}
                className="field-input"
                required
              >
                <option value="driver">Driver (need roadside help)</option>
                <option value="provider">Service Provider (offer help)</option>
              </select>
            </div>

            <button type="submit" disabled={busy} className="btn-primary w-full flex items-center justify-center gap-2">
              <LogIn size={16} />
              {busy ? "Creating account…" : "Create account"}
            </button>
          </form>

          <div className="text-center text-sm">
            <p className="text-trust-600">
              Already have an account?{" "}
              <Link to="/login" className="text-trust-700 font-semibold hover:text-trust-900">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}