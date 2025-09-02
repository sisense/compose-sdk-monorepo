import { escapeSingleQuotes } from '@sisense/sdk-common';

import { DimensionalElement } from './base.js';

/**
 * Stringifies the argument, with an option to exclude specific properties from objects without a 'composeCode'.
 * Keys with spaces in objects will be enclosed in single quotes.
 *
 * @param arg - The argument to stringify.
 * @param excludeProps - Optional array of property names to exclude when stringifying objects (that don't have 'composeCode').
 * @returns The stringified representation of the argument.
 */
export function stringifyHelper(arg: any, excludeProps: string[] = []): string {
  try {
    if (arg === null || arg === undefined) {
      return String(arg);
    }

    if (typeof arg === 'string') {
      return `'${escapeSingleQuotes(arg)}'`;
    }

    if (typeof arg === 'number' || typeof arg === 'boolean') {
      return String(arg);
    }

    if (arg instanceof Date) {
      return `new Date('${arg.toISOString()}')`;
    }

    if (Array.isArray(arg)) {
      return `[${arg.map((item) => stringifyHelper(item, excludeProps)).join(', ')}]`;
    }

    if (typeof arg === 'object' && arg !== null) {
      if ('composeCode' in arg) {
        return arg.composeCode;
      }

      const entries = Object.entries(arg)
        .filter(([key]) => !excludeProps.includes(key))
        .map(([key, value]) => {
          const formattedKey = /[^a-zA-Z0-9_$]/.test(key) ? `'${key}'` : key;
          return `${formattedKey}: ${stringifyHelper(value, excludeProps)}`;
        });
      return `{ ${entries.join(', ')} }`;
    }
    // Fallback for anything else
    return JSON.stringify(arg);
  } catch (e) {
    console.error(e, JSON.stringify(arg, null, 2));
    return JSON.stringify(arg);
  }
}

function trimTrailingUndefined<T extends (...args: any[]) => any>(
  args: Parameters<T>,
): Parameters<T> {
  let i = args.length;
  while (i > 0 && args[i - 1] === undefined) {
    i--;
  }
  return args.slice(0, i) as Parameters<T>;
}

/**
 * Generic high order function to construct compose code for factory functions
 *
 * @param func - factory function
 * @param factoryName - name of the factory (e.g. 'filterFactory', 'measureFactory')
 * @param funcName - name of the factory function. Needed if the function name is minified.
 * @returns factory function with composeCode property added
 */
function withComposeCode(
  factoryName: string,
  funcName?: string,
): <T extends (...args: any[]) => any>(func: T) => T {
  return function <T extends (...args: any[]) => any>(func: T): T {
    return function (...args: Parameters<T>): ReturnType<T> {
      const trimmedArgs = trimTrailingUndefined(args);
      const length = trimmedArgs.length;
      const argValues = trimmedArgs
        .map((arg) => stringifyHelper(arg, ['guid']))
        // Remove trivial arg values from the end of the array
        .filter(
          (str, index) =>
            !(['', '{  }', '{}', 'undefined', 'null'].includes(str) && index === length - 1),
        )
        .join(', ');
      const signature = `${factoryName}.${funcName ?? func.name}(${argValues})`;
      // Call the original function and get the result
      const result = func(...args);
      (result as DimensionalElement).composeCode = signature; // Type assertion needed here
      return result;
    } as T;
  };
}

/**
 * High order function to construct compose code for filter factory functions
 *
 * @param func - filter factory function
 * @param funcName - name of the filter factory function. Needed if the function name is minified.
 * @returns filter factory function with composeCode property added to the filter
 */
export function withComposeCodeForFilter<T extends (...args: any[]) => any>(
  func: T,
  funcName?: string,
): T {
  return withComposeCode('filterFactory', funcName)(func);
}
/**
 * High order function to construct compose code for filter relations factory functions
 *
 * @param func - filter factory function
 * @param funcName - name of the filter factory function. Needed if the function name is minified.
 * @returns filter factory function with composeCode property added to the filter
 */
export function withComposeCodeForFilterRelations<T extends (...args: any[]) => any>(
  func: T,
  funcName?: string,
): T {
  return withComposeCode('filterFactory.logic', funcName)(func);
}

/**
 * High order function to construct compose code for analytics factory functions
 *
 * @param func - analytics factory function
 * @param funcName - name of the analytics factory function. Needed if the function name is minified.
 * @returns analytics factory function with composeCode property added to the analytics
 */
export function withComposeCodeForAnalytics<T extends (...args: any[]) => any>(
  func: T,
  funcName?: string,
): T {
  return withComposeCode('analyticsFactory', funcName)(func);
}

/**
 * High order function to construct compose code for measure factory functions
 *
 * @param func - measure factory function
 * @param funcName - name of the measure factory function. Needed if the function name is minified.
 * @returns measure factory function with composeCode property added to the measure
 */
export function withComposeCodeForMeasure<T extends (...args: any[]) => any>(
  func: T,
  funcName?: string,
): T {
  return withComposeCode('measureFactory', funcName)(func);
}
