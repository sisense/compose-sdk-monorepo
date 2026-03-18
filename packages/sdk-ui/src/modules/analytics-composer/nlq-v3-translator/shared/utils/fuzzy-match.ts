import { levenshtein } from '@sisense/sdk-common';

/** Maximum edit distance for suggesting "Did you mean?" in error messages */
export const SUGGESTION_THRESHOLD = 3;

/**
 * Finds the candidate with the smallest Levenshtein distance to the input.
 * Used to enhance "not found" errors with "Did you mean 'X'?" when distance <= SUGGESTION_THRESHOLD.
 *
 * @param input - The string that was not found
 * @param candidates - Array of valid candidates to match against
 * @param getLabel - Function to extract the label string from each candidate
 * @returns The best match and its distance, or undefined if candidates is empty
 * @internal
 */
export function findBestMatch<T>(
  input: string,
  candidates: readonly T[],
  getLabel: (c: T) => string,
): { best: T; distance: number } | undefined {
  if (candidates.length === 0) return undefined;

  let minDistance = Number.MAX_SAFE_INTEGER;
  let best: T | undefined;

  for (const candidate of candidates) {
    const label = getLabel(candidate);
    const distance = levenshtein(input, label);
    if (distance < minDistance) {
      minDistance = distance;
      best = candidate;
    }
  }

  return best !== undefined ? { best, distance: minDistance } : undefined;
}
