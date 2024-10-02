import { useGetDashboardModel } from '@/models';
import { Dashboard } from './dashboard';
import { DashboardByIdProps } from './types';
import { LoadingOverlay } from '@/common/components/loading-overlay';
import { useThemeContext } from '@/theme-provider';
import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';
import * as dashboardModelTranslator from '@/models/dashboard/dashboard-model-translator';

/**
 * React component that renders a dashboard created in Sisense Fusion by its ID.
 *
 * **Note:** Dashboard extensions based on JS scripts and add-ons in Fusion are not supported.
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
 * @group Fusion Embed
 * @fusionEmbed
 * @beta
 */
export const DashboardById = asSisenseComponent({
  componentName: 'DashboardById',
})(({ dashboardOid }: DashboardByIdProps) => {
  const { themeSettings } = useThemeContext();
  const { dashboard, isLoading, isError } = useGetDashboardModel({
    dashboardOid,
    includeWidgets: true,
    includeFilters: true,
  });

  if (isError) throw new Error('Failed to load Dashboard');

  return (
    <LoadingOverlay themeSettings={themeSettings} isVisible={isLoading}>
      {dashboard && <Dashboard {...dashboardModelTranslator.toDashboardProps(dashboard)} />}
    </LoadingOverlay>
  );
});
