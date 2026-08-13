import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { watchDriverRequests } from "../lib/firestore";
import { ACTIVE_STATUSES } from "../lib/businessRules";
import NavBar from "../components/NavBar";
import ReportBreakdownForm from "../components/ReportBreakdownForm";
import ActiveRequestPanel from "../components/ActiveRequestPanel";

export default function DriverDashboard() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const unsub = watchDriverRequests(profile.id, (list) => {
      setRequests(list);
      setLoading(false);
    });
    return unsub;
  }, [profile]);

  const activeRequest = requests.find((r) => ACTIVE_STATUSES.includes(r.status));

  return (
    <div className="min-h-screen bg-trust-50">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-display font-bold text-trust-900 mb-1">
          Hi {profile?.name?.split(" ")[0]}
        </h1>
        <p className="text-trust-500 mb-6">
          {activeRequest
            ? "Here's the status of your current breakdown request."
            : "Report a breakdown to get help from a nearby service provider."}
        </p>

        {loading ? (
          <p className="text-trust-400">Loading…</p>
        ) : activeRequest ? (
          <ActiveRequestPanel request={activeRequest} />
        ) : (
          <ReportBreakdownForm driverId={profile.id} />
        )}
      </main>
    </div>
  );
}
