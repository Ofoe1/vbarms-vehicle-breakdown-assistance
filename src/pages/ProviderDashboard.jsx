import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  watchProviderProfile, updateProviderProfile, watchProviderAssignedRequests,
} from "../lib/firestore";
import { ACTIVE_STATUSES, BREAKDOWN_TYPES } from "../lib/businessRules";
import NavBar from "../components/NavBar";
import RequestCard from "../components/RequestCard";

export default function ProviderDashboard() {
  const { profile } = useAuth();
  const [providerProfile, setProviderProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [savingAvailability, setSavingAvailability] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const unsub1 = watchProviderProfile(profile.id, setProviderProfile);
    const unsub2 = watchProviderAssignedRequests(profile.id, setRequests);
    return () => { unsub1(); unsub2(); };
  }, [profile]);

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

  return (
    <div className="min-h-screen bg-trust-50">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-trust-900 mb-1">
            Hi {profile?.name?.split(" ")[0]}
          </h1>
          <p className="text-trust-500">Manage your availability and active assistance requests.</p>
        </div>

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
              className={isAvailable ? "btn-primary" : "btn-secondary"}
            >
              {isAvailable ? "Available" : "Unavailable"}
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

        <div>
          <h2 className="font-display font-semibold text-trust-900 mb-3">Active requests</h2>
          {activeRequests.length === 0 ? (
            <p className="text-trust-400 text-sm">No active requests assigned to you right now.</p>
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
