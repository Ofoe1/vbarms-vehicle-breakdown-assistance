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

export function canCreateNewRequest(existingRequests) {
  const activeCount = existingRequests.filter((r) =>
    ACTIVE_STATUSES.includes(r.status)
  ).length;
  return activeCount === 0;
}

export function validateProviderAvailability(profile) {
  return !profile || profile.availabilityStatus === "available";
}

export function validateProviderCanRespond(request, respondingProviderId) {
  return (
    request.status === STATUS.ASSIGNED &&
    request.assignedProviderId === respondingProviderId
  );
}

export function validateProviderCanAdvance(request, actingProviderId) {
  return request.assignedProviderId === actingProviderId;
}

export function validateDriverCanCancel(request, actingDriverId) {
  return (
    request.driverId === actingDriverId &&
    (request.status === STATUS.REPORTED || request.status === STATUS.ASSIGNED)
  );
}

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