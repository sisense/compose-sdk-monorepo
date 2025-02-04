import { useCallback, type FunctionComponent } from 'react';
import { ChartWidget } from '../widgets/chart-widget.js';
import { WidgetByIdProps, WidgetProps } from '../props.js';
import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component.js';
import { isChartWidgetProps, isPivotTableWidgetProps } from './utils.js';
import { dashboardModelTranslator, widgetModelTranslator } from '../models/index.js';
import { PivotTableWidget } from '@/widgets/pivot-table-widget';
import { isTextWidgetProps, TextWidget } from '@/widgets/text-widget';
import { useCommonFilters } from '@/common-filters/use-common-filters.js';
import { useGetDashboardModelAndWidgetModel } from './use-get-dashboard-model-and-widget-model.js';
import flow from 'lodash-es/flow';
import omitBy from 'lodash-es/omitBy';
import isUndefined from 'lodash-es/isUndefined';
import { mergeFiltersByStrategy } from '@/utils/filter-relations.js';

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
  const {
    widgetOid,
    dashboardOid,
    includeDashboardFilters,
    filters: filtersFromProps,
    highlights: highlightsFromProps,
    filtersMergeStrategy,
    ...restProps
  } = props;

  const { dashboardModel, widgetModel } = useGetDashboardModelAndWidgetModel({
    widgetOid,
    dashboardOid,
    shouldLoadFullDashboard: includeDashboardFilters,
  });

  const widgetProps: WidgetProps | null = widgetModel
    ? widgetModelTranslator.toWidgetProps(widgetModel)
    : null;

  const dashboardFiltersToMergeWith = dashboardModel
    ? dashboardModelTranslator.toDashboardProps(dashboardModel).filters
    : undefined;

  const { connectToWidgetProps: updateWidgetPropsWithDashboardFilters } = useCommonFilters({
    initialFilters: dashboardFiltersToMergeWith,
  });

  const withDashboardFilters = useCallback(
    (widgetProps: WidgetProps) => {
      if (!includeDashboardFilters || !dashboardModel) {
        return widgetProps;
      }

      return updateWidgetPropsWithDashboardFilters(widgetProps, {
        ...dashboardModel.widgetsOptions?.[widgetOid]?.filtersOptions,
        shouldAffectFilters: false,
      });
    },
    [dashboardModel, includeDashboardFilters, updateWidgetPropsWithDashboardFilters, widgetOid],
  );

  const withFiltersFromProps = useCallback(
    (widgetProps: WidgetProps) => {
      if (!filtersFromProps || !('filters' in widgetProps)) {
        return widgetProps;
      }
      const mergedFilters = mergeFiltersByStrategy(
        widgetProps.filters,
        filtersFromProps,
        filtersMergeStrategy,
      );
      return { ...widgetProps, filters: mergedFilters };
    },
    [filtersFromProps, filtersMergeStrategy],
  );

  const withHighlightsFromProps = useCallback(
    (widgetProps: WidgetProps) => {
      if (!highlightsFromProps || !('highlights' in widgetProps)) {
        return widgetProps;
      }
      const mergedHighlights = mergeFiltersByStrategy(
        widgetProps.highlights,
        highlightsFromProps,
        filtersMergeStrategy,
      );
      return { ...widgetProps, highlights: mergedHighlights };
    },
    [filtersMergeStrategy, highlightsFromProps],
  );

  if (!widgetProps) {
    return null;
  }

  const updatedWidgetProps = flow([
    withDashboardFilters,
    withFiltersFromProps,
    withHighlightsFromProps,
  ])(widgetProps);

  // Remove undefined props from external props to avoid overwriting defaults from widget model
  const nonEmptyExternalProps = omitBy(restProps, isUndefined);

  if (isTextWidgetProps(updatedWidgetProps)) {
    return <TextWidget {...updatedWidgetProps} {...nonEmptyExternalProps} />;
  }
  if (isPivotTableWidgetProps(updatedWidgetProps)) {
    return (
      <PivotTableWidget
        {...updatedWidgetProps}
        {...nonEmptyExternalProps}
        styleOptions={{
          ...updatedWidgetProps.styleOptions,
          ...props.styleOptions,
        }}
      />
    );
  }

  if (isChartWidgetProps(updatedWidgetProps)) {
    return (
      <ChartWidget
        {...updatedWidgetProps}
        {...nonEmptyExternalProps}
        drilldownOptions={{
          ...updatedWidgetProps.drilldownOptions,
          ...props.drilldownOptions,
        }}
        styleOptions={{
          ...updatedWidgetProps.styleOptions,
          ...props.styleOptions,
        }}
      />
    );
  }
  return null;
});
