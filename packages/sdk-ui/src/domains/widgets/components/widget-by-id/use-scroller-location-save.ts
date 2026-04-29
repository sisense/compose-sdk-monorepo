import { useEffect, useMemo, useRef } from 'react';

import debounce from 'lodash-es/debounce';

import type { WidgetDto } from '@/domains/widgets/components/widget-by-id/types';
import { useRestApi, type WidgetDashboardScrollerLocationPatch } from '@/infra/api/rest-api';

const DEBOUNCE_MS = 500;

/**
 * Returns a debounced function that persists the navigator scroller position
 * for the given widget via a PATCH to the dashboard API.
 *
 * @internal
 */
export function useScrollerLocationSave(
  dashboardOid: string,
  widgetOid: string,
  currentOptions?: NonNullable<WidgetDto['options']>,
): (min: number, max: number) => void {
  const { restApi } = useRestApi();
  const currentOptionsRef = useRef(currentOptions);

  useEffect(() => {
    currentOptionsRef.current = currentOptions;
  }, [currentOptions]);

  const debouncedSave = useMemo(
    () =>
      debounce((min: number, max: number) => {
        if (!restApi) return;
        const patch: WidgetDashboardScrollerLocationPatch = {
          options: { ...currentOptionsRef.current, previousScrollerLocation: { min, max } },
        };
        void restApi
          .patchWidgetInDashboard(dashboardOid, widgetOid, patch)
          .catch((err: unknown) => {
            console.error('Failed to save navigator scroller position', err);
          });
      }, DEBOUNCE_MS),
    [restApi, dashboardOid, widgetOid],
  );

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  return debouncedSave;
}
