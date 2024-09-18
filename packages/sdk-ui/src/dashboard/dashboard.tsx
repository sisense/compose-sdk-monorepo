import { DashboardProps } from '@/dashboard/types';
import { DashboardContainer } from '@/dashboard/components/dashboard-container';
import { useEffect, useMemo, useState } from 'react';
import { WidgetModel } from '@/models';
import { useCommonFilters } from '@/common-filters/use-common-filters';
import { ThemeProvider, useThemeContext } from '@/theme-provider';
import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';

/**
 * React component that renders a dashboard whose elements are customizable. It includes internal logic of applying common filters to widgets.
 *
 * **Note:** Dashboard extensions based on JS scripts and add-ons in Fusion are not supported.
 *
 * @example
 *
 * ```ts
 * import { Dashboard, useGetDashboardModel } from '@sisense/sdk-ui';

const CodeExample = () => {
  const { dashboard } = useGetDashboardModel({
    dashboardOid: '65a82171719e7f004018691c',
    includeFilters: true,
    includeWidgets: true,
  });

  return (
    <>
      {dashboard && (
        <Dashboard
        defaultDataSource={dashboard.dataSource}
        title={dashboard.title}
        layout={dashboard.layout}
        styleOptions={dashboard.styleOptions}
        widgets={dashboard.widgets}
        filters={dashboard.filters}
        widgetFilterOptions={
          dashboard.widgetFilterOptions
        }
        />
      )}
    </>
  );
};

export default CodeExample;
 * ```
 *
 * @group Fusion Embed
 * @fusionEmbed
 * @alpha
 */
export const Dashboard = asSisenseComponent({
  componentName: 'Dashboard',
})(
  ({
    title,
    layout,
    widgets,
    filters,
    defaultDataSource,
    widgetFilterOptions,
    styleOptions,
  }: DashboardProps) => {
    const {
      filters: commonFilters,
      setFilters,
      connectToWidgetModel,
    } = useCommonFilters({ initialFilters: filters });
    const [innerWidgets, setInnerWidgets] = useState<WidgetModel[]>(widgets);
    const { themeSettings } = useThemeContext();
    const { palette, ...restDashboardStyles } = styleOptions;

    const widgetsWithCommonFilters = useMemo(() => {
      return innerWidgets.map((widget) =>
        connectToWidgetModel(widget, widgetFilterOptions?.[widget.oid]),
      );
    }, [innerWidgets, widgetFilterOptions, connectToWidgetModel]);

    useEffect(() => {
      setFilters(filters);
    }, [filters, setFilters]);

    useEffect(() => {
      setInnerWidgets(widgets);
    }, [widgets]);
    return (
      <ThemeProvider
        theme={{
          ...(palette && { palette }),
          dashboard: {
            ...themeSettings.dashboard,
            ...restDashboardStyles,
          },
        }}
      >
        <DashboardContainer
          title={title}
          layout={layout}
          widgets={widgetsWithCommonFilters}
          defaultDataSource={defaultDataSource}
          filters={commonFilters}
          onFiltersChange={setFilters}
        />
      </ThemeProvider>
    );
  },
);
