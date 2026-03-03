import { withSpecificWidgetOptions } from '@/domains/dashboarding/dashboard-model/translate-dashboard-utils';
import { withReplacedWidgetId } from '@/domains/dashboarding/hooks/duplicate-widget';
import { widgetModelTranslator } from '@/domains/widgets/widget-model';
import { RestApi } from '@/infra/api/rest-api';

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

/**
 * Middleware that persists the dashboard model changes to the Sisense server.
 *
 * @param dashboardOid - Dashboard OID, or undefined if not initialized
 * @param action - Internal dashboard model action to persist
 * @param restApi - Sisense REST API instance
 * @param sharedMode - Whether the dashboard is in shared mode
 * @returns Promise resolving to the action (possibly transformed, e.g. for ADD_WIDGET)
 * @internal
 */
export async function persistDashboardModelMiddleware(
  dashboardOid: string | undefined,
  action: UseDashboardModelInternalAction,
  restApi: RestApi,
  sharedMode: boolean,
): Promise<UseDashboardModelInternalAction> {
  if (!dashboardOid) throw new Error('Dashboard model is not initialized');

  switch (action.type) {
    case UseDashboardModelActionType.FILTERS_UPDATE:
      await restApi.patchDashboard(
        dashboardOid,
        translateFiltersAndRelationsToDto(action.payload),
        sharedMode,
      );
      break;
    case UseDashboardModelActionType.ADD_WIDGET: {
      const {
        widget: inputWidget,
        widgetsPanelLayout: customLayout,
        widgetOptions,
      } = parseAddWidgetPayload(action.payload);

      const widgetDto = withSpecificWidgetOptions(widgetOptions)(
        widgetModelTranslator.toWidgetDto(inputWidget),
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
    case UseDashboardModelActionType.WIDGETS_PANEL_LAYOUT_UPDATE:
      await restApi.patchDashboard(
        dashboardOid,
        {
          layout: layoutToLayoutDto(action.payload),
        },
        sharedMode,
      );
      break;
    case UseDashboardModelActionType.WIDGETS_DELETE:
      await Promise.all(
        action.payload.map((widgetOid) =>
          restApi.deleteWidgetFromDashboard(dashboardOid, widgetOid, sharedMode),
        ),
      );
      break;
    case UseDashboardModelActionTypeInternal.UPDATE_WIDGETS_PANEL_LAYOUT_AND_WIDGETS_DELETE:
      await restApi.patchDashboard(
        dashboardOid,
        {
          layout: layoutToLayoutDto(action.payload.widgetsPanel),
        },
        sharedMode,
      );
      await Promise.all(
        action.payload.widgets.map((widgetOid) =>
          restApi.deleteWidgetFromDashboard(dashboardOid, widgetOid, sharedMode),
        ),
      );
      break;
  }

  return action;
}
