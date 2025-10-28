/**
 * Determines if a processed value should be included in the result.
 *
 * @param value - The processed value to check
 * @returns True if the value should be included, false otherwise
 */
function shouldIncludeValue(value: unknown): boolean {
  // Include non-object values
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return true;
  }

  // Include special objects like Date, RegExp, Function
  if (value instanceof Date || value instanceof RegExp || value instanceof Function) {
    return true;
  }

  // Only include non-empty objects
  return Object.keys(value).length > 0;
}

/**
 * Recursively removes properties with undefined values and empty objects from an object.
 *
 * @param obj - The object to process
 * @returns A new object with undefined properties and empty objects removed
 *
 * @example
 * ```typescript
 * const input = {
 *   a: 1,
 *   b: undefined,
 *   c: { d: 2, e: undefined },
 *   f: [1, undefined, 3],
 *   g: {}
 * };
 *
 * const result = omitUndefinedAndEmpty(input);
 * // Result: { a: 1, c: { d: 2 }, f: [1, 3] }
 * ```
 */
export function omitUndefinedAndEmpty<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => omitUndefinedAndEmpty(item))
      .filter((item) => {
        // Remove empty objects from arrays
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          return Object.keys(item).length > 0;
        }
        return true;
      }) as T;
  }

  if (typeof obj === 'object') {
    // Handle special objects that shouldn't be recursively processed
    if (obj instanceof Date || obj instanceof RegExp || obj instanceof Function) {
      return obj;
    }

    const result = {} as T;

    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) {
        continue;
      }

      const processedValue = omitUndefinedAndEmpty(value);

      // Only add the property if the processed value is not an empty object
      // But preserve special objects like Date, RegExp, Function
      if (shouldIncludeValue(processedValue)) {
        (result as Record<string, unknown>)[key] = processedValue;
      }
    }

    return result;
  }

  return obj;
}
