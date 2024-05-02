/* eslint-disable @typescript-eslint/no-explicit-any */
import { Filter } from '../../interfaces.js';

/**
 * Stringifies the argument
 *
 * @param arg - argument to stringify
 * @returns stringified argument
 */
export function stringifyHelper(arg: any): string {
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
            return stringifyHelper(e);
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
  } catch (e) {
    console.error(e);
  }

  return JSON.stringify(arg);
}

/**
 * High order function to construct compose code for filter factory functions
 *
 * @param func - filter factory function
 */
export function withComposeCode(func: (...args: any[]) => any): (...args: any[]) => any {
  return function (...args: any[]): any {
    const argValues = args.map(stringifyHelper).join(', ');
    const signature = `filterFactory.${func.name}(${argValues})`;
    const filter: Filter = func(...args);
    filter.composeCode = signature;
    return filter;
  };
}
