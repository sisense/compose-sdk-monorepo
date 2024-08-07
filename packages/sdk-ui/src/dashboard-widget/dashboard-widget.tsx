import { useMemo, type FunctionComponent } from 'react';
import { type Filter } from '@sisense/sdk-data';
import { ChartWidget } from '../widgets/chart-widget';
import { ChartWidgetProps, DashboardWidgetProps } from '../props';
import { useThemeContext } from '../theme-provider';
import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component';
import {
  convertFilterRelationsModelToJaql,
  getFilterRelationsFromJaql,
  isPivotWidget,
  mergeFilters,
  mergeFiltersByStrategy,
} from './utils';
import { extractDashboardFiltersForWidget } from './translate-dashboard-filters';
import { useFetchWidgetDtoModel } from './use-fetch-widget-dto-model';
import { WidgetModel } from '../models';
import { PivotTableWidgetProps } from '..';
import { PivotTableWidget } from '@/widgets/pivot-table-widget';
import { useSisenseContext } from '@/sisense-context/sisense-context';

function getWidgetProps(widgetModel: WidgetModel) {
  const { widgetType } = widgetModel;
  let props;

  if (isPivotWidget(widgetType)) {
    props = widgetModel.getPivotTableWidgetProps();
  } else {
    props = widgetModel.getChartWidgetProps();
  }

  return {
    props,
    widgetType,
  };
}

/**
 * The Dashboard Widget component, which is a thin wrapper on the {@link ChartWidget} component,
 * is used to render a widget created in a Sisense Fusion instance.
 *
 * To learn more about using Sisense Fusion Widgets in Compose SDK,
 * see [Sisense Fusion Widgets](/guides/sdk/guides/charts/guide-fusion-widgets.html).
 *
 * **Note:** Widget extensions based on JS scripts and add-ons in Fusion are not supported.
 *
 * ## Example
 *
 * Display two dashboard widgets from a Fusion Embed instance.
 *
 * <iframe
 *  src='https://csdk-playground.sisense.com/?example=fusion-assets%2Ffusion-widgets&mode=docs'
 *  width=800
 *  height=870
 *  style='border:none;'
 * />
 *
 * @group Fusion Embed
 * @fusionEmbed
 */
export const DashboardWidget: FunctionComponent<DashboardWidgetProps> = asSisenseComponent({
  componentName: 'DashboardWidget',
  customContextErrorMessageKey: 'errors.dashboardWidgetNoSisenseContext',
})((props) => {
  const { widgetOid, dashboardOid, includeDashboardFilters, ...restProps } = props;
  const { themeSettings } = useThemeContext();
  const { app } = useSisenseContext();

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

    const widgetModel = new WidgetModel(fetchedWidget, themeSettings, app?.settings);
    const extractedWidgetProps = getWidgetProps(widgetModel);
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
  }, [fetchedWidget, fetchedDashboard, themeSettings, includeDashboardFilters, app?.settings]);

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

  if (isPivotWidget(widgetType)) {
    return (
      <PivotTableWidget
        {...(fetchedProps as PivotTableWidgetProps)}
        {...restProps}
        filters={filterRelations}
        highlights={highlights}
        styleOptions={{
          ...fetchedProps.styleOptions,
          ...props.styleOptions,
        }}
      />
    );
  }

  return (
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
