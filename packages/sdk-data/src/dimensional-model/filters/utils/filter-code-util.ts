/**
 * Stringifies the argument, with an option to exclude specific properties.
 *
 * @param arg - The argument to stringify.
 * @param excludeProps - Optional array of property names to exclude when stringifying objects.
 * @returns The stringified representation of the argument.
 */
export function stringifyHelper(arg: any, excludeProps: string[] = []): string {
  try {
    if (arg === null || arg === undefined) {
      return JSON.stringify(arg);
    }

    if (arg === Object(arg) && 'composeCode' in arg) {
      return arg.composeCode;
    }

    if (Array.isArray(arg)) {
      return (
        '[' +
        arg
          .map((e) => {
            return stringifyHelper(e, excludeProps);
          })
          .join(', ') +
        ']'
      );
    }

    if (typeof arg === 'string') {
      return `'${arg}'`;
    }

    if (typeof arg === 'number' || !isNaN(arg)) {
      return arg;
    }

    if (typeof arg === 'object') {
      const filteredObject = Object.keys(arg)
        .filter((key) => !excludeProps.includes(key))
        .reduce((acc, key) => {
          acc[key] = arg[key];
          return acc;
        }, {} as Record<string, any>);

      // Check if the filtered object is empty
      if (Object.keys(filteredObject).length === 0) {
        return '';
      }

      return JSON.stringify(filteredObject);
    }
  } catch (e) {
    console.error(e);
  }

  return JSON.stringify(arg);
}

/**
 * High order function to construct compose code for filter factory functions
 *
 * @param func - filter factory function
 * @param funcName - name of the filter factory function. Needed if the function name is minified.
 * @param ignoreIndexes - Indexes of parameters to ignore in the generated composeCode
 * @returns filter factory function with composeCode property added to the filter
 */
export function withComposeCode<T extends (...args: any[]) => any>(
  func: T,
  funcName?: string,
  ignoreIndexes: number[] = [],
): T {
  return function (...args: Parameters<T>): ReturnType<T> {
    const argValues = args
      .map((arg, index) => {
        if (ignoreIndexes.includes(index)) {
          return ''; // Placeholder for ignored parameters
        }
        return stringifyHelper(arg, ['guid']);
      })
      .join(', ')
      // remove any number of trailing commas
      .replace(/(,\s*)+$/, '');
    const signature = `filterFactory.${funcName ?? func.name}(${argValues})`;

    // Call the original function and get the filter
    const filter = func(...args);

    // Add the composeCode property
    (filter as any).composeCode = signature;

    return filter;
  } as T;
}
