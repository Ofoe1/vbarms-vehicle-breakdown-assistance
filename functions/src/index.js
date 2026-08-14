const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();n
const db = admin.firestore();

/**
 * HTTP Cloud Function: Get admin dashboard stats
 * Called by AdminDashboard.jsx
 * Returns: { totalRequests, activeRequests, completedRequests, ... }
 */
exports.getAdminStats = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated."
    );
  }

  // Check if user is admin
  const userDoc = await db.collection("users").doc(context.auth.uid).get();
  if (!userDoc.exists || userDoc.data().role !== "admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only admins can access this data."
    );
  }

  try {
    // Fetch all requests
    const requestsSnap = await db.collection("breakdownRequests").get();
    const requests = requestsSnap.docs.map((d) => d.data());

    // Fetch all drivers
    const driversSnap = await db
      .collection("users")
      .where("role", "==", "driver")
      .get();

    // Fetch all providers
    const providersSnap = await db
      .collection("users")
      .where("role", "==", "provider")
      .get();

    // Calculate stats
    const activeCount = requests.filter((r) =>
      ["Reported", "Assigned", "Accepted", "In progress"].includes(r.status)
    ).length;

    const completedCount = requests.filter((r) => r.status === "Completed").length;
    const cancelledCount = requests.filter((r) => r.status === "Cancelled").length;

    // Average completion time
    const completedRequests = requests.filter(
      (r) => r.status === "Completed" && r.createdAt && r.completedAt
    );

    const avgTimeSeconds =
      completedRequests.length > 0
        ? completedRequests.reduce((sum, r) => {
            const created = r.createdAt.seconds || 0;
            const completed = r.completedAt.seconds || 0;
            return sum + (completed - created);
          }, 0) / completedRequests.length
        : 0;

    const avgTimeHours = (avgTimeSeconds / 3600).toFixed(1);

    const successRate =
      completedCount > 0
        ? ((completedCount / (completedCount + cancelledCount)) * 100).toFixed(1)
        : "N/A";

    return {
      totalRequests: requests.length,
      activeRequests: activeCount,
      completedRequests: completedCount,
      cancelledRequests: cancelledCount,
      totalDrivers: driversSnap.size,
      totalProviders: providersSnap.size,
      avgCompletionHours: avgTimeHours,
      successRate: successRate,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error calculating stats:", error);
    throw new functions.https.HttpsError("internal", "Failed to calculate stats.");
  }
});