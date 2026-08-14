import { useState } from "react";
import { MapPin, Check, X, PlayCircle, Flag } from "lucide-react";
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
      await respondToAssignment(request.id, providerId, accept);
      toast.success(accept ? "Request accepted." : "Request declined.");
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

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium text-trust-900">{request.breakdownType}</p>
          <p className="text-sm text-trust-500 flex items-center gap-1">
            <MapPin size={13} className="text-trust-300" /> {request.location}
          </p>
          {request.description && <p className="text-sm text-trust-400 mt-1">{request.description}</p>}
        </div>
      </div>

      <StatusTimeline status={request.status} />

     <div className="flex gap-2 mt-4">
        {request.status === STATUS.ASSIGNED && (
          <>
            <button onClick={() => respond(true)} disabled={busy} className="btn-primary flex-1 flex items-center justify-center gap-1.5">
              <Check size={15} /> Accept
            </button>
            <button onClick={() => respond(false)} disabled={busy} className="btn-secondary flex-1 flex items-center justify-center gap-1.5">
              <X size={15} /> Reject
            </button>
          </>
        )}
        {request.status === STATUS.ACCEPTED && (
          <button onClick={() => advance(STATUS.IN_PROGRESS)} disabled={busy} className="btn-primary flex-1 flex items-center justify-center gap-1.5">
            <PlayCircle size={15} /> Start assistance
          </button>
        )}
        {request.status === STATUS.IN_PROGRESS && (
          <button onClick={() => advance(STATUS.COMPLETED)} disabled={busy} className="btn-hazard flex-1 flex items-center justify-center gap-1.5">
            <Flag size={15} /> Mark completed
          </button>
        )}
      </div>
    </div>
  );
}