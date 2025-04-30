import type { HookAdapter } from '../hook-adapter';
import { AnyHookFunction } from '../types';

/**
 * Extracts the keys of an object `T` whose values are functions.
 */
type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

/**
 * Extracts the names of all functions returned by a given hook.
 *
 * @typeParam Hook - A function that returns an object.
 */
type HookApiName<Hook extends AnyHookFunction> = FunctionKeys<ReturnType<Hook>>;

/**
 * Extracts the parameter types of a specific function (by name) returned from a given hook.
 *
 * @typeParam Hook - A hook function that returns an object.
 * @typeParam Name - The key of the API method within the returned object.
 */
type HookApiParameters<
  Hook extends AnyHookFunction,
  Name extends HookApiName<Hook> = HookApiName<Hook>,
> = Parameters<ReturnType<Hook>[Name]>;

/**
 * Extracts the return type of a specific function (by name) returned from a given hook.
 *
 * @typeParam Hook - A hook function that returns an object.
 * @typeParam Name - The key of the API method within the returned object.
 */
type HookApiReturnType<
  Hook extends AnyHookFunction,
  Name extends HookApiName<Hook> = HookApiName<Hook>,
> = ReturnType<ReturnType<Hook>[Name]>;

export function createHookApiFacade<Hook extends AnyHookFunction, Name extends HookApiName<Hook>>(
  hookAdapter: HookAdapter<Hook>,
  apiName: Name,
  shouldReturnHookApiResult: true,
): (...args: HookApiParameters<Hook, Name>) => Promise<HookApiReturnType<Hook, Name>>;

export function createHookApiFacade<Hook extends AnyHookFunction, Name extends HookApiName<Hook>>(
  hookAdapter: HookAdapter<Hook>,
  apiName: Name,
  shouldReturnHookApiResult?: false,
): (...args: HookApiParameters<Hook, Name>) => void;

/**
 * Creates a facade function that proxies a specific API method returned from a React hook.
 *
 * This utility subscribes to the hook's lifecycle using the provided `HookAdapter`. It invokes
 * the desired API method (`apiName`) when the hook first emits a value. If `shouldReturnHookApiResult`
 * is `true`, the facade will return a `Promise` that resolves to the API method's return value;
 * otherwise, it will return `void`.
 *
 * @typeParam Hook - A function that returns an object containing API methods.
 * @typeParam Name - The name of the API method to call within the hook's returned object.
 * @param hookAdapter - An adapter that subscribes to the hook's updates.
 * @param apiName - The name of the API method to proxy from the hook result.
 * @param shouldReturnHookApiResult - If `true`, the facade returns a `Promise` of the result; otherwise returns `void`.
 * @returns A function that, when called, invokes the specified hook API method with the provided arguments.
 * The return type depends on the value of `shouldReturnHookApiResult`.
 * @internal
 */
export function createHookApiFacade<Hook extends AnyHookFunction, Name extends HookApiName<Hook>>(
  hookAdapter: HookAdapter<Hook>,
  apiName: Name,
  shouldReturnHookApiResult = false,
) {
  return function (
    ...args: HookApiParameters<Hook, Name>
  ): void | Promise<HookApiReturnType<Hook, Name>> {
    let isFirstRun = true;
    let subscription: { unsubscribe: () => void } | undefined;

    const resultPromise = new Promise<HookApiReturnType<Hook, Name>>((resolve) => {
      let hookApiResult: HookApiReturnType<Hook, Name>;

      subscription = hookAdapter.subscribe((hookResult) => {
        if (isFirstRun) {
          hookApiResult = hookResult[apiName](...args);
          isFirstRun = false;
        } else {
          resolve(hookApiResult);
        }
      });
    });

    // eslint-disable-next-line promise/catch-or-return
    resultPromise.finally(() => {
      subscription?.unsubscribe();
    });

    if (shouldReturnHookApiResult) {
      return resultPromise;
    }

    return void 0;
  };
}
