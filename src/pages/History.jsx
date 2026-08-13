import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { watchDriverRequests, watchProviderAssignedRequests } from "../lib/firestore";
import { STATUS } from "../lib/businessRules";
import NavBar from "../components/NavBar";

const CLOSED = [STATUS.COMPLETED, STATUS.CANCELLED];

export default function History() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!profile) return;
    const watcher = profile.role === "provider" ? watchProviderAssignedRequests : watchDriverRequests;
    const unsub = watcher(profile.id, setRequests);
    return unsub;
  }, [profile]);

  const closed = requests.filter((r) => CLOSED.includes(r.status));

  return (
    <div className="min-h-screen bg-trust-50">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-display font-bold text-trust-900 mb-6">History</h1>

        {closed.length === 0 ? (
          <p className="text-trust-400">No completed or cancelled requests yet.</p>
        ) : (
          <div className="space-y-2">
            {closed.map((r) => (
              <div key={r.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-trust-900">{r.breakdownType}</p>
                  <p className="text-sm text-trust-500">{r.location}</p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium text-white ${
                    r.status === STATUS.COMPLETED ? "bg-status-completed" : "bg-status-cancelled"
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
