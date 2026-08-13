import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/"); // App.jsx redirects to the right dashboard based on role
    } catch (err) {
      setError("Couldn't log in. Check your email and password and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-trust-50 px-4">
      <div className="w-full max-w-md card p-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-3 h-3 rounded-sm bg-hazard-500" />
          <h1 className="text-xl font-bold text-trust-900">Log in to VBARMS</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Email</label>
            <input type="email" className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input type="password" className="field-input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p className="text-sm text-trust-500 mt-6 text-center">
          New to VBARMS?{" "}
          <Link to="/register" className="text-trust-700 font-medium hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
