import { useState } from "react";
import { MapPin, Award, Users, Clock, AlertCircle } from "lucide-react";
import { assignProvider, cancelRequest } from "../lib/firestore";
import { STATUS, ACTIVE_STATUSES } from "../lib/businessRules";
import { useToast } from "../contexts/ToastContext";
import { useAvailableProviders } from "../hooks/useFirestoreData";
import { filterAndRankProviders, matchLabel } from "../lib/matching";
import StatusTimeline from "./StatusTimeline";

export default function ActiveRequestPanel({ request }) {
  const toast = useToast();
  const { providers } = useAvailableProviders(
    request.status === STATUS.REPORTED ? request.breakdownType : null
  );
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
      await cancelRequest(request.id);
      toast.success("Request cancelled.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-trust-900">{request.breakdownType}</h2>
            <p className="text-sm text-trust-500 flex items-center gap-1 mt-1">
              <MapPin size={14} className="text-trust-300" /> {request.location}
            </p>
          </div>
        </div>
        {request.details && (
          <p className="text-sm text-trust-600 mt-2 p-2 bg-trust-50 rounded">
            {request.details}
          </p>
        )}
      </div>

      {/* Status Timeline */}
      <StatusTimeline status={request.status} />

      {/* Provider Selection */}
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
                  {provider.serviceTypes && provider.serviceTypes.length > 0 && (
                    <p className="text-xs text-trust-400 mt-1">
                      Specializes in: {provider.serviceTypes.join(", ")}
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

      {/* No Providers Message */}
      {request.status === STATUS.REPORTED && ranked.length === 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">No available providers</p>
            <p className="text-xs text-blue-800 mt-1">
              We're searching for providers who specialize in {request.breakdownType}. Please wait…
            </p>
          </div>
        </div>
      )}

      {/* Awaiting Response */}
      {request.status === STATUS.ASSIGNED && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <Clock size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-900">Awaiting provider response</p>
            <p className="text-xs text-amber-800 mt-1">
              {request.assignedProvider} has been notified and will respond shortly.
            </p>
          </div>
        </div>
      )}

      {/* In Progress / Completed */}
      {ACTIVE_STATUSES.includes(request.status) && request.status !== STATUS.REPORTED && request.status !== STATUS.ASSIGNED && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-sm font-medium text-emerald-900">
            {request.status === STATUS.ACCEPTED
              ? "Provider is on the way"
              : "Assistance in progress"}
          </p>
        </div>
      )}
    </div>
  );
}
