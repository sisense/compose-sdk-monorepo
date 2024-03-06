/* eslint-disable max-lines-per-function */
import React, { useMemo, type FunctionComponent } from 'react';
import { type Filter } from '@sisense/sdk-data';
import { ChartWidget } from '../widgets/chart-widget';
import { TableWidget } from '../widgets/table-widget';
import { ChartWidgetProps, DashboardWidgetProps, TableWidgetProps } from '../props';
import { useThemeContext } from '../theme-provider';
import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component';
import {
  convertFilterRelationsModelToJaql,
  getFilterRelationsFromJaql,
  isTabularWidget,
  mergeFilters,
  mergeFiltersByStrategy,
} from './utils';
import { extractDashboardFiltersForWidget } from './translate-dashboard-filters';
import { useFetchWidgetDtoModel } from './use-fetch-widget-dto-model';
import { WidgetModel } from '../models';

/**
 * The Dashboard Widget component, which is a thin wrapper on the {@link ChartWidget} component,
 * is used to render a widget created in a Sisense Fusion instance.
 *
 * To learn more about using Sisense Fusion Widgets in Compose SDK,
 * see [Sisense Fusion Widgets](/guides/sdk/guides/charts/guide-fusion-widgets.html).
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

  if (fetchError) throw fetchError;

  const { widgetType, props: fetchedProps } = useMemo(() => {
    if (!fetchedWidget) {
      return { widgetType: null, props: null };
    }

    const widgetModel = new WidgetModel(fetchedWidget, themeSettings);
    const extractedWidgetProps = {
      props: isTabularWidget(widgetModel.widgetType)
        ? widgetModel.getTableWidgetProps()
        : widgetModel.getChartWidgetProps(),
      widgetType: widgetModel.widgetType,
    };

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

  // if filter relations are set on dashboard widget, additionally provided filters will be ignored
  // since there is not enough information how to merge them
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
  const filterRelations = getFilterRelationsFromJaql(
    filters,
    convertFilterRelationsModelToJaql(
      fetchedDashboard?.filterRelations?.length
        ? fetchedDashboard?.filterRelations[0].filterRelations
        : undefined,
    ),
  );

  return isTabularWidget(widgetType) ? (
    <TableWidget
      {...(fetchedProps as TableWidgetProps)}
      {...restProps}
      filters={filterRelations}
      styleOptions={{
        ...fetchedProps.styleOptions,
        ...props.styleOptions,
      }}
    />
  ) : (
    <ChartWidget
      {...(fetchedProps as ChartWidgetProps)}
      {...restProps}
      filters={filterRelations}
      highlights={highlights}
      drilldownOptions={{
        ...(fetchedProps as ChartWidgetProps).drilldownOptions,
        ...props.drilldownOptions,
      }}
      styleOptions={{
        ...fetchedProps.styleOptions,
        ...props.styleOptions,
      }}
    />
  );
});
