import { useState } from "react";
import { MapPin, Clock, AlertCircle, CheckCircle, Users, Award } from "lucide-react";
import { assignProvider, cancelRequest } from "../lib/firestore";
import { STATUS } from "../lib/businessRules";
import { useToast } from "../contexts/ToastContext";
import { useAvailableProviders } from "../hooks/useFirestoreData";
import { filterAndRankProviders, matchLabel } from "../lib/matching";
import StatusTimeline from "./StatusTimeline";

export default function ActiveRequestPanel({ request, driverId }) {
  const toast = useToast();
  const { providers } = useAvailableProviders();
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  const ranked = filterAndRankProviders(providers, request.breakdownType);

  async function handleAssign() {
    if (!selected) {
      toast.error("Please select a provider.");
      return;
    }
    setBusy(true);
    try {
      await assignProvider(request.id, selected);
      toast.success("Provider assigned. Awaiting their response…");
      setSelected(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    setBusy(true);
    try {
      await cancelRequest(request.id, driverId);
      toast.success("Request cancelled.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-trust-900">{request.breakdownType}</h2>
        <p className="text-sm text-trust-500 flex items-center gap-1 mt-1">
          <MapPin size={14} className="text-trust-300" /> {request.location}
        </p>
        {request.description && (
          <p className="text-sm text-trust-600 mt-2 p-2 bg-trust-50 rounded">
            {request.description}
          </p>
        )}
      </div>

      <StatusTimeline status={request.status} />

      {request.status === STATUS.REPORTED && ranked.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-trust-900 flex items-center gap-2">
            <Users size={18} className="text-trust-400" /> Available providers
          </h3>
          <div className="space-y-2">
            {ranked.map((provider, idx) => (
              <label
                key={provider.id}
                className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${
                  selected === provider.id
                    ? "border-trust-600 bg-trust-50"
                    : "border-trust-200 hover:border-trust-300"
                }`}
              >
                <input
                  type="radio"
                  name="provider"
                  value={provider.id}
                  checked={selected === provider.id}
                  onChange={() => setSelected(provider.id)}
                  disabled={busy}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-trust-900">{provider.name}</span>
                    {matchLabel(provider, idx) && (
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          idx === 0
                            ? "bg-amber-100 text-amber-800"
                            : "bg-trust-100 text-trust-700"
                        }`}
                      >
                        {matchLabel(provider, idx)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-trust-500 flex items-center gap-1 mt-1">
                    <Award size={12} /> {provider.completedJobsCount || 0} completed jobs
                  </p>
                  {provider.serviceType && (
                    <p className="text-xs text-trust-400 mt-1">
                      Specialises in: {provider.serviceType}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAssign}
              disabled={!selected || busy}
              className="btn-primary flex-1"
            >
              {busy ? "Assigning…" : "Assign provider"}
            </button>
            <button onClick={handleCancel} disabled={busy} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </div>
      )}

      {request.status === STATUS.REPORTED && ranked.length === 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">No available providers</p>
            <p className="text-xs text-blue-800 mt-1">
              We're searching for providers who specialise in {request.breakdownType}. Please wait…
            </p>
          </div>
        </div>
      )}

      {request.status === STATUS.ASSIGNED && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <Clock size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-900">Provider responding</p>
            <p className="text-xs text-amber-800 mt-1">
              A qualified provider has been notified and will respond shortly.
            </p>
          </div>
        </div>
      )}

      {request.status === STATUS.ACCEPTED && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-sm font-medium text-emerald-900">Provider on the way</p>
        </div>
      )}

      {request.status === STATUS.IN_PROGRESS && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-sm font-medium text-emerald-900">Assistance in progress</p>
        </div>
      )}

      {request.status === STATUS.COMPLETED && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2">
          <CheckCircle size={16} className="text-emerald-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900">
            <p className="font-medium">Job completed</p>
            {request.completedAt && (
              <p className="text-emerald-800 mt-1">
                {new Date(request.completedAt.seconds * 1000).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}