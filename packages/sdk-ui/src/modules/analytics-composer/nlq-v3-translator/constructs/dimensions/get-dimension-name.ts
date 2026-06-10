import { DIMENSIONAL_NAME_PREFIX } from '../../types.js';

/**
 * Returns the dimensional attribute path with the `DM.` module prefix removed.
 *
 * @param dimensionString - NLQ dimension reference (e.g. `DM.Commerce.Date.Years`)
 * @returns Path without `DM.` (e.g. `Commerce.Date.Years`)
 *
 * @internal
 */
export function getDimensionName(dimensionString: string): string {
  const trimmed = dimensionString.trim();
  if (trimmed.startsWith(DIMENSIONAL_NAME_PREFIX)) {
    return trimmed.slice(DIMENSIONAL_NAME_PREFIX.length);
  }
  return trimmed;
}
