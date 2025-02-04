import { Dashboard, DashboardChangeAction } from './dashboard';
import { DashboardByIdProps } from './types';
import { LoadingOverlay } from '@/common/components/loading-overlay';
import { useThemeContext } from '@/theme-provider';
import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';
import * as dashboardModelTranslator from '@/models/dashboard/dashboard-model-translator';
import { useDashboardModel } from '@/models/dashboard/use-dashboard-model/use-dashboard-model';
import { useCallback } from 'react';
import { dashboardChangeActionToUseDashboardModelAction } from '@/models/dashboard/use-dashboard-model/use-dasboard-model-utils';
import { TranslatableError } from '@/translation/translatable-error';

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
})(({ dashboardOid, persist = false, enableFilterEditor = false }: DashboardByIdProps) => {
  const { themeSettings } = useThemeContext();
  const { dashboard, isLoading, isError, error, dispatchChanges } = useDashboardModel({
    dashboardOid,
    includeWidgets: true,
    includeFilters: true,
    persist,
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

  return (
    <LoadingOverlay themeSettings={themeSettings} isVisible={isLoading}>
      {dashboard && (
        <Dashboard
          {...dashboardModelTranslator.toDashboardProps(dashboard)}
          onChange={handleChange}
          enableFilterEditor={enableFilterEditor}
        />
      )}
    </LoadingOverlay>
  );
});
