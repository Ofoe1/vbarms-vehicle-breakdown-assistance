export function filterProvidersByServiceType(providers, serviceType) {
  if (!serviceType) return providers;
  return providers.filter(
    (p) =>
      p.serviceType === serviceType && p.availabilityStatus === "available"
  );
}

export function filterAndRankProviders(providers, serviceType) {
  const matched = filterProvidersByServiceType(providers, serviceType);
  return [...matched].sort(
    (a, b) => (b.completedJobsCount || 0) - (a.completedJobsCount || 0)
  );
}

export function matchLabel(provider, index) {
  if (index === 0) return "Most experienced";
  return "Available";
}