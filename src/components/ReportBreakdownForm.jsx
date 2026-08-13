import { useState } from "react";
import { createBreakdownRequest } from "../lib/firestore";
import { BREAKDOWN_TYPES } from "../lib/businessRules";

export default function ReportBreakdownForm({ driverId }) {
  const [breakdownType, setBreakdownType] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!breakdownType || !location.trim()) {
      setError("Breakdown type and location are required.");
      return;
    }
    setSubmitting(true);
    try {
      await createBreakdownRequest(driverId, { breakdownType, description, location: location.trim() });
      // Real-time listener on the dashboard will pick up the new request automatically.
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <h2 className="font-display font-semibold text-lg text-trust-900">Report a breakdown</h2>

      <div>
        <label className="field-label">Breakdown type</label>
        <select className="field-input" value={breakdownType} onChange={(e) => setBreakdownType(e.target.value)}>
          <option value="">Select type…</option>
          {BREAKDOWN_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label">Description (optional)</label>
        <textarea
          className="field-input"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Any extra detail that might help the provider"
        />
      </div>

      <div>
        <label className="field-label">Location</label>
        <input
          className="field-input"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Spintex Road, near Coca-Cola Roundabout"
        />
      </div>

      {error && <p className="error-text">{error}</p>}

      <button type="submit" disabled={submitting} className="btn-hazard w-full">
        {submitting ? "Submitting…" : "Submit report"}
      </button>
    </form>
  );
}
