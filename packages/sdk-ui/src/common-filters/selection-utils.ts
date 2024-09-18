import { translateColumnToAttribure } from '@/chart-data-options/utils';
import {
  isAreamap,
  isBoxplot,
  isCartesian,
  isCategorical,
  isRange,
  isScatter,
  isScattermap,
} from '@/chart-options-processor/translations/types';
import { Column, Attribute, Filter } from '@sisense/sdk-data';
import uniq from 'lodash-es/uniq';
import groupBy from 'lodash-es/groupBy';
import {
  AreamapDataPoint,
  BoxplotDataPoint,
  CartesianChartDataOptions,
  CategoricalChartDataOptions,
  ChartDataOptions,
  DataPoint,
  DataPointEntry,
  isMeasureColumn,
  PivotTableDataOptions,
  ScatterChartDataOptions,
  ScatterDataPoint,
  ScattermapChartDataOptions,
  ScattermapDataPoint,
  StyledColumn,
} from '../index.js';
import { createCommonFilter, getFilterByAttribute, isEqualMembersFilters } from './utils.js';
import { WidgetTypeInternal } from '@/models/widget/types.js';
import { clearMembersFilter, haveSameAttribute } from '@/utils/filters.js';

type DataSelection = {
  attribute: Attribute;
  values: (string | number)[];
};

type AbstractDataPointWithEntries = {
  entries?: Record<string, DataPointEntry | DataPointEntry[]>;
};

function getSelectionsFromPoints(
  points: AbstractDataPointWithEntries[],
  selectablePaths: string[],
) {
  const selectableEntriesArray = points.flatMap(({ entries = {} }) =>
    selectablePaths.flatMap((selectablePath) => {
      const entriesByPath = entries[selectablePath];

      if (!entriesByPath) {
        return [];
      }

      const entriesArray = Array.isArray(entriesByPath) ? entriesByPath : [entriesByPath];
      return entriesArray.filter(({ attribute }) => !!attribute);
    }),
  );

  const groupedEntries = groupBy(selectableEntriesArray, ({ id }) => id);

  return Object.values(groupedEntries).map((entries) => {
    return {
      attribute: entries[0].attribute,
      values: uniq(entries.map(({ value }) => value)),
    } as DataSelection;
  });
}

function getCartesianChartSelections(points: DataPoint[]): DataSelection[] {
  return getSelectionsFromPoints(points, ['category']);
}

function getBoxplotChartSelections(points: Array<DataPoint | ScatterDataPoint>): DataSelection[] {
  return getSelectionsFromPoints(points, ['category']);
}

/**
 * Note: treemap selection works differently to other widgets,
 * it selects only the currently clicked level while deselects all other levels
 */
function getTreemapChartSelections(
  points: DataPoint[],
  dataOptions: CategoricalChartDataOptions,
): DataSelection[] {
  const selections = getSelectionsFromPoints(points, ['category']);
  const pointLevelIndex = selections.length - 1;

  return dataOptions.category.map((dataOption, index) => {
    const isPointLevel = pointLevelIndex === index;

    // select only current level
    if (isPointLevel) {
      return selections[index];
    }

    // deselect all other levels
    return {
      attribute: translateColumnToAttribure(dataOption),
      values: [],
    };
  });
}

function getScatterChartSelections(points: ScatterDataPoint[]): DataSelection[] {
  return getSelectionsFromPoints(points, ['x', 'y', 'breakByColor', 'breakByPoint']);
}

function getScattermapChartSelections(points: ScattermapDataPoint[]): DataSelection[] {
  return getSelectionsFromPoints(points, ['geo']);
}

function getAreamapChartSelections(points: AreamapDataPoint[]): DataSelection[] {
  return getSelectionsFromPoints(points, ['geo']);
}

export function getWidgetSelections(
  widgetType: WidgetTypeInternal,
  dataOptions: ChartDataOptions | PivotTableDataOptions,
  points: Array<DataPoint | ScatterDataPoint | ScattermapDataPoint | AreamapDataPoint>,
) {
  if (widgetType === 'plugin') {
    // no plugins support
    return [];
  } else if (widgetType === 'pivot') {
    // todo: add pivot support after extending pivot with click/select handlers
    return [];
  } else if (widgetType === 'treemap' || widgetType === 'sunburst') {
    return getTreemapChartSelections(
      points as DataPoint[],
      dataOptions as CategoricalChartDataOptions,
    );
  } else if (isCartesian(widgetType) || widgetType === 'pie' || widgetType === 'funnel') {
    return getCartesianChartSelections(points as DataPoint[]);
  } else if (isBoxplot(widgetType)) {
    return getBoxplotChartSelections(points as BoxplotDataPoint[]);
  } else if (isScatter(widgetType)) {
    return getScatterChartSelections(points as ScatterDataPoint[]);
  } else if (isScattermap(widgetType)) {
    return getScattermapChartSelections(points as ScattermapDataPoint[]);
  } else if (isAreamap(widgetType)) {
    return getAreamapChartSelections(points as AreamapDataPoint[]);
  }

  return [];
}

export function getSelectableWidgetAttributes(
  widgetType: WidgetTypeInternal,
  dataOptions: ChartDataOptions | PivotTableDataOptions,
) {
  let targetDataOptions: (Column | StyledColumn)[] = [];

  if (widgetType === 'plugin') {
    targetDataOptions = [];
  } else if (widgetType === 'pivot') {
    targetDataOptions = [
      ...((dataOptions as PivotTableDataOptions).rows || []),
      ...((dataOptions as PivotTableDataOptions).columns || []),
    ];
  } else if (
    isCartesian(widgetType) ||
    isCategorical(widgetType) ||
    isBoxplot(widgetType) ||
    isRange(widgetType)
  ) {
    targetDataOptions = [...(dataOptions as CartesianChartDataOptions).category];
  } else if (isScatter(widgetType)) {
    targetDataOptions = [
      (dataOptions as ScatterChartDataOptions).x,
      (dataOptions as ScatterChartDataOptions).y,
      (dataOptions as ScatterChartDataOptions).breakByPoint,
      (dataOptions as ScatterChartDataOptions).breakByColor,
    ].filter((a): a is Column | StyledColumn => !!(a && !isMeasureColumn(a)));
  } else if (isScattermap(widgetType) || isAreamap(widgetType)) {
    targetDataOptions = [...(dataOptions as ScattermapChartDataOptions).geo];
  }

  return targetDataOptions.map(translateColumnToAttribure);
}

export function createCommonFiltersOverSelections(
  selections: DataSelection[],
  existingCommonFilters: Filter[],
) {
  const commonFiltersFromSelections = selections.map(({ attribute, values }) =>
    createCommonFilter(attribute, values, existingCommonFilters),
  );

  const newSelectedFilters = removeLockedFilters(
    existingCommonFilters,
    commonFiltersFromSelections,
  );

  const enabledFilters = existingCommonFilters.filter((f) => !f.disabled);
  const isAlreadySelectedFilters = newSelectedFilters.every((filter) => {
    const existingFilter = getFilterByAttribute(enabledFilters, filter.attribute);
    return existingFilter && isEqualMembersFilters(filter, existingFilter);
  });

  if (isAlreadySelectedFilters) {
    return newSelectedFilters.map(clearMembersFilter);
  }

  return newSelectedFilters;
}

/**
 * Removes filters, that are present in `existingFilters` and are locked, from `filtersToRemoveFrom`
 */
function removeLockedFilters(existingFilters: Filter[], filtersToRemoveFrom: Filter[]) {
  const lockedExistingFilters = existingFilters.filter((filter) => filter.locked);

  if (!lockedExistingFilters.length) {
    return filtersToRemoveFrom;
  }
  return filtersToRemoveFrom.filter(
    (filter) =>
      !lockedExistingFilters.some((lockedFilter) => haveSameAttribute(lockedFilter, filter)),
  );
}
