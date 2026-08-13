import { useState } from "react";
import { respondToAssignment, updateRequestStatus } from "../lib/firestore";
import { STATUS } from "../lib/businessRules";
import StatusTimeline from "./StatusTimeline";

export default function RequestCard({ request, providerId }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function respond(accept) {
    setBusy(true); setError("");
    try {
      await respondToAssignment(request.id, accept);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function advance(toStatus) {
    setBusy(true); setError("");
    try {
      await updateRequestStatus(request.id, providerId, toStatus);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium text-trust-900">{request.breakdownType}</p>
          <p className="text-sm text-trust-500">{request.location}</p>
          {request.description && <p className="text-sm text-trust-400 mt-1">{request.description}</p>}
        </div>
      </div>

      <StatusTimeline status={request.status} />

      {error && <p className="error-text mt-3">{error}</p>}

      <div className="flex gap-2 mt-4">
        {request.status === STATUS.ASSIGNED && (
          <>
            <button onClick={() => respond(true)} disabled={busy} className="btn-primary flex-1">Accept</button>
            <button onClick={() => respond(false)} disabled={busy} className="btn-secondary flex-1">Reject</button>
          </>
        )}
        {request.status === STATUS.ACCEPTED && (
          <button onClick={() => advance(STATUS.IN_PROGRESS)} disabled={busy} className="btn-primary flex-1">
            Start assistance
          </button>
        )}
        {request.status === STATUS.IN_PROGRESS && (
          <button onClick={() => advance(STATUS.COMPLETED)} disabled={busy} className="btn-hazard flex-1">
            Mark completed
          </button>
        )}
      </div>
    </div>
  );
}
