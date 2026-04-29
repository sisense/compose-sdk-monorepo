import { useCallback, useEffect, useRef } from 'react';

import debounce from 'lodash-es/debounce';

import type { WidgetsOptions } from '@/domains/dashboarding/dashboard-model';
import type { DashboardPersistenceManager } from '@/domains/dashboarding/persistence/types';

const DEBOUNCE_MS = 500;

type ScrollerChangeHandler = (min: number, max: number) => void;

/**
 * Returns a stable per-widget factory of debounced scroller-position savers.
 * Each call with the same widgetOid reuses the same debounced function.
 * All pending debouncers are cancelled on unmount.
 *
 * @param persistence - The dashboard persistence manager. When `undefined`, the returned factory is a no-op.
 * @param widgetsOptions - Current widget DTO options map, used to include all existing options in the PATCH
 *   so the server does not discard other option fields when updating `previousScrollerLocation`.
 * @returns Function that maps a widget OID to its debounced save handler.
 * @internal
 */
export function useWidgetScrollPersistence(
  persistence: DashboardPersistenceManager | undefined,
  widgetsOptions?: WidgetsOptions,
): (widgetOid: string) => ScrollerChangeHandler {
  const debouncersRef = useRef(new Map<string, ReturnType<typeof debounce>>());
  const widgetsOptionsRef = useRef(widgetsOptions);

  useEffect(() => {
    widgetsOptionsRef.current = widgetsOptions;
  }, [widgetsOptions]);

  useEffect(() => {
    const map = debouncersRef.current;
    return () => {
      map.forEach((debounced) => debounced.cancel());
      map.clear();
    };
  }, [persistence]);

  return useCallback(
    (widgetOid: string): ScrollerChangeHandler => {
      if (!persistence) {
        return () => undefined;
      }
      const existing = debouncersRef.current.get(widgetOid);
      if (existing) {
        return existing;
      }
      const debounced = debounce((min: number, max: number) => {
        const currentDtoOptions =
          widgetsOptionsRef.current?.[widgetOid]?.partialDtoOptions?.options;
        void persistence.patchWidget(widgetOid, {
          options: { ...currentDtoOptions, previousScrollerLocation: { min, max } },
        });
      }, DEBOUNCE_MS);
      debouncersRef.current.set(widgetOid, debounced);
      return debounced;
    },
    [persistence],
  );
}
