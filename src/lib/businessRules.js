// Business rules from the SRS (Section 8 of the project documentation).
// Kept as pure functions so they can be unit tested in isolation, and reused
// identically on the client (for UX) and mirrored in firestore.rules (for enforcement).

export const STATUS = {
  REPORTED: "Reported",
  ASSIGNED: "Assigned",
  ACCEPTED: "Accepted",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const ACTIVE_STATUSES = [
  STATUS.REPORTED,
  STATUS.ASSIGNED,
  STATUS.ACCEPTED,
  STATUS.IN_PROGRESS,
];

// Valid forward transitions. Anything not listed here is rejected.
const ALLOWED_TRANSITIONS = {
  [STATUS.REPORTED]: [STATUS.ASSIGNED, STATUS.CANCELLED],
  [STATUS.ASSIGNED]: [STATUS.ACCEPTED, STATUS.CANCELLED],
  [STATUS.ACCEPTED]: [STATUS.IN_PROGRESS], // BR-05: cannot cancel once Accepted
  [STATUS.IN_PROGRESS]: [STATUS.COMPLETED],
  [STATUS.COMPLETED]: [], // BR-03: terminal
  [STATUS.CANCELLED]: [], // terminal
};

/** BR-01: a driver cannot open a second active request while one exists. */
export function canCreateNewRequest(existingRequests) {
  return !existingRequests.some((r) => ACTIVE_STATUSES.includes(r.status));
}

/** BR-02: a provider cannot be assigned while already on an active request. */
export function isProviderAvailableForAssignment(provider, providerActiveRequestCount) {
  return provider.availabilityStatus === "available" && providerActiveRequestCount === 0;
}

/** BR-03 / general: is this a legal status transition? */
export function isValidTransition(fromStatus, toStatus) {
  const allowed = ALLOWED_TRANSITIONS[fromStatus];
  return Array.isArray(allowed) && allowed.includes(toStatus);
}

/** BR-04: only the assigned provider may mark a request Completed. */
export function canMarkCompleted(request, actingProviderId) {
  return (
    request.assignedProviderId === actingProviderId &&
    request.status === STATUS.IN_PROGRESS
  );
}

/** BR-05: a driver may cancel only before the request reaches Accepted. */
export function canCancel(request) {
  return request.status === STATUS.REPORTED || request.status === STATUS.ASSIGNED;
}

// Full Tailwind class strings (not built dynamically, so the JIT compiler can find them).
export function statusColor(status) {
  const map = {
    [STATUS.REPORTED]: "bg-status-reported",
    [STATUS.ASSIGNED]: "bg-status-assigned",
    [STATUS.ACCEPTED]: "bg-status-accepted",
    [STATUS.IN_PROGRESS]: "bg-status-progress",
    [STATUS.COMPLETED]: "bg-status-completed",
    [STATUS.CANCELLED]: "bg-status-cancelled",
  };
  return map[status] || "bg-status-reported";
}

export const BREAKDOWN_TYPES = [
  "Flat tyre",
  "Battery failure",
  "Engine problem",
  "Fuel-related problem",
  "Overheating",
  "Accident",
  "Other",
];
