import { useCallback, useEffect, useMemo, useState } from 'react';
import cloneDeep from 'lodash-es/cloneDeep';
import { DashboardProps } from '@/dashboard/types';
import { DashboardContainer } from '@/dashboard/components/dashboard-container';
import { useCommonFilters } from '@/common-filters/use-common-filters';
import { ThemeProvider, useThemeContext } from '@/theme-provider';
import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';
import { WidgetProps } from '@/props';
import { MenuProvider } from '@/common/components/menu/menu-provider';
import { MenuOptions } from '@/common/components/menu/types';
import { useCombinedMenu } from '@/common/hooks/use-combined-menu';
import { MenuIds } from '@/common/components/menu/menu-ids';
import { defaultMerger, useWithChangeDetection } from '@/common/hooks/use-with-change-detection';

function combineCommonFiltersAndWidgetMenus(
  commonFiltersMenuOptions: MenuOptions,
  drilldownMenuOptions: MenuOptions,
): MenuOptions {
  const drilldownMenuItemsWithoutSelectionSection = drilldownMenuOptions.itemSections.filter(
    ({ id }) => id !== MenuIds.DRILLDOWN_CHART_POINTS_SELECTION,
  );
  return {
    ...commonFiltersMenuOptions,
    itemSections: [
      ...commonFiltersMenuOptions.itemSections,
      ...drilldownMenuItemsWithoutSelectionSection,
    ],
  };
}

function isDrilldownMenu(options: MenuOptions): boolean {
  return options.itemSections.some(({ id }) => id === MenuIds.DRILLDOWN_CHART_POINTS_SELECTION);
}

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
 *
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
  }: DashboardProps) => {
    const { palette, ...restDashboardStyles } = styleOptions ?? {};

    const [innerWidgets, setInnerWidgets] = useState<WidgetProps[]>(widgets);
    const { themeSettings } = useThemeContext();
    const { openMenu, onBeforeMenuOpen } = useCombinedMenu({
      isTargetMenu: isDrilldownMenu,
      combineMenus: combineCommonFiltersAndWidgetMenus,
    });
    const {
      filters: commonFilters,
      setFilters,
      connectToWidgetProps,
    } = useCommonFilters({ initialFilters: filters, openMenu });

    const widgetsWithChangeDetection = useWithChangeDetection({
      target: innerWidgets,
      onChange: useCallback((delta: Partial<WidgetProps>, index?: number) => {
        setInnerWidgets((existingInnerWidgets) => {
          const newInnerWidgets = cloneDeep(existingInnerWidgets);
          newInnerWidgets[index!] = defaultMerger(existingInnerWidgets[index!], delta);
          return newInnerWidgets;
        });
      }, []),
    }) as WidgetProps[];

    const widgetsWithCommonFilters = useMemo(() => {
      return widgetsWithChangeDetection.map((widget) =>
        connectToWidgetProps(widget, widgetsOptions?.[widget.id]?.filtersOptions),
      );
    }, [widgetsWithChangeDetection, widgetsOptions, connectToWidgetProps]);

    useEffect(() => {
      if (filters) setFilters(filters);
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
        <MenuProvider onBeforeMenuOpen={onBeforeMenuOpen}>
          <DashboardContainer
            title={title}
            layoutOptions={layoutOptions}
            config={config}
            widgets={widgetsWithCommonFilters}
            defaultDataSource={defaultDataSource}
            filters={commonFilters}
            onFiltersChange={setFilters}
          />
        </MenuProvider>
      </ThemeProvider>
    );
  },
);
