import { useState } from "react";
import { Power, Inbox, ShieldCheck } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useProviderAssignedRequests } from "../hooks/useFirestoreData";
import { ACTIVE_STATUSES, STATUS } from "../lib/businessRules";
import NavBar from "../components/NavBar";
import RequestCard from "../components/RequestCard";
import DashboardSkeleton from "../components/DashboardSkeleton";

export default function ProviderDashboard() {
  const { profile } = useAuth();
  const { requests, loading } = useProviderAssignedRequests(profile?.id);

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
              <span className="font-semibold text-trust-700">{completedCount}</span> job{completedCount === 1 ? "" : "s"} completed
            </span>
          )}
        </div>
        <p className="text-trust-500 mb-6">
          {activeRequest
            ? "Here's your current assignment."
            : "No active jobs right now. You'll be notified when a match arrives."}
        </p>

        {activeRequest ? (
          <RequestCard request={activeRequest} providerId={profile?.id} />
        ) : (
          <div className="card p-8 text-center">
            <p className="text-trust-500">Waiting for breakdown reports…</p>
          </div>
        )}
      </main>
    </div>
  );
}
