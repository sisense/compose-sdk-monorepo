/** @internal */

import { useEffect, useRef } from 'preact/hooks';

import { AnyHookFunction } from './types';

interface HookWrapperComponentProps<Hook extends AnyHookFunction> {
  /**
   * The hook to call
   */
  hook: Hook;
  /**
   * The parameters to pass to the hook
   */
  params: Parameters<Hook>;
  /**
   * The hook result callback function
   */
  onResult: (result: ReturnType<Hook>) => void;
}

export function HookWrapperComponent<Hook extends AnyHookFunction>({
  hook,
  params,
  onResult,
}: HookWrapperComponentProps<Hook>) {
  const prevResult = useRef<ReturnType<Hook> | null>(null);
  const result = hook(...params);

  useEffect(() => {
    if (prevResult.current !== result) {
      onResult(result);
    }
    prevResult.current = result;
  }, [result, onResult]);

  return null;
}
