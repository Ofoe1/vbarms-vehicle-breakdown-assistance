import { useState } from "react";
import { MapPin, Award, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { respondToAssignment, updateRequestStatus } from "../lib/firestore";
import { STATUS } from "../lib/businessRules";
import { useToast } from "../contexts/ToastContext";
import StatusTimeline from "./StatusTimeline";

export default function RequestCard({ request, providerId }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function respond(accept) {
    setBusy(true);
    try {
      await respondToAssignment(request.id, accept);
      toast.success(accept ? "Job accepted!" : "Job declined.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function advance(toStatus) {
    setBusy(true);
    try {
      await updateRequestStatus(request.id, providerId, toStatus);
      toast.success(`Status updated to ${toStatus}.`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  const isProvider = !!providerId;

  return (
    <div className="card p-6 space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-trust-900">{request.breakdownType}</h3>
        <p className="text-sm text-trust-500 flex items-center gap-1 mt-1">
          <MapPin size={14} className="text-trust-300" />
          {request.location}
        </p>
        {request.details && (
          <p className="text-xs text-trust-600 mt-2 p-2 bg-trust-50 rounded">
            {request.details}
          </p>
        )}
      </div>

      {/* Status Timeline */}
      <StatusTimeline status={request.status} />

      {/* Provider Actions (if viewing as assigned provider) */}
      {isProvider && request.status === STATUS.ASSIGNED && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-medium text-blue-900 mb-3">Respond to assignment:</p>
          <div className="flex gap-2">
            <button
              onClick={() => respond(true)}
              disabled={busy}
              className="btn-primary flex-1 text-sm py-2"
            >
              {busy ? "Processing…" : "Accept job"}
            </button>
            <button
              onClick={() => respond(false)}
              disabled={busy}
              className="btn-secondary flex-1 text-sm py-2"
            >
              {busy ? "Processing…" : "Decline"}
            </button>
          </div>
        </div>
      )}

      {/* Provider Progress Actions */}
      {isProvider && request.status === STATUS.ACCEPTED && (
        <button
          onClick={() => advance(STATUS.IN_PROGRESS)}
          disabled={busy}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Clock size={16} />
          {busy ? "Updating…" : "Start assistance"}
        </button>
      )}

      {isProvider && request.status === STATUS.IN_PROGRESS && (
        <button
          onClick={() => advance(STATUS.COMPLETED)}
          disabled={busy}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <CheckCircle size={16} />
          {busy ? "Completing…" : "Mark as completed"}
        </button>
      )}

      {/* Completed State */}
      {request.status === STATUS.COMPLETED && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2">
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

      {/* Cancelled State */}
      {request.status === STATUS.CANCELLED && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="text-red-700 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-900 font-medium">This request was cancelled</p>
        </div>
      )}
    </div>
  );
}
