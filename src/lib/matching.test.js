import { describe, it, expect } from "vitest";
import {
  filterProvidersByServiceType,
  filterAndRankProviders,
} from "./matching";

describe("filterProvidersByServiceType", () => {
  const providers = [
    { id: "a", serviceType: "Flat tyre", availabilityStatus: "available" },
    { id: "b", serviceType: "Flat tyre", availabilityStatus: "busy" },
    { id: "c", serviceType: "Battery failure", availabilityStatus: "available" },
    { id: "d", serviceType: null, availabilityStatus: "available" },
  ];

  it("returns only providers offering the exact service type and available", () => {
    const result = filterProvidersByServiceType(providers, "Flat tyre");
    expect(result.map((p) => p.id)).toEqual(["a"]);
  });

  it("excludes unavailable providers even if the type matches", () => {
    const result = filterProvidersByServiceType(providers, "Flat tyre");
    expect(result.find((p) => p.id === "b")).toBeUndefined();
  });

  it("returns the full list when no serviceType is requested", () => {
    const result = filterProvidersByServiceType(providers, null);
    expect(result.length).toBe(providers.length);
  });
});

describe("filterAndRankProviders", () => {
  const providers = [
    { id: "a", serviceType: "Flat tyre", availabilityStatus: "available", completedJobsCount: 2 },
    { id: "b", serviceType: "Flat tyre", availabilityStatus: "available", completedJobsCount: 15 },
    { id: "c", serviceType: "Battery failure", availabilityStatus: "available", completedJobsCount: 10 },
  ];

  it("filters by service type and sorts by experience descending", () => {
    const result = filterAndRankProviders(providers, "Flat tyre");
    expect(result.map((p) => p.id)).toEqual(["b", "a"]);
  });
});