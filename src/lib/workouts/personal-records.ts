// Personal-record detection, isolated from the UI/DB layer.
//
// Uses the Epley formula to estimate a 1-rep max from any weight x
// reps set, so a PR can be recognized even when reps differ between
// attempts (e.g. 60kg x 10 vs 62.5kg x 8).

export interface SetPerformance {
  weightKg: number;
  reps: number;
}

/** Epley estimated 1RM. Reps of 1 return the weight itself. */
export function estimateOneRepMax({ weightKg, reps }: SetPerformance): number {
  if (reps <= 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

/**
 * A set is a new PR only if its estimated 1RM strictly exceeds the
 * best 1RM on record for that exercise. The caller supplies the
 * client's current best (from personal_records) — this function
 * never trusts a client-claimed PR without the underlying set data.
 */
export function isNewPersonalRecord(
  candidate: SetPerformance,
  currentBestOneRepMax: number | null
): boolean {
  const candidateOneRm = estimateOneRepMax(candidate);
  if (currentBestOneRepMax === null) return true;
  return candidateOneRm > currentBestOneRepMax;
}
