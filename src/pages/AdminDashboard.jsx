import { useState, useEffect } from "react";
import { BarChart3, Users, TrendingUp, AlertCircle, Zap } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import NavBar from "../components/NavBar";
import DashboardSkeleton from "../components/DashboardSkeleton";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Count active requests
        const requestsSnap = await getDocs(collection(db, "requests"));
        const requests = requestsSnap.docs.map((d) => ({ ...d.data() }));

        // Count drivers
        const driversSnap = await getDocs(
          query(collection(db, "users"), where("role", "==", "driver"))
        );

        // Count providers
        const providersSnap = await getDocs(
          query(collection(db, "users"), where("role", "==", "provider"))
        );

        // Calculate request stats
        const activeCount = requests.filter((r) =>
          ["Reported", "Assigned", "Accepted", "In progress"].includes(r.status)
        ).length;
        const completedCount = requests.filter((r) => r.status === "Completed").length;
        const cancelledCount = requests.filter((r) => r.status === "Cancelled").length;

        // Average completion time (if timestamps exist)
        const completedRequests = requests.filter((r) => r.status === "Completed" && r.createdAt && r.completedAt);
        const avgTimeMs = completedRequests.length > 0
          ? completedRequests.reduce((sum, r) => {
              const created = r.createdAt.seconds || 0;
              const completed = r.completedAt.seconds || 0;
              return sum + (completed - created);
            }, 0) / completedRequests.length
          : 0;
        const avgTimeHours = (avgTimeMs / 3600).toFixed(1);

        setStats({
          totalRequests: requests.length,
          activeRequests: activeCount,
          completedRequests: completedCount,
          cancelledRequests: cancelledCount,
          totalDrivers: driversSnap.size,
          totalProviders: providersSnap.size,
          avgCompletionHours: avgTimeHours,
          successRate: completedCount > 0
            ? ((completedCount / (completedCount + cancelledCount)) * 100).toFixed(1)
            : "N/A",
        });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-trust-50">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-trust-900">Admin Dashboard</h1>
          <p className="text-trust-500 mt-1">System overview and metrics</p>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : error ? (
          <div className="card p-6 bg-red-50 border border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Error loading stats</p>
                <p className="text-sm text-red-800 mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="card p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-trust-500 font-medium">Active Requests</p>
                    <p className="text-3xl font-bold text-trust-900 mt-2">
                      {stats.activeRequests}
                    </p>
                  </div>
                  <Zap size={24} className="text-amber-400" />
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-trust-500 font-medium">Total Completed</p>
                    <p className="text-3xl font-bold text-trust-900 mt-2">
                      {stats.completedRequests}
                    </p>
                  </div>
                  <TrendingUp size={24} className="text-emerald-600" />
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-trust-500 font-medium">Success Rate</p>
                    <p className="text-3xl font-bold text-trust-900 mt-2">
                      {stats.successRate}%
                    </p>
                  </div>
                  <BarChart3 size={24} className="text-trust-600" />
                </div>
              </div>
            </div>

            {/* Users & Requests */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="card p-6">
                <h2 className="font-bold text-trust-900 mb-4 flex items-center gap-2">
                  <Users size={18} className="text-trust-400" /> User Base
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-trust-600">Drivers</span>
                    <span className="font-semibold text-trust-900">{stats.totalDrivers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-trust-600">Providers</span>
                    <span className="font-semibold text-trust-900">{stats.totalProviders}</span>
                  </div>
                  <div className="border-t border-trust-200 pt-3 flex items-center justify-between">
                    <span className="text-trust-600 font-medium">Total Users</span>
                    <span className="font-semibold text-trust-900">
                      {stats.totalDrivers + stats.totalProviders}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="font-bold text-trust-900 mb-4 flex items-center gap-2">
                  <BarChart3 size={18} className="text-trust-400" /> Request Summary
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-trust-600">Total Requests</span>
                    <span className="font-semibold text-trust-900">{stats.totalRequests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-trust-600">Cancelled</span>
                    <span className="font-semibold text-red-600">{stats.cancelledRequests}</span>
                  </div>
                  <div className="border-t border-trust-200 pt-3 flex items-center justify-between">
                    <span className="text-trust-600 font-medium">Avg Completion Time</span>
                    <span className="font-semibold text-trust-900">{stats.avgCompletionHours}h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="card p-6 bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium">Real-time metrics</p>
                  <p className="mt-1">
                    Stats refresh on page load. For live updates, integrate Firebase Realtime Database or Cloud Functions.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}