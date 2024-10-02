import { DataPoint, ChartType, ChartDataOptions, ScatterChartDataOptions } from '../../types';
import { Attribute, type Filter } from '@sisense/sdk-data';
import { mergeFilters } from '@/dashboard-widget/utils';
import { combineHandlers } from '../../utils/combine-handlers';
import {
  BOXPLOT_CHART_TYPES,
  CARTESIAN_CHART_TYPES,
  CATEGORICAL_CHART_TYPES,
  RANGE_CHART_TYPES,
  SCATTER_CHART_TYPES,
  isBoxplot,
  isCartesian,
  isCategorical,
  isRange,
  isScatter,
} from '@/chart-options-processor/translations/types';
import { getSelectableWidgetAttributes } from '@/common-filters/selection-utils';
import { ChartProps, CustomDrilldownResult, ScatterDataPoint, isMeasureColumn } from '../..';
import { PointClickEventObject } from '@sisense/sisense-charts';
import { ScatterCustomPointOptions } from '@/chart-options-processor/translations/scatter-tooltip';
import camelCase from 'lodash-es/camelCase';

export function getDrilldownInitialDimension(chartType: ChartType, dataOptions: ChartDataOptions) {
  return getSelectableWidgetAttributes(chartType, dataOptions)[0];
}

function isSupportedChartForDrilldown(chartType: ChartType) {
  return (
    [
      ...CARTESIAN_CHART_TYPES,
      ...CATEGORICAL_CHART_TYPES,
      ...SCATTER_CHART_TYPES,
      ...BOXPLOT_CHART_TYPES,
      ...RANGE_CHART_TYPES,
    ] as ChartType[]
  ).includes(chartType);
}

function isValidChartConfigurationForDrilldown(
  chartType: ChartType,
  dataOptions: ChartDataOptions,
) {
  // Drilldown requires the chart to have only one "selectable" attribute (target category)
  return getSelectableWidgetAttributes(chartType, dataOptions).length === 1;
}

export function isDrilldownApplicableToChart(chartType: ChartType, dataOptions: ChartDataOptions) {
  return (
    isValidChartConfigurationForDrilldown(chartType, dataOptions) &&
    isSupportedChartForDrilldown(chartType)
  );
}

export function applyDrilldownDimension(
  chartType: ChartType,
  dataOptions: ChartDataOptions,
  drilldownDimension: Attribute,
): ChartDataOptions {
  if (
    isCartesian(chartType) ||
    isCategorical(chartType) ||
    isBoxplot(chartType) ||
    isRange(chartType)
  ) {
    return {
      ...dataOptions,
      category: [drilldownDimension],
    } as ChartDataOptions;
  } else if (isScatter(chartType)) {
    const scatterDataOptions = dataOptions as ScatterChartDataOptions;
    const scatterTargetDataOptionsKeys = ['x', 'y', 'breakByPoint', 'breakByColor'];

    for (const key of scatterTargetDataOptionsKeys) {
      if (scatterDataOptions[key] && !isMeasureColumn(scatterDataOptions[key])) {
        return {
          ...scatterDataOptions,
          [key]: drilldownDimension,
        } as ScatterChartDataOptions;
      }
    }
  }

  return dataOptions;
}

function prepareDrilldownSelectionPoints(
  points: (DataPoint | ScatterDataPoint)[],
  nativeEvent: MouseEvent,
  dataOptions: ChartDataOptions,
) {
  return points.map((point) => {
    const scatterTargetDataOptionsKeys = ['x', 'y', 'breakByPoint', 'breakByColor'];
    const isScatterPoint = [...scatterTargetDataOptionsKeys, 'size'].some(
      (propName) => propName in point,
    );
    const drilldownTargetDataOptionsKey = scatterTargetDataOptionsKeys.find(
      (key) => dataOptions[key] && !isMeasureColumn(dataOptions[key]),
    )!;
    if (isScatterPoint) {
      const event = nativeEvent as PointClickEventObject;
      const isMultiSelectionEvent = event.type === 'mouseup';
      // todo: add multi-selection support after extending 'points'
      if (isMultiSelectionEvent) {
        console.warn('No drilldown support for multi-selection in scatter chart');
      }
      const value = isMultiSelectionEvent
        ? point[drilldownTargetDataOptionsKey]
        : (event.point.options.custom as ScatterCustomPointOptions)[
            camelCase(`{masked ${drilldownTargetDataOptionsKey}`)
          ];
      return {
        categoryValue: value,
        categoryDisplayValue: value,
      } as DataPoint;
    }

    return point as DataPoint;
  });
}

export function createDrilldownToChartConnector(drilldownConnectProps: CustomDrilldownResult) {
  const { drilldownDimension, drilldownFilters, onDataPointsSelected, onContextMenu } =
    drilldownConnectProps;
  return function withDrilldown(chartProps: ChartProps) {
    const { chartType, dataOptions } = chartProps;

    const drilldownOnDataPointsSelected = (
      points: (DataPoint | ScatterDataPoint)[],
      nativeEvent: MouseEvent,
    ) => {
      const drilldownSelectionPoints = prepareDrilldownSelectionPoints(
        points,
        nativeEvent,
        chartProps.dataOptions,
      );
      onDataPointsSelected(drilldownSelectionPoints, nativeEvent);
      onContextMenu({
        left: nativeEvent.clientX,
        top: nativeEvent.clientY,
      });
    };
    const drilldownOnDataPointContextMenu = (point: DataPoint, event: MouseEvent) => {
      const drilldownSelectionPoints = prepareDrilldownSelectionPoints([point], event, dataOptions);
      onDataPointsSelected(drilldownSelectionPoints, event);
      onContextMenu({ left: event.clientX, top: event.clientY });
    };

    return {
      ...chartProps,
      dataOptions: applyDrilldownDimension(chartType, dataOptions, drilldownDimension),
      filters: mergeFilters(chartProps.filters as unknown as Filter[], drilldownFilters),
      onDataPointsSelected: combineHandlers([
        drilldownOnDataPointsSelected,
        chartProps.onDataPointsSelected,
      ]),
      onDataPointContextMenu: combineHandlers([
        drilldownOnDataPointContextMenu,
        chartProps.onDataPointContextMenu,
      ]),
    };
  };
}
