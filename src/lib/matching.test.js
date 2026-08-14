import { describe, it, expect } from "vitest";
import { computeProviderScore, filterAndRankProviders } from "./matching";

describe("computeProviderScore", () => {
  it("scores an exact service-type match higher than a generalist", () => {
    const specialist = { serviceTypes: ["Flat tyre"], completedJobsCount: 0 };
    const generalist = { serviceTypes: [], completedJobsCount: 0 };
    expect(computeProviderScore(specialist, "Flat tyre")).toBeGreaterThan(
      computeProviderScore(generalist, "Flat tyre")
    );
  });

  it("returns null for a provider who doesn't offer the type and isn't a generalist", () => {
    const irrelevant = { serviceTypes: ["Battery failure"], completedJobsCount: 5 };
    expect(computeProviderScore(irrelevant, "Flat tyre")).toBeNull();
  });

  it("rewards experience, but caps the bonus at 20 completed jobs", () => {
    const veteran = { serviceTypes: ["Flat tyre"], completedJobsCount: 20 };
    const legend = { serviceTypes: ["Flat tyre"], completedJobsCount: 500 };
    expect(computeProviderScore(veteran, "Flat tyre")).toBe(
      computeProviderScore(legend, "Flat tyre")
    );
  });

  it("an experienced generalist can still outrank a brand-new specialist", () => {
    const newSpecialist = { serviceTypes: ["Flat tyre"], completedJobsCount: 0 }; // 100
    const veteranGeneralist = { serviceTypes: [], completedJobsCount: 20 }; // 40 + 40 = 80
    expect(computeProviderScore(newSpecialist, "Flat tyre")).toBeGreaterThan(
      computeProviderScore(veteranGeneralist, "Flat tyre")
    );
  });
});

describe("filterAndRankProviders", () => {
  const providers = [
    { id: "a", serviceTypes: ["Battery failure"], completedJobsCount: 10 }, // no match
    { id: "b", serviceTypes: ["Flat tyre"], completedJobsCount: 2 },        // 100 + 4 = 104
    { id: "c", serviceTypes: [], completedJobsCount: 10 },                 // 40 + 20 = 60
    { id: "d", serviceTypes: ["Flat tyre"], completedJobsCount: 15 },      // 100 + 30 = 130
  ];

  it("excludes non-matching providers entirely", () => {
    const result = filterAndRankProviders(providers, "Flat tyre");
    expect(result.find((p) => p.id === "a")).toBeUndefined();
  });

  it("ranks by score descending", () => {
    const result = filterAndRankProviders(providers, "Flat tyre");
    expect(result.map((p) => p.id)).toEqual(["d", "b", "c"]);
  });
});
