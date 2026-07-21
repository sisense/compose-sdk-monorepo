import { Attribute, CalculatedColumn, Column, MetadataTypes } from '@sisense/sdk-data';
import { PointClickEventObject } from '@sisense/sisense-charts';
import camelCase from 'lodash-es/camelCase';

import { getSelectableWidgetAttributes } from '@/domains/dashboarding/common-filters/selection-utils';
import {
  isMeasureColumn,
  translateColumnToAttribute,
} from '@/domains/visualizations/core/chart-data-options/utils';
import {
  BOXPLOT_CHART_TYPES,
  CARTESIAN_CHART_TYPES,
  CATEGORICAL_CHART_TYPES,
  isBoxplot,
  isCartesian,
  isCategorical,
  isRange,
  isSankey,
  isScatter,
  RANGE_CHART_TYPES,
  SANKEY_CHART_TYPES,
  SCATTER_CHART_TYPES,
} from '@/domains/visualizations/core/chart-options-processor/translations/types';
import { isSameAttribute } from '@/shared/utils/filters';
import {
  CartesianChartDataOptions,
  DrilldownSelection,
  SankeyChartDataOptions,
  ScatterDataPoint,
  StyledColumn,
} from '@/types';
import { ChartDataOptions, ChartType, DataPoint, ScatterChartDataOptions } from '@/types';

import { AnyColumn } from '../visualizations/core/chart-data-options/types';
import { Hierarchy } from './hierarchy-model';

export function getDrilldownInitialDimension(
  chartType: ChartType,
  dataOptions: ChartDataOptions,
): Attribute | undefined {
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
      ...SANKEY_CHART_TYPES,
    ] as ChartType[]
  ).includes(chartType);
}

function isValidChartConfigurationForDrilldown(
  chartType: ChartType,
  dataOptions: ChartDataOptions,
) {
  // Drilldown requires the chart to have at least one "selectable" attribute (target category)
  // When multiple selectable attributes exist, the first one is used
  return getSelectableWidgetAttributes(chartType, dataOptions).length >= 1;
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
  const shouldUpdateDataOption = (
    currentDataOption: Column | CalculatedColumn | StyledColumn | undefined,
  ): boolean => {
    return (
      !!currentDataOption &&
      !isSameAttribute(drilldownDimension, translateColumnToAttribute(currentDataOption))
    );
  };

  // Sankey requires ≥2 category stages. Replacing the whole `category` array
  // with a single drilled dimension would break the chart (and wipe other
  // flow stages).
  if (isSankey(chartType)) {
    const sankeyDataOptions = dataOptions as SankeyChartDataOptions;
    const targetIndex = sankeyDataOptions.category.findIndex(
      (c) => !MetadataTypes.isCalculatedAttribute(translateColumnToAttribute(c)),
    );
    if (targetIndex >= 0 && shouldUpdateDataOption(sankeyDataOptions.category[targetIndex])) {
      const nextCategory = [...sankeyDataOptions.category];
      nextCategory[targetIndex] = drilldownDimension;
      return {
        ...sankeyDataOptions,
        category: nextCategory,
      };
    }
    return dataOptions;
  }

  if (
    isCartesian(chartType) ||
    isCategorical(chartType) ||
    isBoxplot(chartType) ||
    isRange(chartType)
  ) {
    // Target the first drillable category (skipping calculated dimensions which are not drillable)
    const targetDataOption = (dataOptions as CartesianChartDataOptions).category.find(
      (c) => !MetadataTypes.isCalculatedAttribute(translateColumnToAttribute(c)),
    );
    if (shouldUpdateDataOption(targetDataOption)) {
      return {
        ...dataOptions,
        category: [drilldownDimension],
      } as ChartDataOptions;
    }
  } else if (isScatter(chartType)) {
    const scatterDataOptions = dataOptions as ScatterChartDataOptions;
    const scatterTargetKeys = ['x', 'y', 'breakByPoint', 'breakByColor'] as const;
    const drilldownTargetDataOptionKey = scatterTargetKeys.find((key) =>
      isScatterDataOptionDrillable(scatterDataOptions[key]),
    );

    if (drilldownTargetDataOptionKey) {
      const targetDataOption = scatterDataOptions[drilldownTargetDataOptionKey] as
        | Column
        | StyledColumn
        | undefined;
      if (shouldUpdateDataOption(targetDataOption)) {
        return {
          ...scatterDataOptions,
          [drilldownTargetDataOptionKey]: drilldownDimension,
        } as ScatterChartDataOptions;
      }
    }
  }

  return dataOptions;
}

/**
 * Returns true when a scatter data-option is eligible as a drilldown target
 */
function isScatterDataOptionDrillable(dataOption: AnyColumn | undefined): boolean {
  return (
    !!dataOption &&
    !isMeasureColumn(dataOption) &&
    !MetadataTypes.isCalculatedAttribute(translateColumnToAttribute(dataOption))
  );
}

export function prepareDrilldownSelectionPoints(
  points: (DataPoint | ScatterDataPoint)[],
  nativeEvent: MouseEvent,
  dataOptions: ChartDataOptions,
) {
  return points.map((point) => {
    const scatterTargetDataOptionsKeys = ['x', 'y', 'breakByPoint', 'breakByColor'];
    const isScatterPoint = [...scatterTargetDataOptionsKeys, 'size'].some(
      (propName) => propName in point,
    );
    const drilldownTargetDataOptionsKey = scatterTargetDataOptionsKeys.find((key) =>
      isScatterDataOptionDrillable(
        (dataOptions as ScatterChartDataOptions)[
          key as 'x' | 'y' | 'breakByPoint' | 'breakByColor'
        ],
      ),
    )!;
    if (isScatterPoint) {
      const event = nativeEvent as PointClickEventObject;
      const isMultiSelectionEvent = event.type === 'mouseup';
      // todo: add multi-selection support after extending 'points'
      if (isMultiSelectionEvent) {
        console.warn('No drilldown support for multi-selection in scatter chart');
      }
      const value = isMultiSelectionEvent
        ? (point as Record<string, unknown>)[drilldownTargetDataOptionsKey]
        : (event.point.options.custom as Record<string, unknown>)[
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

/**
 * Collects the available drilldown paths based on the provided paths and currently selected attributes.
 * @param drilldownPaths - The available drilldown paths (attributes or hierarchies)
 * @param selectedAttributes - The currently selected attributes in the drilldown chain
 * @returns Filtered drilldown paths that are still available for selection
 * @internal
 */
export function getAvailableDrilldownPaths(
  drilldownPaths: (Attribute | Hierarchy)[],
  selectedAttributes: Attribute[],
): (Attribute | Hierarchy)[] {
  return drilldownPaths.filter((drilldownPath) => {
    const isAttribute = MetadataTypes.isAttribute(drilldownPath);

    if (isAttribute) {
      const dimension = drilldownPath;
      return selectedAttributes.every(
        (selectedAttribute) => !isSameAttribute(selectedAttribute, dimension),
      );
    }

    const hierarchy = drilldownPath;
    return selectedAttributes.every(
      (attribute, index) =>
        hierarchy.levels[index] && isSameAttribute(attribute, hierarchy.levels[index]),
    );
  });
}

/**
 * Collects the currently selected attributes in the drilldown chain.
 * @param initialDimension - The initial dimension
 * @param drilldownSelections - The drilldown selections
 * @returns The currently selected attributes in the drilldown chain
 */
export function getSelectedDrilldownAttributes(
  initialDimension: Attribute | Column | StyledColumn,
  drilldownSelections: DrilldownSelection[],
): Attribute[] {
  return [
    translateColumnToAttribute(initialDimension),
    ...drilldownSelections.map(({ nextDimension }) => nextDimension),
  ];
}
