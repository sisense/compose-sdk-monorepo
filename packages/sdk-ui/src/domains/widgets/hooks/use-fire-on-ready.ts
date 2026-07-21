import { useEffect, useRef } from 'react';

/**
 * Invokes `callback` on every rising edge of `isReady` — each time it becomes
 * `true` after being `false`, including the initial render if `isReady` starts
 * `true`. Meant to power `onRender`-style widget lifecycle props: a widget wires
 * up its own "ready" signal (e.g. `!isLoading`, a Highcharts render event) and
 * the hook fires the consumer callback exactly once per readiness cycle.
 *
 * The latest `callback` identity is captured via a ref, so re-creating the
 * callback between renders never itself refires — only a rising edge of
 * `isReady` does.
 *
 * @internal
 */
export function useFireOnReady(isReady: boolean, callback: (() => void) | undefined): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const wasReadyRef = useRef(false);

  useEffect(() => {
    if (isReady && !wasReadyRef.current) {
      callbackRef.current?.();
    }
    wasReadyRef.current = isReady;
  }, [isReady]);
}
