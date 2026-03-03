import { useCallback, useMemo } from 'react';

import * as dashboardModelTranslator from '@/domains/dashboarding/dashboard-model/dashboard-model-translator';
import { UseDashboardModelActionType } from '@/domains/dashboarding/dashboard-model/use-dashboard-model/dashboard-model-reducer/types.js';
import { useDashboardModelInternal } from '@/domains/dashboarding/dashboard-model/use-dashboard-model/use-dashboard-model';
import { dashboardChangeEventToUseDashboardModelAction } from '@/domains/dashboarding/dashboard-model/use-dashboard-model/use-dashboard-model-utils';
import { WidgetModel, widgetModelTranslator } from '@/domains/widgets/widget-model';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import { TranslatableError } from '@/infra/translation/translatable-error';
import { LoadingOverlay } from '@/shared/components/loading-overlay';
import { useDefaults } from '@/shared/hooks/use-defaults';

import { DEFAULT_DASHBOARD_BY_ID_CONFIG } from './constants.js';
import { Dashboard } from './dashboard.js';
import {
  DashboardByIdProps,
  DashboardChangeEvent,
  DashboardConfig,
  DashboardPersistenceManager,
  SpecificWidgetOptions,
  WidgetsPanelLayout,
} from './types.js';

/**
 * React component that renders a dashboard created in Sisense Fusion by its ID.
 *
 * **Note:** Dashboard and Widget extensions based on JS scripts and add-ons in Fusion – for example, Blox and Jump To Dashboard – are not supported.
 *
 * @example
 *
 * ```ts
 * import { DashboardById } from '@sisense/sdk-ui';

  const CodeExample = () => {
    return (
      <>
        <DashboardById
          dashboardOid="65a82171719e7f004018691c"
        />
      </>
    );
  };

  export default CodeExample;
 * ```
 *
 * To learn more about this and related dashboard components,
 * see [Embedded Dashboards](/guides/sdk/guides/dashboards/index.html).
 * @group Fusion Assets
 * @fusionEmbed
 */
export const DashboardById = asSisenseComponent({
  componentName: 'DashboardById',
})(({ dashboardOid, config: propConfig }: DashboardByIdProps) => {
  const config = useDefaults(propConfig, DEFAULT_DASHBOARD_BY_ID_CONFIG);
  const { app } = useSisenseContext();

  const { dashboard, isLoading, isError, error, dispatchChanges } = useDashboardModelInternal({
    dashboardOid,
    includeWidgets: true,
    includeFilters: true,
    persist: config.persist,
    sharedMode: config.sharedMode,
  });

  const handleChange = useCallback(
    (event: DashboardChangeEvent) => {
      const useDashModelAction = dashboardChangeEventToUseDashboardModelAction(event);
      if (useDashModelAction) {
        void dispatchChanges(useDashModelAction);
      }
    },
    [dispatchChanges],
  );

  const persistence: DashboardPersistenceManager = useMemo(
    () => ({
      addWidget: async (widgetProps, widgetsPanelLayout, widgetOptions?: SpecificWidgetOptions) => {
        const widgetModel = widgetModelTranslator.fromWidgetProps(widgetProps);
        const processedAction = await dispatchChanges({
          type: UseDashboardModelActionType.ADD_WIDGET,
          payload: { widget: widgetModel, widgetsPanelLayout, widgetOptions },
        });
        const payload = processedAction.payload as {
          widget: WidgetModel;
          widgetsPanelLayout?: WidgetsPanelLayout;
          widgetOptions?: SpecificWidgetOptions;
        };
        const widget = widgetModelTranslator.toWidgetProps(payload.widget);
        return {
          widget,
          widgetsPanelLayout: payload.widgetsPanelLayout!,
          widgetOptions: payload.widgetOptions,
        };
      },
    }),
    [dispatchChanges],
  );

  if (isError && error)
    throw new TranslatableError('errors.dashboardLoadFailed', { error: error.message });

  const dashboardProps = useMemo(() => {
    return dashboard && dashboardModelTranslator.toDashboardProps(dashboard);
  }, [dashboard]);

  const propsConfigInternal: DashboardConfig = useMemo(
    () => ({
      ...propConfig,
      widgetsPanel: {
        ...propConfig?.widgetsPanel,
        editMode: {
          ...propConfig?.widgetsPanel?.editMode,
          duplicateWidget: {
            enabled: propConfig?.widgetsPanel?.editMode?.duplicateWidget?.enabled ?? false,
          },
          enabled: Boolean(
            app?.settings?.user?.permissions?.dashboards?.edit_layout &&
              propConfig?.widgetsPanel?.editMode?.enabled,
          ),
        },
      },
    }),
    [propConfig, app?.settings?.user?.permissions?.dashboards?.edit_layout],
  );

  const dashboardConfig = useDefaults<DashboardConfig>(
    propsConfigInternal,
    useDefaults(dashboardProps?.config, DEFAULT_DASHBOARD_BY_ID_CONFIG),
  );

  return (
    <LoadingOverlay isVisible={isLoading}>
      {dashboardProps && (
        <Dashboard
          {...dashboardProps}
          persistence={config.persist ? persistence : undefined}
          onChange={handleChange}
          config={dashboardConfig}
        />
      )}
    </LoadingOverlay>
  );
});
