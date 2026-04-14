import { withSpecificWidgetOptions } from '@/domains/dashboarding/dashboard-model/translate-dashboard-utils';
import { withReplacedWidgetId } from '@/domains/dashboarding/hooks/duplicate-widget';
import { widgetModelTranslator } from '@/domains/widgets/widget-model';
import { RestApi } from '@/infra/api/rest-api';
import { AppSettings } from '@/infra/app/settings/settings';
import { CompleteThemeSettings } from '@/types';

import { layoutToLayoutDto } from '../../translate-dashboard-dto-utils.js';
import {
  UseDashboardModelActionType,
  UseDashboardModelActionTypeInternal,
  UseDashboardModelInternalAction,
} from './types.js';
import { parseAddWidgetPayload, translateFiltersAndRelationsToDto } from './utils.js';

/**
 * Removes an orphaned widget from the dashboard (e.g. after add succeeded but patch failed).
 * Logs and swallows delete failures so the original error can be rethrown.
 *
 * @internal
 */
async function removeOrphanedWidget(
  restApi: RestApi,
  dashboardOid: string,
  widgetOid: string,
  sharedMode: boolean,
): Promise<void> {
  try {
    await restApi.deleteWidgetFromDashboard(dashboardOid, widgetOid, sharedMode);
  } catch (deleteError) {
    console.error(
      '[persistDashboardModelMiddleware] Failed to remove orphaned widget after patchDashboard failure:',
      deleteError,
    );
  }
}

export type PersistDashboardModelMiddlewareParams = {
  /** Dashboard OID, or undefined if not initialized */
  dashboardOid: string | undefined;
  /** Internal dashboard model action to persist */
  action: UseDashboardModelInternalAction;
  /** Sisense REST API instance */
  restApi: RestApi;
  /** Whether the dashboard is in shared mode */
  sharedMode: boolean;
  /** Application settings forwarded to {@link toWidgetDto} (controls widget design feature flag) */
  appSettings: AppSettings;
  /** Theme settings forwarded to {@link toWidgetDto} (used as defaults for widget design) */
  themeSettings: CompleteThemeSettings;
};

/**
 * Middleware that persists the dashboard model changes to the Sisense server.
 *
 * @returns Promise resolving to the action (possibly transformed, e.g. for ADD_WIDGET)
 * @internal
 */
export async function persistDashboardModelMiddleware({
  dashboardOid,
  action,
  restApi,
  sharedMode,
  appSettings,
  themeSettings,
}: PersistDashboardModelMiddlewareParams): Promise<UseDashboardModelInternalAction> {
  if (!dashboardOid) throw new Error('Dashboard model is not initialized');

  switch (action.type) {
    case UseDashboardModelActionType.FILTERS_UPDATE:
      restApi
        .patchDashboard(dashboardOid, translateFiltersAndRelationsToDto(action.payload), sharedMode)
        .catch((error) => {
          console.error('Failed to update filters on dashboard:', error);
        });
      break;
    case UseDashboardModelActionType.ADD_WIDGET: {
      const {
        widget: inputWidget,
        widgetsPanelLayout: customLayout,
        widgetOptions,
      } = parseAddWidgetPayload(action.payload);

      const widgetDto = withSpecificWidgetOptions(widgetOptions)(
        widgetModelTranslator.toWidgetDto(inputWidget, undefined, themeSettings, appSettings),
      );

      const createdWidgetDto = await restApi.addWidgetToDashboard(
        dashboardOid,
        widgetDto,
        sharedMode,
      );

      if (!createdWidgetDto) throw new Error('Failed to add widget to dashboard');
      const serverWidget = widgetModelTranslator.fromWidgetDto(createdWidgetDto);

      if (customLayout) {
        const fixedLayout = withReplacedWidgetId(inputWidget.oid, serverWidget.oid)(customLayout);
        try {
          await restApi.patchDashboard(
            dashboardOid,
            { layout: layoutToLayoutDto(fixedLayout) },
            sharedMode,
          );
        } catch (patchError) {
          await removeOrphanedWidget(restApi, dashboardOid, serverWidget.oid, sharedMode);
          throw patchError;
        }
        return {
          type: UseDashboardModelActionType.ADD_WIDGET,
          payload: {
            widget: serverWidget,
            widgetsPanelLayout: fixedLayout,
            widgetOptions,
          },
        };
      }

      return {
        type: UseDashboardModelActionType.ADD_WIDGET,
        payload: { widget: serverWidget, widgetOptions },
      };
    }
    case UseDashboardModelActionType.PATCH_WIDGET: {
      const { widgetOid, patch } = action.payload;
      restApi.patchWidgetInDashboard(dashboardOid, widgetOid, patch, sharedMode).catch((error) => {
        console.error('Failed to patch widget in dashboard:', error);
      });
      break;
    }
    case UseDashboardModelActionType.WIDGETS_PANEL_LAYOUT_UPDATE:
      restApi
        .patchDashboard(
          dashboardOid,
          {
            layout: layoutToLayoutDto(action.payload),
          },
          sharedMode,
        )
        .catch((error) => {
          console.error('Failed to update layout on dashboard:', error);
        });
      break;
    case UseDashboardModelActionType.WIDGETS_DELETE:
      Promise.all(
        action.payload.map((widgetOid) =>
          restApi.deleteWidgetFromDashboard(dashboardOid, widgetOid, sharedMode),
        ),
      ).catch((error) => {
        console.error('Failed to delete widgets from dashboard:', error);
      });
      break;
    case UseDashboardModelActionTypeInternal.UPDATE_WIDGETS_PANEL_LAYOUT_AND_WIDGETS_DELETE:
      restApi
        .patchDashboard(
          dashboardOid,
          {
            layout: layoutToLayoutDto(action.payload.widgetsPanel),
          },
          sharedMode,
        )
        .catch((error) => {
          console.error('Failed to update layout on dashboard:', error);
        });
      Promise.all(
        action.payload.widgets.map((widgetOid) =>
          restApi.deleteWidgetFromDashboard(dashboardOid, widgetOid, sharedMode),
        ),
      ).catch((error) => {
        console.error('Failed to delete widgets after layout update:', error);
      });
      break;
  }

  return action;
}
