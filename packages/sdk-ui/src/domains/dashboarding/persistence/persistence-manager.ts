import type {
  SpecificWidgetOptions,
  UseDashboardModelResult,
  WidgetsPanelLayout,
} from '@/domains/dashboarding/dashboard-model';
import { UseDashboardModelActionType } from '@/domains/dashboarding/dashboard-model/use-dashboard-model/dashboard-model-reducer/types.js';
import type { WidgetModel } from '@/domains/widgets/widget-model';
import { widgetModelTranslator } from '@/domains/widgets/widget-model';

import type { DashboardPersistenceManager } from './types.js';

/**
 * Creates a {@link DashboardPersistenceManager} that forwards add/patch operations through
 * the same `dispatchChanges` function returned by {@link useDashboardModelInternal} /
 *
 * @param dispatchDashboardModelChanges - Dashboard model dispatch (e.g. `dispatchChanges` from `useDashboardModelInternal`)
 * @returns Persistence manager for the composition layer
 * @sisenseInternal
 */
export function createDashboardPersistenceManager(
  dispatchDashboardModelChanges: UseDashboardModelResult['dispatchChanges'],
): DashboardPersistenceManager {
  return {
    addWidget: async (widgetProps, widgetsPanelLayout, widgetOptions?: SpecificWidgetOptions) => {
      const widgetModel = widgetModelTranslator.fromWidgetProps(widgetProps);
      const processedAction = await dispatchDashboardModelChanges({
        type: UseDashboardModelActionType.ADD_WIDGET,
        payload: { widget: widgetModel, widgetsPanelLayout, widgetOptions },
      });
      const payload = processedAction.payload as {
        widget: WidgetModel;
        widgetsPanelLayout: WidgetsPanelLayout;
        widgetOptions?: SpecificWidgetOptions;
      };
      const widget = widgetModelTranslator.toWidgetProps(payload.widget);
      return {
        widget,
        widgetsPanelLayout: payload.widgetsPanelLayout,
        widgetOptions: payload.widgetOptions,
      };
    },
    patchWidget: async (widgetOid, patch) => {
      await dispatchDashboardModelChanges({
        type: UseDashboardModelActionType.PATCH_WIDGET,
        payload: { widgetOid, patch },
      });
    },
  };
}
