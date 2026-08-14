// Business rules and constants for the VBARMS matching and request lifecycle.
// See project documentation Section 5 (SRS) for the full specification.

export const BREAKDOWN_TYPES = [
  "Flat tyre",
  "Battery failure",
  "Engine overheating",
  "Fuel issues",
  "Lockout",
  "Accident assistance",
  "Towing",
  "General assistance",
];

export const STATUS = {
  REPORTED: "Reported",
  ASSIGNED: "Assigned",
  ACCEPTED: "Accepted",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const ACTIVE_STATUSES = [
  STATUS.REPORTED,
  STATUS.ASSIGNED,
  STATUS.ACCEPTED,
  STATUS.IN_PROGRESS,
];

// BR-01: A driver may not create two simultaneous active requests.
export function canCreateNewRequest(existingRequests) {
  const activeCount = existingRequests.filter((r) =>
    ACTIVE_STATUSES.includes(r.status)
  ).length;
  return activeCount === 0;
}

// BR-02: When a provider accepts a job, they become unavailable until
// the request completes or is cancelled.
export function validateProviderAvailability(profile, existingRequests) {
  if (!profile || profile.availabilityStatus === "available") {
    return true;
  }
  // Unavailable provider — check if they actually have an active job
  const hasActive = existingRequests.some((r) =>
    ACTIVE_STATUSES.includes(r.status)
  );
  return !hasActive; // can become available if no active jobs
}

// BR-03: Only the assigned provider can respond to an assignment,
// and only while status is ASSIGNED.
export function validateProviderCanRespond(request, respondingProviderId) {
  return (
    request.status === STATUS.ASSIGNED &&
    request.assignedProviderId === respondingProviderId
  );
}

// BR-04: Only the provider working on a request can update its status.
export function validateProviderCanAdvance(request, actingProviderId) {
  return request.assignedProviderId === actingProviderId;
}

// BR-05: Only the driver who created a request can cancel it while
// it is still in REPORTED or ASSIGNED state.
export function validateDriverCanCancel(request, actingDriverId) {
  return (
    request.driverId === actingDriverId &&
    (request.status === STATUS.REPORTED || request.status === STATUS.ASSIGNED)
  );
}

// Status transitions: what states are valid given the current status?
export function isValidTransition(currentStatus, nextStatus) {
  const transitions = {
    [STATUS.REPORTED]: [STATUS.ASSIGNED, STATUS.CANCELLED],
    [STATUS.ASSIGNED]: [STATUS.ACCEPTED, STATUS.REPORTED, STATUS.CANCELLED],
    [STATUS.ACCEPTED]: [STATUS.IN_PROGRESS],
    [STATUS.IN_PROGRESS]: [STATUS.COMPLETED],
    [STATUS.COMPLETED]: [],
    [STATUS.CANCELLED]: [],
  };
  const allowed = transitions[currentStatus] || [];
  return allowed.includes(nextStatus);
}
