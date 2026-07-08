import {
  hasExclusiveEndOfDayAntiPattern,
  isValidIsoDateString,
  PERIOD_DATE_LEVELS,
  stripClockFromIsoDateTime,
  toDateBoundString,
} from './datetime-validation-utils.js';

export function validateDatetimeRange(
  granularity: string,
  from: Date | string | undefined,
  to: Date | string | undefined,
  pathPrefix: string,
): void {
  if (from === undefined && to === undefined) {
    throw new Error(
      `${pathPrefix}: date range filter requires at least one of 'from' or 'to' bounds.`,
    );
  }

  const fromStr = from !== undefined ? toDateBoundString(from) : undefined;
  const toStr = to !== undefined ? toDateBoundString(to) : undefined;

  if (fromStr !== undefined) {
    validateRangeBound(fromStr, granularity, `${pathPrefix}args[1] (from)`);
  }
  if (toStr !== undefined) {
    const toPath = `${pathPrefix}args[2] (to)`;
    validateRangeBound(toStr, granularity, toPath);
    if (hasExclusiveEndOfDayAntiPattern(toStr)) {
      throw new Error(
        `${toPath}: 'T23:59:59' is treated as an exclusive upper bound by the query engine and often excludes intended rows. Use the start of the next period instead (e.g. '2026-05-06' or '2026-05-06T00:00:00').`,
      );
    }
  }

  if (fromStr !== undefined && toStr !== undefined) {
    const fromMs = Date.parse(fromStr);
    const toMs = Date.parse(toStr);
    if (Number.isNaN(fromMs) || Number.isNaN(toMs)) {
      throw new Error(`${pathPrefix}: unable to compare from/to bounds.`);
    }
    if (fromMs > toMs) {
      throw new Error(`${pathPrefix}: 'from' must be less than or equal to 'to'.`);
    }
    if (fromMs === toMs && fromStr.includes('T') && toStr.includes('T')) {
      throw new Error(
        `${pathPrefix}: identical from/to datetimes produce an empty half-open range on the backend. Use the next bucket as exclusive 'to' (e.g. next day at midnight).`,
      );
    }
  }
}

function validateRangeBound(bound: string, granularity: string, path: string): void {
  if (!isValidIsoDateString(bound)) {
    throw new Error(`${path}: invalid date bound '${bound}'. Expected ISO date or datetime.`);
  }
  if (!PERIOD_DATE_LEVELS.includes(granularity) && bound.indexOf('T') === -1) {
    throw new Error(`${path}: ${granularity} range bounds must include a time component.`);
  }
}

export function normalizeDatetimeRangeBound(bound: Date | string, granularity: string): string {
  const boundStr = toDateBoundString(bound);
  if (!isValidIsoDateString(boundStr)) {
    return boundStr;
  }
  if (PERIOD_DATE_LEVELS.includes(granularity)) {
    return stripClockFromIsoDateTime(boundStr);
  }
  return boundStr;
}
