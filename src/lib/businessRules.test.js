import { describe, it, expect } from "vitest";
import {
  canCreateNewRequest,
  validateProviderCanRespond,
  validateProviderCanAdvance,
  validateDriverCanCancel,
  isValidTransition,
  STATUS,
  ACTIVE_STATUSES,
} from "./businessRules";

describe("BR-01: Driver may not create two simultaneous active requests", () => {
  it("allows creation if no active requests exist", () => {
    const requests = [{ status: "Completed" }, { status: "Cancelled" }];
    expect(canCreateNewRequest(requests)).toBe(true);
  });

  it("blocks creation if an active request exists", () => {
    const requests = [{ status: "Reported" }];
    expect(canCreateNewRequest(requests)).toBe(false);
  });

  it("blocks creation for any active status", () => {
    ACTIVE_STATUSES.forEach((status) => {
      const requests = [{ status }];
      expect(canCreateNewRequest(requests)).toBe(false);
    });
  });
});

describe("BR-03: Only assigned provider can respond to assignment", () => {
  it("allows response if provider is assigned and status is ASSIGNED", () => {
    const request = {
      status: STATUS.ASSIGNED,
      assignedProviderId: "provider-123",
    };
    expect(validateProviderCanRespond(request, "provider-123")).toBe(true);
  });

  it("blocks response if provider is not assigned", () => {
    const request = {
      status: STATUS.ASSIGNED,
      assignedProviderId: "provider-123",
    };
    expect(validateProviderCanRespond(request, "provider-999")).toBe(false);
  });

  it("blocks response if status is not ASSIGNED", () => {
    const request = {
      status: STATUS.ACCEPTED,
      assignedProviderId: "provider-123",
    };
    expect(validateProviderCanRespond(request, "provider-123")).toBe(false);
  });
});

describe("BR-04: Only provider working on request can advance status", () => {
  it("allows advancement if provider is assigned", () => {
    const request = { assignedProviderId: "provider-123" };
    expect(validateProviderCanAdvance(request, "provider-123")).toBe(true);
  });

  it("blocks advancement if provider is not assigned", () => {
    const request = { assignedProviderId: "provider-123" };
    expect(validateProviderCanAdvance(request, "provider-999")).toBe(false);
  });
});

describe("BR-05: Only driver can cancel their own request (REPORTED/ASSIGNED)", () => {
  it("allows cancellation if driver owns request and it's REPORTED", () => {
    const request = {
      driverId: "driver-123",
      status: STATUS.REPORTED,
    };
    expect(validateDriverCanCancel(request, "driver-123")).toBe(true);
  });

  it("allows cancellation if driver owns request and it's ASSIGNED", () => {
    const request = {
      driverId: "driver-123",
      status: STATUS.ASSIGNED,
    };
    expect(validateDriverCanCancel(request, "driver-123")).toBe(true);
  });

  it("blocks cancellation if driver does not own request", () => {
    const request = {
      driverId: "driver-123",
      status: STATUS.REPORTED,
    };
    expect(validateDriverCanCancel(request, "driver-999")).toBe(false);
  });

  it("blocks cancellation if request is beyond ASSIGNED", () => {
    const request = {
      driverId: "driver-123",
      status: STATUS.ACCEPTED,
    };
    expect(validateDriverCanCancel(request, "driver-123")).toBe(false);
  });
});

describe("Status transition validation", () => {
  it("allows valid transitions", () => {
    expect(isValidTransition(STATUS.REPORTED, STATUS.ASSIGNED)).toBe(true);
    expect(isValidTransition(STATUS.ACCEPTED, STATUS.IN_PROGRESS)).toBe(true);
  });

  it("blocks invalid transitions", () => {
    expect(isValidTransition(STATUS.REPORTED, STATUS.IN_PROGRESS)).toBe(false);
    expect(isValidTransition(STATUS.COMPLETED, STATUS.REPORTED)).toBe(false);
  });
});
