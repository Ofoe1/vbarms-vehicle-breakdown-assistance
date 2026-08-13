import { useEffect, useState } from "react";
import { watchAvailableProviders, assignProvider, cancelRequest } from "../lib/firestore";
import { STATUS, canCancel } from "../lib/businessRules";
import StatusTimeline from "./StatusTimeline";

export default function ActiveRequestPanel({ request }) {
  const [providers, setProviders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (request.status !== STATUS.REPORTED) return;
    const unsub = watchAvailableProviders(request.breakdownType, setProviders);
    return unsub;
  }, [request.status, request.breakdownType]);

  async function handleAssign() {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      await assignProvider(request.id, selected);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    setBusy(true);
    setError("");
    try {
      await cancelRequest(request.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display font-semibold text-lg text-trust-900">{request.breakdownType}</h2>
            <p className="text-sm text-trust-500">{request.location}</p>
          </div>
          {canCancel(request) && (
            <button onClick={handleCancel} disabled={busy} className="btn-secondary text-sm py-1.5 px-3">
              Cancel request
            </button>
          )}
        </div>
        <StatusTimeline status={request.status} />
        {error && <p className="error-text mt-3">{error}</p>}
      </div>

      {request.status === STATUS.REPORTED && (
        <div className="card p-6">
          <h3 className="font-display font-semibold text-trust-900 mb-1">Available providers</h3>
          <p className="text-sm text-trust-500 mb-4">Matching your breakdown type and currently available.</p>

          {providers.length === 0 ? (
            <p className="text-sm text-trust-400">No matching providers are available right now. Please check back shortly.</p>
          ) : (
            <div className="space-y-2 mb-4">
              {providers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    selected === p.id ? "border-hazard-500 bg-hazard-50" : "border-trust-200 hover:bg-trust-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-trust-900">{p.name || "Service Provider"}</span>
                    <span className="text-xs bg-status-completed/10 text-status-completed px-2 py-0.5 rounded-full">
                      Available
                    </span>
                  </div>
                  <p className="text-xs text-trust-500 mt-0.5">
                    {(p.serviceTypes || []).join(", ") || "General assistance"}
                  </p>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleAssign}
            disabled={!selected || busy}
            className="btn-primary w-full"
          >
            {busy ? "Assigning…" : "Assign selected provider"}
          </button>
        </div>
      )}
    </div>
  );
}
