// Provider matching: ranks available providers for a given breakdown type
// instead of just filtering. Kept as pure functions so the scoring logic
// itself is unit-testable without touching Firestore.
//
// Scoring model (documented in the SRS as a "Could have" enhancement, now
// promoted to Must-have for match quality):
//   +100  exact service-type match
//   +40   provider offers general assistance (empty serviceTypes = handles anything)
//   +0    no match at all (excluded before scoring, see filterAndRankProviders)
//   + up to +40  experience bonus: 2 points per completed job, capped at 20 jobs
//
// This rewards providers who both (a) specialise in the exact problem and
// (b) have a track record, without requiring GPS/location data we don't have.

const EXPERIENCE_CAP_JOBS = 20;
const EXPERIENCE_POINTS_PER_JOB = 2;

export function computeProviderScore(provider, breakdownType) {
  const types = provider.serviceTypes || [];
  const isExactMatch = types.includes(breakdownType);
  const isGeneralist = types.length === 0;

  if (!isExactMatch && !isGeneralist) return null; // not a match at all

  let score = isExactMatch ? 100 : 40;
  const jobs = Math.min(provider.completedJobsCount || 0, EXPERIENCE_CAP_JOBS);
  score += jobs * EXPERIENCE_POINTS_PER_JOB;

  return score;
}

export function filterAndRankProviders(providers, breakdownType) {
  return providers
    .map((p) => ({ ...p, matchScore: computeProviderScore(p, breakdownType) }))
    .filter((p) => p.matchScore !== null)
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function matchLabel(provider, index) {
  if (index === 0) return "Best match";
  const types = provider.serviceTypes || [];
  return types.length === 0 ? "General assistance" : "Available";
}
