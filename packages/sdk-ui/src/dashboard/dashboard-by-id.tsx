import { useCallback, useMemo } from 'react';

import { LoadingOverlay } from '@/common/components/loading-overlay';
import { useDefaults } from '@/common/hooks/use-defaults';
import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';
import * as dashboardModelTranslator from '@/models/dashboard/dashboard-model-translator';
import { dashboardChangeActionToUseDashboardModelAction } from '@/models/dashboard/use-dashboard-model/use-dasboard-model-utils';
import { useDashboardModelInternal } from '@/models/dashboard/use-dashboard-model/use-dashboard-model';
import { useSisenseContext } from '@/sisense-context/sisense-context';
import { TranslatableError } from '@/translation/translatable-error';

import { DEFAULT_DASHBOARD_BY_ID_CONFIG } from './constants';
import { Dashboard, DashboardChangeAction } from './dashboard';
import { DashboardByIdProps, DashboardConfig } from './types';

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
    (action: DashboardChangeAction) => {
      const useDashModelAction = dashboardChangeActionToUseDashboardModelAction(action);
      if (useDashModelAction) {
        dispatchChanges(useDashModelAction);
      }
    },
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
        <Dashboard {...dashboardProps} onChange={handleChange} config={dashboardConfig} />
      )}
    </LoadingOverlay>
  );
});
