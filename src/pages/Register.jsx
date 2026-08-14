import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { createUserProfile } from "../lib/firestore";
import { useToast } from "../contexts/ToastContext";
import { Shield } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "driver",
    phone: "",
  });
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      toast.addToast("Please fill in all required fields.", "error");
      return;
    }

    setBusy(true);
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      await createUserProfile(userCred.user.uid, formData);
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
              <Shield className="w-10 h-10 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold font-display text-trust-900">VBARMS</h1>
            <p className="text-sm text-trust-500 mt-1">Create your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Full name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={busy}
                className="field-input"
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label className="field-label">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={busy}
                className="field-input"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="field-label">Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={busy}
                className="field-input"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="field-label">I am a *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                disabled={busy}
                className="field-input"
                required
              >
                <option value="driver">Driver (need roadside help)</option>
                <option value="provider">Provider (offer roadside help)</option>
              </select>
            </div>

            <div>
              <label className="field-label">Phone (optional)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={busy}
                className="field-input"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? "Creating account…" : "Register"}
            </button>
          </form>

          <div className="text-center text-sm">
            <p className="text-trust-600">
              Already have an account?{" "}
              <Link to="/login" className="text-trust-700 font-semibold hover:text-trust-900">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
