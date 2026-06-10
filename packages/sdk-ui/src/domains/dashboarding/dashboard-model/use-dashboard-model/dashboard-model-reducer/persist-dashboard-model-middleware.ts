import { convertJaqlDataSourceForDto, DataSource } from '@sisense/sdk-data';

import { DashboardModel } from '@/domains/dashboarding/dashboard-model';
import { withSpecificWidgetOptions } from '@/domains/dashboarding/dashboard-model/translate-dashboard-utils';
import { withReplacedWidgetId } from '@/domains/dashboarding/hooks/duplicate-widget';
import { deepMerge } from '@/domains/dashboarding/persistence/deep-merge.js';
import type { WidgetPropsUpdate } from '@/domains/dashboarding/persistence/update-types.js';
import { withWidgetDesign } from '@/domains/widgets/components/widget-by-id/translate-widget-style-options/index.js';
import type { WidgetDto, WidgetStyle } from '@/domains/widgets/components/widget-by-id/types';
import { isTextWidget } from '@/domains/widgets/components/widget-by-id/utils.js';
import { widgetModelTranslator } from '@/domains/widgets/widget-model';
import { RestApi } from '@/infra/api/rest-api';
import { AppSettings } from '@/infra/app/settings/settings';
import { CompleteThemeSettingsInternal, WidgetStyleOptions } from '@/types';

import { layoutToLayoutDto } from '../../translate-dashboard-dto-utils.js';
import {
  UseDashboardModelActionType,
  UseDashboardModelActionTypeInternal,
  UseDashboardModelInternalAction,
  WidgetPatch,
} from './types.js';
import { parseAddWidgetPayload, translateFiltersAndRelationsToDto } from './utils.js';

/** Current DTO-derived state needed to build a replace-on-PATCH widget patch. */
type FusionPatchContext = {
  currentDtoOptions: WidgetDto['options'] | undefined;
  currentStyleOptions: WidgetStyleOptions | undefined;
  currentCustomOptions: Record<string, unknown> | undefined;
  isCustomWidget: boolean;
  themeSettings: CompleteThemeSettingsInternal;
  appSettings: AppSettings;
};

/**
 * Translates a {@link WidgetPropsUpdate} into a narrow {@link WidgetPatch} body
 * (Fusion DTO-shaped). One entry per supported update field. The signature
 * receives the current `partialDtoOptions.options` snapshot so we can spread
 * existing option fields under the new value — Fusion replaces the entire
 * `options` object on PATCH rather than merging.
 *
 * Adding a new field here MUST be paired with a roundtrip test (see
 * __dev-docs__/unified-widget-updates-persistence.md §6.2).
 *
 * @internal
 */
function widgetPropsUpdateToFusionPatch(
  update: WidgetPropsUpdate,
  context: FusionPatchContext,
): WidgetPatch | undefined {
  const {
    currentDtoOptions,
    currentStyleOptions,
    currentCustomOptions,
    isCustomWidget,
    themeSettings,
    appSettings,
  } = context;
  let patch: WidgetPatch | undefined;

  const scrollerLocation = update.styleOptions?.navigator?.scrollerLocation;
  if (scrollerLocation) {
    patch = {
      ...patch,
      options: { ...currentDtoOptions, previousScrollerLocation: scrollerLocation },
    };
  } else if (update.styleOptions && isCustomWidget) {
    // Custom-widget styleOptions round-trip through the opaque DTO `style`.
    // Reconstruct the full style exactly as `toWidgetDto` does (deep-merging the
    // changed keys onto the current style and re-nesting widgetDesign) so it
    // survives the server's replace-on-PATCH.
    const mergedStyleOptions = deepMerge(currentStyleOptions ?? {}, update.styleOptions);
    // mergedStyleOptions is the full custom-widget style bag after merging. The
    // opaque DTO `style` field is known to satisfy both WidgetStyle and
    // WidgetStyleOptions after this merge (same shape as toWidgetDto produces),
    // so the cast is safe and required to satisfy withWidgetDesign's signature.
    patch = {
      ...patch,
      style: withWidgetDesign(
        mergedStyleOptions as WidgetStyle,
        mergedStyleOptions,
        themeSettings,
        appSettings,
      ),
    };
  }

  // Custom-widget options are deep-merged into the existing DTO bag — the server
  // replaces the whole `customOptions` object on PATCH, so we send the full bag.
  if (update.customOptions) {
    patch = {
      ...patch,
      customOptions: deepMerge(currentCustomOptions ?? {}, update.customOptions),
    };
  }

  return patch;
}

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
  themeSettings: CompleteThemeSettingsInternal;
  /**
   * Dashboard-level data source. Used as a fallback data source for widgets
   * whose model does not carry one (e.g. text widgets), so the produced DTO
   * still satisfies the server's datasource schema.
   */
  dashboardDataSource?: DataSource;
  /**
   * Pre-reducer dashboard model snapshot. Used by UPDATE_WIDGET to read
   * `widgetsOptions[oid].partialDtoOptions.options` so the Fusion PATCH carries
   * the full options object (Fusion replaces, not merges).
   *
   * @internal
   */
  model?: DashboardModel;
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
  dashboardDataSource,
  model,
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

      // Text widgets don't carry a data source in their widget model.
      // Fall back to the dashboard-level data source so the produced DTO
      // still satisfies the server's datasource schema.
      const dataSourceForDto =
        isTextWidget(inputWidget.widgetType) && dashboardDataSource
          ? convertJaqlDataSourceForDto(dashboardDataSource)
          : undefined;

      const widgetDto = withSpecificWidgetOptions(widgetOptions)(
        widgetModelTranslator.toWidgetDto(
          inputWidget,
          dataSourceForDto,
          themeSettings,
          appSettings,
        ),
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
    case UseDashboardModelActionType.UPDATE_WIDGET: {
      const { widgetOid, update } = action.payload;
      const currentWidget = model?.widgets?.find((widget) => widget.oid === widgetOid);
      const patch = widgetPropsUpdateToFusionPatch(update, {
        currentDtoOptions: model?.widgetsOptions?.[widgetOid]?.partialDtoOptions?.options,
        currentStyleOptions: currentWidget?.styleOptions,
        currentCustomOptions: currentWidget?.customOptions,
        isCustomWidget: currentWidget?.widgetType === 'custom',
        themeSettings,
        appSettings,
      });
      if (!patch) {
        console.error(
          '[persistDashboardModelMiddleware] UPDATE_WIDGET has no DTO mapping:',
          update,
        );
        break;
      }
      restApi.patchWidgetInDashboard(dashboardOid, widgetOid, patch, sharedMode).catch((error) => {
        console.error('Failed to update widget in dashboard:', error);
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
