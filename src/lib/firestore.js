import {
  doc, setDoc, collection, query, where, onSnapshot, updateDoc, serverTimestamp,
  addDoc, getDoc, getDocs, runTransaction, increment
} from "firebase/firestore";
import { db } from "../firebase";
import { canCreateNewRequest, isValidTransition, STATUS } from "./businessRules";

export async function createUserProfile(uid, { name, email, role, phone }) {
  await setDoc(doc(db, "users", uid), {
    name,
    email,
    role,
    createdAt: serverTimestamp(),
  });

  if (role === "driver") {
    await setDoc(doc(db, "drivers", uid), {
      userId: uid,
      name,
      email,
      phone: phone || null,
    });
  } else if (role === "provider") {
    await setDoc(doc(db, "providers", uid), {
      userId: uid,
      name,
      email,
      phone: phone || null,
      serviceType: null,
      availabilityStatus: "available",
    });
  }
}

export function watchProviderProfile(uid, cb) {
  const ref = doc(db, "providers", uid);
  return onSnapshot(ref, (snap) => {
    cb(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}

export async function updateProviderProfile(uid, data) {
  await updateDoc(doc(db, "providers", uid), data);
}

export function watchAvailableProviders(cb) {
  const ref = query(
    collection(db, "providers"),
    where("availabilityStatus", "==", "available")
  );
  return onSnapshot(ref, (snap) => {
    const providers = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(providers);
  });
}

export function watchDriverRequests(driverId, cb) {
  const q = query(collection(db, "breakdownRequests"), where("driverId", "==", driverId));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    cb(list);
  });
}

export async function createBreakdownRequest(driverId, { breakdownType, location, description }) {
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
    location,
    description: description || null,
    status: STATUS.REPORTED,
    createdAt: serverTimestamp(),
  });

  return ref.id;
}

export async function createRequest(data) {
  return createBreakdownRequest(data.driverId, {
    breakdownType: data.breakdownType,
    location: data.location,
    description: data.description,
  });
}

export async function assignProvider(requestId, providerId) {
  const reqRef = doc(db, "breakdownRequests", requestId);
  const providerRef = doc(db, "providers", providerId);

  await runTransaction(db, async (tx) => {
    const reqSnap = await tx.get(reqRef);
    if (!reqSnap.exists()) throw new Error("Request not found.");
    const request = reqSnap.data();

    if (!isValidTransition(request.status, STATUS.ASSIGNED)) {
      throw new Error(`Cannot assign a provider from status "${request.status}".`);
    }

    const providerSnap = await tx.get(providerRef);
    if (!providerSnap.exists()) throw new Error("Provider not found.");
    const provider = providerSnap.data();

    if (provider.availabilityStatus !== "available") {
      throw new Error("Selected provider is already handling another active request.");
    }

    tx.update(reqRef, {
      assignedProviderId: providerId,
      status: STATUS.ASSIGNED,
      assignedAt: serverTimestamp(),
    });
    tx.update(providerRef, { availabilityStatus: "busy" });
  });

  await addDoc(collection(db, "assignments"), {
    requestId,
    providerId,
    assignedAt: serverTimestamp(),
    acceptedAt: null,
    completedAt: null,
  });
}

export async function cancelRequest(requestId, actingDriverId) {
  const reqRef = doc(db, "breakdownRequests", requestId);
  const reqSnap = await getDoc(reqRef);
  if (!reqSnap.exists()) throw new Error("Request not found.");
  const request = reqSnap.data();

  if (request.driverId !== actingDriverId) {
    throw new Error("Only the driver who created this request can cancel it.");
  }
  if (!isValidTransition(request.status, STATUS.CANCELLED)) {
    throw new Error(`Cannot cancel a request that is already "${request.status}".`);
  }

  await updateDoc(reqRef, {
    status: STATUS.CANCELLED,
    cancelledAt: serverTimestamp(),
  });

  if (request.assignedProviderId) {
    await updateDoc(doc(db, "providers", request.assignedProviderId), {
      availabilityStatus: "available",
    });
  }
}

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

  if (request.assignedProviderId !== providerId) {
    throw new Error("Only the assigned provider can respond to this assignment.");
  }

  if (accept) {
    if (!isValidTransition(request.status, STATUS.ACCEPTED)) {
      throw new Error(`Cannot accept a request from status "${request.status}".`);
    }
    await updateDoc(reqRef, {
      status: STATUS.ACCEPTED,
      acceptedAt: serverTimestamp(),
    });

    const assignmentSnap = await getDocs(
      query(collection(db, "assignments"), where("requestId", "==", requestId))
    );
    if (assignmentSnap.size > 0) {
      await updateDoc(assignmentSnap.docs[0].ref, { acceptedAt: serverTimestamp() });
    }
  } else {
    await updateDoc(reqRef, {
      status: STATUS.REPORTED,
      assignedProviderId: null,
      assignedAt: null,
    });

    await updateDoc(doc(db, "providers", providerId), { availabilityStatus: "available" });
  }
}

export async function updateRequestStatus(requestId, actingProviderId, toStatus) {
  const reqRef = doc(db, "breakdownRequests", requestId);
  const reqSnap = await getDoc(reqRef);
  if (!reqSnap.exists()) throw new Error("Request not found.");
  const request = reqSnap.data();

  if (request.assignedProviderId !== actingProviderId) {
    throw new Error("Only the assigned provider can update this request.");
  }
  if (!isValidTransition(request.status, toStatus)) {
    throw new Error(`Cannot move from "${request.status}" to "${toStatus}".`);
  }

  const patch = { status: toStatus };
  if (toStatus === STATUS.COMPLETED) patch.completedAt = serverTimestamp();
  await updateDoc(reqRef, patch);

  if (toStatus === STATUS.COMPLETED) {
    await updateDoc(doc(db, "providers", actingProviderId), {
      availabilityStatus: "available",
      completedJobsCount: increment(1),
    });

    const assignmentSnap = await getDocs(
      query(collection(db, "assignments"), where("requestId", "==", requestId))
    );
    if (assignmentSnap.size > 0) {
      await updateDoc(assignmentSnap.docs[0].ref, { completedAt: serverTimestamp() });
    }
  }
}