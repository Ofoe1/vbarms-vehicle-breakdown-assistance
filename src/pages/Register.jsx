import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
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

  async function handleGoogleSignUp() {
    setBusy(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Create profile for new Google user
      await createUserProfile(user.uid, {
        name: user.displayName || "User",
        email: user.email,
        role: formData.role, // Use selected role from form
      });

      toast.addToast("Account created! Welcome to VBARMS.", "success");
      navigate("/");
    } catch (err) {
      console.error("Google sign-up error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        toast.addToast("Google sign-up cancelled.", "info");
      } else if (err.code === "auth/account-exists-with-different-credential") {
        toast.addToast("This email is already registered. Please log in instead.", "error");
      } else {
        toast.addToast(err.message || "Google sign-up failed", "error");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-trust-900 via-trust-800 to-trust-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="w-10 h-10 text-hazard-500" />
            </div>
            <h1 className="text-2xl font-bold font-display text-trust-900">VBARMS</h1>
            <p className="text-sm text-trust-500 mt-1">Create your account</p>
          </div>

          {/* Email Sign-Up Form */}
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

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-trust-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-trust-500">Or sign up with</span>
            </div>
          </div>

          {/* Google Sign-Up Button */}
          <button
            onClick={handleGoogleSignUp}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-trust-200 rounded-lg hover:bg-trust-50 transition font-medium text-trust-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {busy ? "Signing up…" : "Sign up with Google"}
          </button>

          {/* Log In Link */}
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
