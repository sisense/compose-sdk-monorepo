import { UseDashboardModelAction, UseDashboardModelActionType } from '@/models';
import { DashboardChangeAction, DashboardChangeType } from '@/dashboard/dashboard';
import { Authenticator } from '@sisense/sdk-rest-client';

/**
 * Convert a dashboard change action to a use dashboard model action.
 *
 * @param action - The dashboard change action to convert
 * @returns The useDashboardModel action or null if the action is not supported
 * @internal
 */
export function dashboardChangeActionToUseDashboardModelAction(
  action: DashboardChangeAction,
): UseDashboardModelAction | null {
  if (action.type === DashboardChangeType.FILTERS_UPDATE) {
    return {
      type: UseDashboardModelActionType.FILTERS_UPDATE,
      payload: action.payload,
    };
  } else if (action.type === DashboardChangeType.WIDGETS_PANEL_LAYOUT_UPDATE) {
    return {
      type: UseDashboardModelActionType.WIDGETS_PANEL_LAYOUT_UPDATE,
      payload: action.payload,
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
