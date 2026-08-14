import { useAuth } from "../contexts/AuthContext";
import { useDriverRequests } from "../hooks/useFirestoreData";
import { ACTIVE_STATUSES, STATUS } from "../lib/businessRules";
import NavBar from "../components/NavBar";
import ActiveRequestPanel from "../components/ActiveRequestPanel";
import ReportBreakdownForm from "../components/ReportBreakdownForm";
import DashboardSkeleton from "../components/DashboardSkeleton";

export default function DriverDashboard() {
  const { profile } = useAuth();
  const { requests, loading } = useDriverRequests(profile?.id);

  if (loading) return <DashboardSkeleton />;

  const activeRequest = requests.find((r) => ACTIVE_STATUSES.includes(r.status));
  const completedCount = requests.filter((r) => r.status === STATUS.COMPLETED).length;

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
              <span className="font-semibold text-trust-700">{completedCount}</span> request{completedCount === 1 ? "" : "s"} completed
            </span>
          )}
        </div>
        <p className="text-trust-500 mb-6">
          {activeRequest
            ? "We're finding the best provider for you."
            : "No active requests. Report a breakdown to get started."}
        </p>

        {activeRequest ? (
          <ActiveRequestPanel request={activeRequest} />
        ) : (
          <ReportBreakdownForm driverId={profile?.id} />
        )}
      </main>
    </div>
  );
}
