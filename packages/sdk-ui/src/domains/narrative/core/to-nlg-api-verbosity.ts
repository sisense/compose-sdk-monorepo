/**
 * Maps SDK narrative verbosity (`low` / `high`) to NLG API values (`Low` / `High`).
 * @param verbosity - SDK verbosity level (`low` / `high`) or undefined
 * @returns NLG API verbosity value (`Low` / `High`) or undefined when verbosity is undefined
 * @internal
 */
export function toNlgApiVerbosity(verbosity?: 'low' | 'high'): 'Low' | 'High' | undefined {
  if (verbosity === undefined) {
    return undefined;
  }
  return verbosity === 'high' ? 'High' : 'Low';
}
