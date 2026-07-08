import { isValidIsoDateString, RELATIVE_DATE_LEVELS } from './datetime-validation-utils.js';

const MAX_RELATIVE_OFFSET = 10_000;

export function validateDatetimeRelativeFilter(
  granularity: string,
  offset: number,
  count: number,
  anchor: Date | string | undefined,
  pathPrefix: string,
): void {
  if (!RELATIVE_DATE_LEVELS.includes(granularity)) {
    throw new Error(
      `${pathPrefix}args[0]: relative date filters do not support ${granularity}. Supported levels: ${RELATIVE_DATE_LEVELS.join(
        ', ',
      )}.`,
    );
  }

  if (!Number.isFinite(offset) || !Number.isFinite(count)) {
    throw new Error(`${pathPrefix}: offset and count must be finite numbers.`);
  }

  if (count <= 0) {
    throw new Error(`${pathPrefix}args[2]: count must be greater than zero.`);
  }

  if (Math.abs(offset) > MAX_RELATIVE_OFFSET) {
    throw new Error(
      `${pathPrefix}args[1]: offset magnitude must be at most ${MAX_RELATIVE_OFFSET}.`,
    );
  }

  if (anchor !== undefined) {
    const anchorStr = anchor instanceof Date ? anchor.toISOString() : anchor;
    if (!isValidIsoDateString(anchorStr)) {
      throw new Error(`${pathPrefix}args[3]: anchor must be a valid ISO date or datetime.`);
    }
  }
}
