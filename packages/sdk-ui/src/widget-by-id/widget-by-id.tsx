import { useMemo, type FunctionComponent } from 'react';
import { type Filter } from '@sisense/sdk-data';
import { ChartWidget } from '../widgets/chart-widget.js';
import {
  ChartWidgetProps,
  TextWidgetProps,
  PivotTableWidgetProps,
  WidgetByIdProps,
} from '../props.js';
import { useThemeContext } from '../theme-provider/index.js';
import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component.js';
import {
  convertFilterRelationsModelToJaql,
  getFilterRelationsFromJaql,
  isPivotTableWidget,
  isTextWidget,
  mergeFilters,
  mergeFiltersByStrategy,
} from './utils.js';
import { extractDashboardFiltersForWidget } from './translate-dashboard-filters.js';
import { useFetchWidgetDtoModel } from './use-fetch-widget-dto-model.js';
import { WidgetModel, widgetModelTranslator } from '../models/index.js';
import { WidgetType } from './types.js';
import { PivotTableWidget } from '@/widgets/pivot-table-widget';
import { useSisenseContext } from '@/sisense-context/sisense-context';
import { isTextWidgetProps, TextWidget } from '@/widgets/text-widget';
import { DashboardDto } from '@/api/types/dashboard-dto';

function getWidgetProps(widgetModel: WidgetModel): {
  props: TextWidgetProps | ChartWidgetProps | PivotTableWidgetProps;
  widgetType: WidgetType;
} {
  const { widgetType } = widgetModel;
  let props;

  if (isPivotTableWidget(widgetType)) {
    props = widgetModelTranslator.toPivotTableWidgetProps(widgetModel);
  } else if (isTextWidget(widgetType)) {
    props = widgetModelTranslator.toTextWidgetProps(widgetModel);
  } else {
    props = widgetModelTranslator.toChartWidgetProps(widgetModel);
  }

  return {
    props,
    widgetType,
  };
}

/**
 * The WidgetById component, which is a thin wrapper on the {@link ChartWidget} component,
 * is used to render a widget created in a Sisense Fusion instance.
 *
 * To learn more about using Sisense Fusion Widgets in Compose SDK,
 * see [Sisense Fusion Widgets](/guides/sdk/guides/charts/guide-fusion-widgets.html).
 *
 * **Note:** Widget extensions based on JS scripts and add-ons in Fusion are not supported.
 *
 * ## Example
 *
 * Display two dashboard widgets from a Fusion instance.
 *
 * <iframe
 *  src='https://csdk-playground.sisense.com/?example=fusion-assets%2Ffusion-widgets&mode=docs'
 *  width=800
 *  height=870
 *  style='border:none;'
 * />
 *
 * @group Fusion Assets
 * @fusionEmbed
 */
export const WidgetById: FunctionComponent<WidgetByIdProps> = asSisenseComponent({
  componentName: 'WidgetById',
  customContextErrorMessageKey: 'errors.widgetByIdNoSisenseContext',
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

    const widgetModel = widgetModelTranslator.fromWidgetDto(
      fetchedWidget,
      themeSettings,
      app?.settings,
    );
    const extractedWidgetProps = getWidgetProps(widgetModel);
    if (isTextWidgetProps(extractedWidgetProps.props)) {
      return { widgetType: 'richtexteditor', props: extractedWidgetProps.props };
    }
    if (includeDashboardFilters) {
      const { filters: dashboardFilters, highlights: dashboardHighlights } =
        extractDashboardFiltersForWidget(fetchedDashboard as DashboardDto, fetchedWidget);

      extractedWidgetProps.props.filters = mergeFilters(
        dashboardFilters,
        extractedWidgetProps.props.filters as Filter[],
      );
      (extractedWidgetProps.props as ChartWidgetProps).highlights = dashboardHighlights;
    }

    return extractedWidgetProps;
  }, [fetchedWidget, fetchedDashboard, themeSettings, includeDashboardFilters, app?.settings]);

  if (!fetchedProps) {
    return null;
  }

  // if filter relations are set on the widget, additionally provided filters will be ignored
  // since there is not enough information how to merge them
  const filters = isTextWidgetProps(fetchedProps)
    ? []
    : mergeFiltersByStrategy(
        fetchedProps?.filters as Filter[],
        restProps.filters,
        restProps.filtersMergeStrategy,
      );

  const highlights = isTextWidgetProps(fetchedProps)
    ? []
    : mergeFiltersByStrategy(
        (fetchedProps as ChartWidgetProps)?.highlights,
        restProps.highlights,
        restProps.filtersMergeStrategy,
      );

  const filterRelations = getFilterRelationsFromJaql(
    filters,
    highlights,
    convertFilterRelationsModelToJaql(
      fetchedDashboard?.filterRelations?.length
        ? fetchedDashboard?.filterRelations[0].filterRelations
        : undefined,
    ),
  );

  if (isTextWidgetProps(fetchedProps)) {
    return <TextWidget {...fetchedProps} />;
  }
  if (isPivotTableWidget(widgetType)) {
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
