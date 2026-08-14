import { useAuth } from "../contexts/AuthContext";
import { useDriverRequests, useProviderAssignedRequests } from "../hooks/useFirestoreData";
import NavBar from "../components/NavBar";
import RequestCard from "../components/RequestCard";
import DashboardSkeleton from "../components/DashboardSkeleton";

export default function History() {
  const { profile } = useAuth();
  const driverRequests = useDriverRequests(profile?.role === "driver" ? profile?.id : null);
  const providerRequests = useProviderAssignedRequests(profile?.role === "provider" ? profile?.id : null);

  const { requests, loading } = profile?.role === "driver" ? driverRequests : providerRequests;
  const completed = requests.filter((r) => r.status === "Completed");

  return (
    <div className="min-h-screen bg-trust-50">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-display font-bold text-trust-900 mb-1">History</h1>
        <p className="text-trust-500 mb-6">
          {completed.length === 0
            ? "No completed requests yet."
            : `${completed.length} completed request${completed.length === 1 ? "" : "s"}`}
        </p>

        {loading ? (
          <DashboardSkeleton />
        ) : completed.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-trust-400">Nothing to show here yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completed.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
