import { Authenticator } from '@sisense/sdk-rest-client';

import {
  UseDashboardModelAction,
  UseDashboardModelActionType,
} from '@/domains/dashboarding/dashboard-model';
import { DashboardChangeEvent } from '@/domains/dashboarding/types';

/**
 * Convert a dashboard change event to a use dashboard model action.
 *
 * @param event - The dashboard change event to convert
 * @returns The useDashboardModel action or null if the event is not supported
 * @internal
 */
export function dashboardChangeEventToUseDashboardModelAction(
  event: DashboardChangeEvent,
): UseDashboardModelAction | null {
  if (event.type === 'filters/updated') {
    return {
      type: UseDashboardModelActionType.FILTERS_UPDATE,
      payload: event.payload,
    };
  } else if (event.type === 'widgetsPanel/layout/updated') {
    return {
      type: UseDashboardModelActionType.WIDGETS_PANEL_LAYOUT_UPDATE,
      payload: event.payload,
    };
  }

  return null;
}

/**
 * Check if the persistence is supported and log a warning if it is not.
 *
 * @param authType - The authentication type
 * @param shouldWarn - Whether to log a warning
 * @returns True if the persistence is supported, false otherwise
 * @internal
 */
export function checkPersistenceSupport(authType: Authenticator['type'], shouldWarn: boolean) {
  if (authType === 'wat') {
    if (shouldWarn)
      console.warn(
        `WAT authentication does not support persistence. The changes will not be saved. Set "persist" flag to false to avoid this warning.`,
      );

    return false;
  }

  return true;
}
