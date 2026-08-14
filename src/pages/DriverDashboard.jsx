import { useAuth } from "../contexts/AuthContext";
import { useDriverRequests } from "../hooks/useFirestoreData";
import { ACTIVE_STATUSES } from "../lib/businessRules";
import NavBar from "../components/NavBar";
import ReportBreakdownForm from "../components/ReportBreakdownForm";
import ActiveRequestPanel from "../components/ActiveRequestPanel";
import DashboardSkeleton from "../components/DashboardSkeleton";

export default function DriverDashboard() {
  const { profile } = useAuth();
  const { requests, loading } = useDriverRequests(profile?.id);

  const activeRequest = requests.find((r) => ACTIVE_STATUSES.includes(r.status));
  const completedCount = requests.filter((r) => r.status === "Completed").length;

  return (
    <div className="min-h-screen bg-trust-50">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-end justify-between mb-1">
          <h1 className="text-2xl font-display font-bold text-trust-900">
            Hi {profile?.name?.split(" ")[0]}
          </h1>
          {completedCount > 0 && (
            <span className="text-sm text-trust-500">
              <span className="font-semibold text-trust-700">{completedCount}</span> past request{completedCount === 1 ? "" : "s"} completed
            </span>
          )}
        </div>
        <p className="text-trust-500 mb-6">
          {activeRequest
            ? "Here's the status of your current breakdown request."
            : "Report a breakdown to get help from a nearby service provider."}
        </p>

        {loading ? (
          <DashboardSkeleton />
        ) : activeRequest ? (
          <ActiveRequestPanel request={activeRequest} driverId={profile.id} />
        ) : (
          <ReportBreakdownForm driverId={profile.id} />
        )}
      </main>
    </div>
  );
}
