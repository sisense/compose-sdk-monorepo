import { useRef, useCallback } from 'react';
import { ClientApplication } from '../../app/client-application.js';

/**
 * Hook that generates a function for testing whether or not load
 *  should be performed for this render
 *
 * @param params - the component or hook params object
 * @param isParamsChanged - have the params changed from previous invocation
 * @returns generated render checking function
 */
export function useShouldLoad<T extends { enabled?: boolean }>(
  { enabled }: T,
  isParamsChanged: boolean,
) {
  const postponed = useRef(false);
  return useCallback(
    (app: ClientApplication | undefined, force = false): app is ClientApplication => {
      const isPostponed = enabled === false || !app;
      const wasPostponed = postponed.current;
      postponed.current = isPostponed;
      return !isPostponed && (wasPostponed || isParamsChanged || force);
    },
    [enabled, isParamsChanged],
  );
}
