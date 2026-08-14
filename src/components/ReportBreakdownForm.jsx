import { useState } from "react";
import { AlertCircle, MapPin, FileText } from "lucide-react";
import { createRequest } from "../lib/firestore";
import { BREAKDOWN_TYPES } from "../lib/businessRules";
import { useToast } from "../contexts/ToastContext";

export default function ReportBreakdownForm({ driverId }) {
  const toast = useToast();
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!type || !location) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setBusy(true);
    try {
      await createRequest({
        driverId,
        breakdownType: type,
        location,
        details: details || null,
        status: "Reported",
      });
      toast.success("Breakdown reported. Waiting for provider match…");
      setType("");
      setLocation("");
      setDetails("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <AlertCircle size={18} className="text-blue-600 flex-shrink-0" />
        <p className="text-sm text-blue-900">
          Describe your breakdown. We'll match you with the most qualified provider.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-trust-900 mb-2">
          Breakdown type *
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled={busy}
          className="input w-full"
          required
        >
          <option value="">Select a type…</option>
          {BREAKDOWN_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-trust-900 mb-2 flex items-center gap-1">
          <MapPin size={16} className="text-trust-400" /> Location *
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="E.g. Malawi, M1 junction 5"
          disabled={busy}
          className="input w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-trust-900 mb-2 flex items-center gap-1">
          <FileText size={16} className="text-trust-400" /> Additional details
        </label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Any extra info (e.g. car make/model, strange noises)?"
          disabled={busy}
          rows={3}
          className="input w-full resize-none"
        />
      </div>

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? "Reporting…" : "Report breakdown"}
      </button>
    </form>
  );
}
