import { DashboardProps } from '@/dashboard/types';
import { DashboardContainer } from '@/dashboard/components/dashboard-container';
import { ThemeProvider } from '@/theme-provider';
import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';
import { useDashboardTheme } from './use-dashboard-theme';
import { useComposedDashboard } from './use-composed-dashboard';
import { Filter } from '@sisense/sdk-data';
import { useCallback } from 'react';

export enum DashboardChangeType {
  /** Dashboard filters have been updated */
  FILTERS_UPDATE = 'FILTERS.UPDATE',
}

export type DashboardChangeAction = {
  type: DashboardChangeType.FILTERS_UPDATE;
  payload: Filter[];
};

/**
 * React component that renders a dashboard whose elements are customizable. It includes internal logic of applying common filters to widgets.
 *
 * **Note:** Dashboard extensions based on JS scripts and add-ons in Fusion are not supported.
 *
 * @example
 *
 * Example of rendering a Fusion dashboard using the `useGetDashboardModel hook and the `Dashboard` component.
 *
 * ```ts
 * import { Dashboard, useGetDashboardModel, dashboardModelTranslator } from '@sisense/sdk-ui';

const CodeExample = () => {
  const { dashboard } = useGetDashboardModel({
    dashboardOid: '65a82171719e7f004018691c',
    includeFilters: true,
    includeWidgets: true,
  });

  return (
    <>
      {dashboard && (
        <Dashboard {...dashboardModelTranslator.toDashboardProps(dashboard)} />
      )}
    </>
  );
};

export default CodeExample;
 * ```
 *
 * To learn more about this and related dashboard components,
 * see [Embedded Dashboards](/guides/sdk/guides/dashboards/index.html).
 * @group Dashboards
 * @beta
 */
export const Dashboard = asSisenseComponent({
  componentName: 'Dashboard',
})(
  ({
    title = '',
    layoutOptions,
    config,
    widgets,
    filters,
    defaultDataSource,
    widgetsOptions,
    styleOptions,
    onChange,
  }: DashboardProps) => {
    const { themeSettings } = useDashboardTheme({ styleOptions });

    const {
      dashboard: { filters: dashboardFilters = [], widgets: dashboardWidgets },
      setFilters,
    } = useComposedDashboard(
      {
        filters,
        widgets,
        widgetsOptions,
      },
      {
        onFiltersChange: useCallback(
          (filters: Filter[]) => {
            onChange?.({ type: DashboardChangeType.FILTERS_UPDATE, payload: filters });
          },
          [onChange],
        ),
      },
    );

    return (
      <ThemeProvider theme={themeSettings}>
        <DashboardContainer
          title={title}
          layoutOptions={layoutOptions}
          config={config}
          widgets={dashboardWidgets}
          defaultDataSource={defaultDataSource}
          filters={dashboardFilters}
          onFiltersChange={setFilters}
        />
      </ThemeProvider>
    );
  },
);
