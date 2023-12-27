import React, { useMemo, type FunctionComponent } from 'react';
import { ChartWidget } from '../widgets/chart-widget';
import { TableWidget } from '../widgets/table-widget';
import { extractWidgetProps } from './translate-widget';
import { ChartWidgetProps, DashboardWidgetProps } from '../props';
import { useThemeContext } from '../theme-provider';
import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component';
import { mergeFilters, mergeFiltersByStrategy } from './utils';
import { extractDashboardFiltersForWidget } from './translate-dashboard-filters';
import { useFetchWidgetDtoModel } from './use-fetch-widget-dto-model';
import { Filter } from '@sisense/sdk-data';

/**
 * The Dashboard Widget component, which is a thin wrapper on the {@link ChartWidget} component,
 * used to render a widget created in the Sisense instance.
 *
 * @example
 * The example below renders a dashboard widget with the specified widget and dashboard OIDs.
 * ```tsx
 * <DashboardWidget
 *   widgetOid={'64473e07dac1920034bce77f'}
 *   dashboardOid={'6441e728dac1920034bce737'}
 * />
 * ```
 */
export const DashboardWidget: FunctionComponent<DashboardWidgetProps> = asSisenseComponent({
  componentName: 'DashboardWidget',
  customContextErrorMessageKey: 'errors.dashboardWidgetNoSisenseContext',
})((props) => {
  const { widgetOid, dashboardOid, includeDashboardFilters, ...restProps } = props;
  const { themeSettings } = useThemeContext();
  const {
    widget: fetchedWidget,
    dashboard: fetchedDashboard,
    error: fetchError,
  } = useFetchWidgetDtoModel({
    widgetOid,
    dashboardOid,
    includeDashboard: includeDashboardFilters,
  });

  if (fetchError) {
    throw fetchError;
  }

  const { type: widgetType, props: fetchedProps } = useMemo(() => {
    if (!fetchedWidget) {
      return { type: null, props: null };
    }

    const extractedWidgetProps = extractWidgetProps(fetchedWidget, themeSettings);

    if (includeDashboardFilters) {
      const { filters: dashboardFilters, highlights: dashboardHighlights } =
        extractDashboardFiltersForWidget(fetchedDashboard!, fetchedWidget);
      extractedWidgetProps.props.filters = mergeFilters(
        dashboardFilters,
        extractedWidgetProps.props.filters as Filter[],
      );
      (extractedWidgetProps.props as ChartWidgetProps).highlights = dashboardHighlights;
    }

    return extractedWidgetProps;
  }, [fetchedWidget, fetchedDashboard, themeSettings, includeDashboardFilters]);

  const filters = mergeFiltersByStrategy(
    fetchedProps?.filters as Filter[],
    restProps.filters,
    restProps.filtersMergeStrategy,
  );

  const highlights = mergeFiltersByStrategy(
    (fetchedProps as ChartWidgetProps)?.highlights,
    restProps.highlights,
    restProps.filtersMergeStrategy,
  );

  if (!fetchedProps) {
    return null;
  }
  return widgetType === 'table' ? (
    <TableWidget
      {...fetchedProps}
      {...restProps}
      filters={filters}
      styleOptions={{
        ...fetchedProps.styleOptions,
        ...props.styleOptions,
      }}
    />
  ) : (
    <ChartWidget
      {...fetchedProps}
      {...restProps}
      filters={filters}
      highlights={highlights}
      drilldownOptions={{
        ...fetchedProps.drilldownOptions,
        ...props.drilldownOptions,
      }}
      styleOptions={{
        ...fetchedProps.styleOptions,
        ...props.styleOptions,
      }}
    />
  );
});
