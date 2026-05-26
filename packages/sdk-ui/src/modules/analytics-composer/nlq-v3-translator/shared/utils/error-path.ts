import type { NlqTranslationError } from '../../../types.js';

/**
 * Builds a path string for a dataOptions field.
 *
 * @internal
 */
export function dataOptionsPath(axisKey: string | number, itemIndex?: number): string {
  if (axisKey === -1) {
    return 'dataOptions';
  }
  if (typeof axisKey === 'number') {
    return `dataOptions[${axisKey}]`;
  }
  if (itemIndex !== undefined) {
    return `dataOptions.${axisKey}[${itemIndex}]`;
  }
  return `dataOptions.${axisKey}`;
}

/**
 * Joins path segments using pathPrefix notation (e.g. "widgets[0].dataOptions.category[0]").
 *
 * @internal
 */
export function joinPathStrings(prefix: string, suffix?: string): string {
  if (!prefix) {
    return suffix ?? '';
  }
  if (!suffix) {
    return prefix;
  }
  return `${prefix}.${suffix}`;
}

/**
 * Prefixes an error path with a structural segment.
 *
 * @internal
 */
export function prefixPath(prefix: string): (error: NlqTranslationError) => NlqTranslationError {
  return (error) => ({
    ...error,
    path: joinPathStrings(prefix, error.path),
  });
}

/**
 * Prefixes path with widgets[index] for dashboard-level widget errors.
 *
 * @internal
 */
export function withWidgetsArrayPath(
  widgetIndex: number,
): (error: NlqTranslationError) => NlqTranslationError {
  return prefixPath(`widgets[${widgetIndex}]`);
}

/**
 * Prefixes filter errors with filters[index] at dashboard level.
 *
 * @internal
 */
export function withFilterPath(
  filterIndex: number,
): (error: NlqTranslationError) => NlqTranslationError {
  return (error) => ({
    ...error,
    path: joinPathStrings(`filters[${filterIndex}]`, error.path),
  });
}

/**
 * Maps errors from a translation result through a mapper.
 *
 * @internal
 */
export function mapTranslationErrors(
  errors: readonly NlqTranslationError[],
  mapError: (error: NlqTranslationError) => NlqTranslationError,
): NlqTranslationError[] {
  return errors.map(mapError);
}
