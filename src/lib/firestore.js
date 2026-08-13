import {
  collection, doc, addDoc, updateDoc, setDoc, getDocs, getDoc,
  query, where, onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  STATUS, ACTIVE_STATUSES, canCreateNewRequest, isValidTransition,
} from "./businessRules";

// ---------- Users / role profiles ----------

export async function createUserProfile(uid, { name, email, role, phone }) {
  await setDoc(doc(db, "users", uid), { name, email, role, createdAt: serverTimestamp() });
  if (role === "driver") {
    await setDoc(doc(db, "drivers", uid), { name, phone: phone || "" });
  } else if (role === "provider") {
    // name/phone denormalised onto the provider doc so the driver-facing
    // provider list can be read directly without a second lookup per row.
    await setDoc(doc(db, "providers", uid), {
      name,
      phone: phone || "",
      serviceTypes: [],
      availabilityStatus: "available",
    });
  }
}

export function watchProviderProfile(uid, cb) {
  return onSnapshot(doc(db, "providers", uid), (snap) =>
    cb(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  );
}

export async function updateProviderProfile(uid, data) {
  await updateDoc(doc(db, "providers", uid), data);
}

export function watchAvailableProviders(breakdownType, cb) {
  const q = query(collection(db, "providers"), where("availabilityStatus", "==", "available"));
  return onSnapshot(q, (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const filtered = breakdownType
      ? all.filter((p) => !p.serviceTypes?.length || p.serviceTypes.includes(breakdownType))
      : all;
    cb(filtered);
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

export async function createBreakdownRequest(driverId, { breakdownType, description, location }) {
  // BR-01: enforce client-side (mirrored in firestore.rules)
  const existingSnap = await getDocs(
    query(collection(db, "breakdownRequests"), where("driverId", "==", driverId))
  );
  const existing = existingSnap.docs.map((d) => d.data());
  if (!canCreateNewRequest(existing)) {
    throw new Error("You already have an active breakdown request. Complete or cancel it before reporting a new one.");
  }
  const ref = await addDoc(collection(db, "breakdownRequests"), {
    driverId,
    breakdownType,
    description: description || "",
    location,
    status: STATUS.REPORTED,
    assignedProviderId: null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function assignProvider(requestId, providerId) {
  const reqRef = doc(db, "breakdownRequests", requestId);
  const reqSnap = await getDoc(reqRef);
  if (!reqSnap.exists()) throw new Error("Request not found.");
  const request = reqSnap.data();

  if (!isValidTransition(request.status, STATUS.ASSIGNED)) {
    throw new Error(`Cannot assign a provider from status "${request.status}".`);
  }

  // BR-02: provider must not already be on an active request
  const activeForProvider = await getDocs(
    query(
      collection(db, "breakdownRequests"),
      where("assignedProviderId", "==", providerId)
    )
  );
  const hasActive = activeForProvider.docs.some((d) =>
    ACTIVE_STATUSES.includes(d.data().status)
  );
  if (hasActive) {
    throw new Error("Selected provider is already handling another active request.");
  }

  await updateDoc(reqRef, {
    assignedProviderId: providerId,
    status: STATUS.ASSIGNED,
    assignedAt: serverTimestamp(),
  });

  await addDoc(collection(db, "assignments"), {
    requestId,
    providerId,
    assignedAt: serverTimestamp(),
    acceptedAt: null,
    completedAt: null,
  });
}

export async function cancelRequest(requestId) {
  const reqRef = doc(db, "breakdownRequests", requestId);
  const reqSnap = await getDoc(reqRef);
  if (!reqSnap.exists()) throw new Error("Request not found.");
  const request = reqSnap.data();

  if (!isValidTransition(request.status, STATUS.CANCELLED)) {
    // covers BR-05 (cannot cancel once Accepted or later)
    throw new Error(`Cannot cancel a request that is already "${request.status}".`);
  }
  await updateDoc(reqRef, { status: STATUS.CANCELLED, cancelledAt: serverTimestamp() });
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

export async function respondToAssignment(requestId, accept) {
  const reqRef = doc(db, "breakdownRequests", requestId);
  const reqSnap = await getDoc(reqRef);
  if (!reqSnap.exists()) throw new Error("Request not found.");
  const request = reqSnap.data();

  if (accept) {
    if (!isValidTransition(request.status, STATUS.ACCEPTED)) {
      throw new Error(`Cannot accept a request from status "${request.status}".`);
    }
    await updateDoc(reqRef, { status: STATUS.ACCEPTED, acceptedAt: serverTimestamp() });
  } else {
    // Reject: return the request to Reported and clear the assignment so
    // the driver can pick another provider.
    await updateDoc(reqRef, {
      status: STATUS.REPORTED,
      assignedProviderId: null,
      assignedAt: null,
    });
  }
}

export async function updateRequestStatus(requestId, actingProviderId, toStatus) {
  const reqRef = doc(db, "breakdownRequests", requestId);
  const reqSnap = await getDoc(reqRef);
  if (!reqSnap.exists()) throw new Error("Request not found.");
  const request = reqSnap.data();

  if (request.assignedProviderId !== actingProviderId) {
    throw new Error("Only the assigned provider can update this request."); // BR-04
  }
  if (!isValidTransition(request.status, toStatus)) {
    throw new Error(`Cannot move from "${request.status}" to "${toStatus}".`);
  }
  const patch = { status: toStatus };
  if (toStatus === STATUS.COMPLETED) patch.completedAt = serverTimestamp();
  await updateDoc(reqRef, patch);
}
