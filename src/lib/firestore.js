import { 
  doc, setDoc, collection, query, where, onSnapshot, updateDoc, serverTimestamp,
  addDoc, getDoc, getDocs, runTransaction, increment, writeBatch
} from "firebase/firestore";
import { db } from "../firebase";
import { canCreateNewRequest, isValidTransition, STATUS } from "./businessRules";
import { filterAndRankProviders } from "./matching";

// ---------- Users / role profiles ----------

export async function createUserProfile(uid, { name, email, role, phone }) {
  await setDoc(doc(db, "users", uid), {
    name,
    email,
    role,
    phone: phone || null,
    createdAt: serverTimestamp(),
    ...(role === "provider" && {
      availabilityStatus: "available",
      serviceTypes: [],
      completedJobsCount: 0,
      averageRating: 0,
    }),
  });
}

export function watchProviderProfile(uid, cb) {
  const ref = doc(db, "users", uid);
  return onSnapshot(ref, (snap) => {
    cb(snap.exists() ? snap.data() : null);
  });
}

export async function updateProviderProfile(uid, data) {
  await updateDoc(doc(db, "users", uid), data);
}

export function watchAvailableProviders(breakdownType, cb) {
  const ref = query(
    collection(db, "users"),
    where("role", "==", "provider"),
    where("availabilityStatus", "==", "available")
  );
  return onSnapshot(ref, (snap) => {
    const providers = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(providers);
  });
}

// ---------- Breakdown requests (Driver side) ----------

export function watchDriverRequests(driverId, cb) {
  const q = query(collection(db, "breakdownRequests"), where("driverId", "==", driverId));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    cb(list);
  });
}

export async function createBreakdownRequest(driverId, { breakdownType, location, details }) {
  // BR-01: enforce client-side (mirrored in firestore.rules)
  const existingSnap = await getDocs(
    query(collection(db, "breakdownRequests"), where("driverId", "==", driverId))
  );
  const existing = existingSnap.docs.map((d) => d.data());
  if (!canCreateNewRequest(existing)) {
    throw new Error("You already have an active breakdown request. Complete or cancel it before reporting a new one.");
  }

  // Create the request in Reported status
  const ref = await addDoc(collection(db, "breakdownRequests"), {
    driverId,
    breakdownType,
    location,
    details: details || null,
    status: STATUS.REPORTED,
    assignedProviderId: null,
    declinedProviderIds: [], // Track providers who declined
    createdAt: serverTimestamp(),
  });

  // Trigger automatic matching via Cloud Function or immediate matching
  await autoMatchProvider(ref.id, breakdownType, driverId);

  return ref.id;
}

export async function createRequest(data) {
  return createBreakdownRequest(data.driverId, {
    breakdownType: data.breakdownType,
    location: data.location,
    details: data.details,
  });
}

async function autoMatchProvider(requestId, breakdownType, driverId) {
  try {
    // Fetch all available providers
    const providersSnap = await getDocs(
      query(
        collection(db, "users"),
        where("role", "==", "provider"),
        where("availabilityStatus", "==", "available")
      )
    );
    const providers = providersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Get the request to check declined list
    const reqSnap = await getDoc(doc(db, "breakdownRequests", requestId));
    const request = reqSnap.data();
    const declinedIds = request.declinedProviderIds || [];

    // Filter out declined providers and rank the rest
    const available = providers.filter((p) => !declinedIds.includes(p.id));
    const ranked = filterAndRankProviders(available, breakdownType);

    if (ranked.length === 0) {
      // No available providers left — request stays in Reported state
      console.warn(`No available providers for request ${requestId}`);
      return;
    }

    // Assign the top-ranked provider
    const topProvider = ranked[0];
    await assignProvider(requestId, topProvider.id);
  } catch (err) {
    console.error("Auto-match failed:", err);
  }
}

export async function assignProvider(requestId, providerId) {
  const reqRef = doc(db, "breakdownRequests", requestId);
  const userRef = doc(db, "users", providerId);

  await runTransaction(db, async (tx) => {
    const reqSnap = await tx.get(reqRef);
    if (!reqSnap.exists()) throw new Error("Request not found.");
    const request = reqSnap.data();

    if (!isValidTransition(request.status, STATUS.ASSIGNED)) {
      throw new Error(`Cannot assign a provider from status "${request.status}".`);
    }

    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) throw new Error("Provider not found.");
    const provider = userSnap.data();

    // BR-02: provider must not already be on an active request
    if (provider.availabilityStatus !== "available") {
      throw new Error("Selected provider is already handling another active request.");
    }

    tx.update(reqRef, {
      assignedProviderId: providerId,
      status: STATUS.ASSIGNED,
      assignedAt: serverTimestamp(),
    });
    tx.update(userRef, { availabilityStatus: "busy" });
  });

  // Log the assignment
  await addDoc(collection(db, "assignments"), {
    requestId,
    providerId,
    assignedAt: serverTimestamp(),
    acceptedAt: null,
    declinedAt: null,
    completedAt: null,
  });
}

export async function cancelRequest(requestId) {
  const reqRef = doc(db, "breakdownRequests", requestId);
  const reqSnap = await getDoc(reqRef);
  if (!reqSnap.exists()) throw new Error("Request not found.");
  const request = reqSnap.data();

  if (!isValidTransition(request.status, STATUS.CANCELLED)) {
    throw new Error(`Cannot cancel a request that is already "${request.status}".`);
  }
  await updateDoc(reqRef, { status: STATUS.CANCELLED, cancelledAt: serverTimestamp() });

  // Free up the provider if one had already been assigned
  if (request.assignedProviderId) {
    await updateDoc(doc(db, "users", request.assignedProviderId), { availabilityStatus: "available" });
  }
}

// ---------- Breakdown requests (Provider side) ----------

export function watchProviderAssignedRequests(providerId, cb) {
  const q = query(collection(db, "breakdownRequests"), where("assignedProviderId", "==", providerId));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    cb(list);
  });
}

export async function respondToAssignment(requestId, providerId, accept) {
  const reqRef = doc(db, "breakdownRequests", requestId);
  const reqSnap = await getDoc(reqRef);
  if (!reqSnap.exists()) throw new Error("Request not found.");
  const request = reqSnap.data();

  // BR-03: Only the assigned provider can respond
  if (request.assignedProviderId !== providerId) {
    throw new Error("Only the assigned provider can respond to this assignment.");
  }

  if (accept) {
    // Accept the job
    if (!isValidTransition(request.status, STATUS.ACCEPTED)) {
      throw new Error(`Cannot accept a request from status "${request.status}".`);
    }
    await updateDoc(reqRef, { status: STATUS.ACCEPTED, acceptedAt: serverTimestamp() });

    // Log acceptance
    const assignmentSnap = await getDocs(
      query(collection(db, "assignments"), where("requestId", "==", requestId))
    );
    if (assignmentSnap.size > 0) {
      await updateDoc(assignmentSnap.docs[0].ref, { acceptedAt: serverTimestamp() });
    }
  } else {
    // Decline the job: add provider to declined list and reassign
    const declinedIds = request.declinedProviderIds || [];
    declinedIds.push(providerId);

    await updateDoc(reqRef, {
      status: STATUS.REPORTED, // Back to reported
      assignedProviderId: null,
      assignedAt: null,
      declinedProviderIds: declinedIds,
    });

    // Free the provider
    await updateDoc(doc(db, "users", providerId), { availabilityStatus: "available" });

    // Log declination
    const assignmentSnap = await getDocs(
      query(collection(db, "assignments"), where("requestId", "==", requestId))
    );
    if (assignmentSnap.size > 0) {
      await updateDoc(assignmentSnap.docs[0].ref, { declinedAt: serverTimestamp() });
    }

    // Automatically reassign to next best provider
    await autoMatchProvider(requestId, request.breakdownType, request.driverId);
  }
}

export async function updateRequestStatus(requestId, actingProviderId, toStatus) {
  const reqRef = doc(db, "breakdownRequests", requestId);
  const reqSnap = await getDoc(reqRef);
  if (!reqSnap.exists()) throw new Error("Request not found.");
  const request = reqSnap.data();

  // BR-04: Only the assigned provider can update
  if (request.assignedProviderId !== actingProviderId) {
    throw new Error("Only the assigned provider can update this request.");
  }
  if (!isValidTransition(request.status, toStatus)) {
    throw new Error(`Cannot move from "${request.status}" to "${toStatus}".`);
  }

  const patch = { status: toStatus };
  if (toStatus === STATUS.COMPLETED) patch.completedAt = serverTimestamp();
  await updateDoc(reqRef, patch);

  // Free the provider back up once the job is done, and credit them
  if (toStatus === STATUS.COMPLETED) {
    await updateDoc(doc(db, "users", actingProviderId), {
      availabilityStatus: "available",
      completedJobsCount: increment(1),
    });
  }
}
