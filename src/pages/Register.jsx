import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { createUserProfile, updateProviderProfile } from "../lib/firestore";
import { BREAKDOWN_TYPES } from "../lib/businessRules";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("driver");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceTypes, setServiceTypes] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggleServiceType(type) {
    setServiceTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError("Please fill in your name, email, and a password of at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await createUserProfile(cred.user.uid, { name: name.trim(), email: email.trim(), role, phone });
      if (role === "provider" && serviceTypes.length) {
        await updateProviderProfile(cred.user.uid, { serviceTypes });
      }
      navigate(role === "provider" ? "/provider" : "/driver");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-trust-50 px-4">
      <div className="w-full max-w-md card p-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-3 h-3 rounded-sm bg-hazard-500" />
          <h1 className="text-xl font-bold text-trust-900">Create your VBARMS account</h1>
        </div>

        <div className="flex rounded-lg border border-trust-300 overflow-hidden mb-6">
          {["driver", "provider"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 text-sm font-medium capitalize ${
                role === r ? "bg-trust-700 text-white" : "bg-white text-trust-700"
              }`}
            >
              {r === "driver" ? "I'm a Driver" : "I'm a Service Provider"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Full name</label>
            <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input type="email" className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input type="password" className="field-input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Phone (optional)</label>
            <input className="field-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          {role === "provider" && (
            <div>
              <label className="field-label">Services you offer</label>
              <div className="flex flex-wrap gap-2">
                {BREAKDOWN_TYPES.map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => toggleServiceType(type)}
                    className={`text-sm px-3 py-1.5 rounded-full border ${
                      serviceTypes.includes(type)
                        ? "bg-hazard-50 border-hazard-500 text-hazard-700"
                        : "border-trust-300 text-trust-700"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-trust-500 mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-trust-700 font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
