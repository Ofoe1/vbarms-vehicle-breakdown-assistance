import { useState } from "react";
import { Power, Inbox, ShieldCheck } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useProviderAssignedRequests, useProviderProfile } from "../hooks/useFirestoreData";
import { ACTIVE_STATUSES } from "../lib/businessRules";
import NavBar from "../components/NavBar";
import RequestCard from "../components/RequestCard";
import DashboardSkeleton from "../components/DashboardSkeleton";

export default function ProviderDashboard() {
  const { profile } = useAuth();
  const toast = useToast();
  const { profile: providerProfile, loading: profileLoading } = useProviderProfile(profile?.id);
  const { requests, loading: requestsLoading } = useProviderAssignedRequests(profile?.id);
  const [savingAvailability, setSavingAvailability] = useState(false);

  async function toggleAvailability() {
    if (!providerProfile) return;
    setSavingAvailability(true);
    const next = providerProfile.availabilityStatus === "available" ? "unavailable" : "available";
    try {
      await updateProviderProfile(profile.id, { availabilityStatus: next });
    } finally {
      setSavingAvailability(false);
    }
  }

  async function toggleServiceType(type) {
    if (!providerProfile) return;
    const current = providerProfile.serviceTypes || [];
    const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
    await updateProviderProfile(profile.id, { serviceTypes: next });
  }

  const activeRequests = requests.filter((r) => ACTIVE_STATUSES.includes(r.status));
  const isAvailable = providerProfile?.availabilityStatus === "available";
  const completedCount = providerProfile?.completedJobsCount || 0;

  return (
    <div className="min-h-screen bg-trust-50">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-trust-900 mb-1">
              Hi {profile?.name?.split(" ")[0]}
            </h1>
            <p className="text-trust-500">Manage your availability and active assistance requests.</p>
          </div>
          {completedCount > 0 && (
            <span className="text-sm text-trust-500 flex items-center gap-1">
              <ShieldCheck size={15} className="text-status-completed" />
              <span className="font-semibold text-trust-700">{completedCount}</span> completed
            </span>
          )}
        </div>

        {profileLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display font-semibold text-trust-900">Availability</h2>
                <p className="text-sm text-trust-500">
                  {isAvailable ? "You're visible to drivers looking for assistance." : "You're hidden from drivers right now."}
                </p>
              </div>
              <button
                onClick={toggleAvailability}
                disabled={savingAvailability}
                className={`${isAvailable ? "btn-primary" : "btn-secondary"} flex items-center gap-1.5`}
              >
                <Power size={15} /> {isAvailable ? "Available" : "Unavailable"}
              </button>
            </div>

            <h3 className="text-sm font-medium text-trust-700 mb-2">Services you offer</h3>
            <div className="flex flex-wrap gap-2">
              {BREAKDOWN_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleServiceType(type)}
                  className={`text-sm px-3 py-1.5 rounded-full border ${
                    (providerProfile?.serviceTypes || []).includes(type)
                      ? "bg-hazard-50 border-hazard-500 text-hazard-700"
                      : "border-trust-300 text-trust-700"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="font-display font-semibold text-trust-900 mb-3">Active requests</h2>
          {requestsLoading ? (
            <DashboardSkeleton />
          ) : activeRequests.length === 0 ? (
            <div className="card p-8 text-center">
              <Inbox size={28} className="mx-auto text-trust-300 mb-2" />
              <p className="text-trust-400 text-sm">No active requests assigned to you right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeRequests.map((r) => (
                <RequestCard key={r.id} request={r} providerId={profile.id} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
