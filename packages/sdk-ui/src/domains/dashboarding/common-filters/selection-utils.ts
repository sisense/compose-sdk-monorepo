import { Attribute, Column, Filter, isMembersFilter, MembersFilter } from '@sisense/sdk-data';
import groupBy from 'lodash-es/groupBy';
import partition from 'lodash-es/partition';
import uniq from 'lodash-es/uniq';

import {
  PivotTableDataOptions,
  ScattermapChartDataOptions,
} from '@/domains/visualizations/core/chart-data-options/types.js';
import {
  isMeasureColumn,
  translateColumnToAttribute,
} from '@/domains/visualizations/core/chart-data-options/utils.js';
import {
  isAreamap,
  isBoxplot,
  isCalendarHeatmap,
  isCartesian,
  isCategorical,
  isRange,
  isScatter,
  isScattermap,
} from '@/domains/visualizations/core/chart-options-processor/translations/types.js';
import { WidgetTypeInternal } from '@/domains/widgets/widget-model/types.js';
import { MenuSectionIds } from '@/infra/contexts/menu-provider/menu-ids';
import { haveSameAttribute } from '@/shared/utils/filters-comparator.js';
import { clearMembersFilter, isIncludeAllFilter } from '@/shared/utils/filters.js';
import {
  AreamapDataPoint,
  BoxplotDataPoint,
  CalendarHeatmapChartDataOptions,
  CalendarHeatmapDataPoint,
  CartesianChartDataOptions,
  CategoricalChartDataOptions,
  ChartDataOptions,
  ChartDataPoint,
  DataPoint,
  DataPointEntry,
  MenuItemSection,
  PivotTableDataPoint,
  ScatterChartDataOptions,
  ScatterDataPoint,
  ScattermapDataPoint,
  StyledColumn,
} from '@/types.js';

import { createCommonFilter, getFilterByAttribute, isEqualMembersFilters } from './utils.js';

export const SELECTION_TITLE_MAXIMUM_ITEMS = 2;

type DataSelection = {
  attribute: Attribute;
  values: (string | number)[];
  displayValues: string[];
};

type AbstractDataPointWithEntries = {
  entries?: Record<string, DataPointEntry | DataPointEntry[]>;
};

/**
 * Extracts entries from a data point's entries object for a specific path.
 * Normalizes single entries to arrays.
 *
 * @param entries - The entries object from a data point
 * @param path - The path key to extract entries from
 * @returns Array of entries
 */
function extractEntriesFromPath(
  entries: Record<string, DataPointEntry | DataPointEntry[]>,
  path: string,
): DataPointEntry[] {
  const entriesByPath = entries[path];

  if (!entriesByPath) {
    return [];
  }

  return Array.isArray(entriesByPath) ? entriesByPath : [entriesByPath];
}

/**
 * Converts chart data points into filter selections by extracting attribute information
 * from specified entry paths and grouping by attribute expression.
 *
 * @param points - Array of data points with entries
 * @param selectablePaths - Array of entry path keys to extract (e.g., ['category'], ['x', 'y'])
 * @returns Array of data selections grouped by attribute
 */
function getSelectionsFromPoints(
  points: AbstractDataPointWithEntries[],
  selectablePaths: string[],
): DataSelection[] {
  // Early return for empty inputs
  if (!points.length || !selectablePaths.length) {
    return [];
  }

  // Extract all entries from selectable paths across all points
  const selectableEntriesArray = points.flatMap(({ entries = {} }) =>
    selectablePaths
      .flatMap((selectablePath) => extractEntriesFromPath(entries, selectablePath))
      .filter((entry): entry is DataPointEntry => !!entry.attribute),
  );

  // Group entries by attribute expression
  const groupedEntries = groupBy(selectableEntriesArray, ({ attribute }) => attribute?.expression);

  // Convert grouped entries to DataSelection objects
  return Object.values(groupedEntries)
    .filter((entries): entries is DataPointEntry[] => {
      // Ensure we have entries with valid attributes
      return entries.length > 0 && !!entries[0].attribute;
    })
    .map((entries) => {
      // At this point, we know entries[0].attribute exists due to the filter above
      const attribute = entries[0].attribute!;

      // Filter out undefined values and get unique values
      const values = uniq(
        entries
          .map(({ value }) => value)
          .filter((value): value is string | number => value !== undefined && value !== null),
      );

      const displayValues = uniq(
        entries
          .map(({ displayValue }) => displayValue)
          .filter((displayValue): displayValue is string => displayValue !== undefined),
      );

      return {
        attribute,
        values,
        displayValues,
      };
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
      attribute: translateColumnToAttribute(dataOption),
      values: [],
      displayValues: [],
    };
  });
}

function getScatterChartSelections(points: ScatterDataPoint[]): DataSelection[] {
  return getSelectionsFromPoints(points, ['x', 'y', 'breakByPoint', 'breakByColor']);
}

function getScattermapChartSelections(points: ScattermapDataPoint[]): DataSelection[] {
  return getSelectionsFromPoints(points, ['geo']);
}

function getAreamapChartSelections(points: AreamapDataPoint[]): DataSelection[] {
  return getSelectionsFromPoints(points, ['geo']);
}

function getCalendarHeatmapChartSelections(points: CalendarHeatmapDataPoint[]): DataSelection[] {
  return getSelectionsFromPoints(points, ['date']);
}

function getPivotTableSelections(points: PivotTableDataPoint[]): DataSelection[] {
  const selectablePoints = points.filter((point) => point.isDataCell && !point.isTotalCell);
  return getSelectionsFromPoints(
    selectablePoints.map((point) => {
      // if values available, pivot pick all entries
      if (point.entries?.values?.length) {
        return point;
      }
      // if no values available, pivot pick only row or column that was selected
      return {
        ...point,
        entries: {
          rows: point.entries.rows?.slice(-1) ?? [],
          columns: point.entries.columns?.slice(-1) ?? [],
          values: [],
        },
      };
    }),
    ['rows', 'columns', 'values'],
  );
}

export function getWidgetSelections(
  widgetType: WidgetTypeInternal,
  dataOptions: ChartDataOptions | PivotTableDataOptions,
  points: Array<ChartDataPoint | PivotTableDataPoint>,
) {
  if (widgetType === 'custom') {
    // no custom widgets support
    return [];
  } else if (widgetType === 'text') {
    // no text support
    return [];
  } else if (widgetType === 'pivot') {
    return getPivotTableSelections(points as PivotTableDataPoint[]);
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
  } else if (isCalendarHeatmap(widgetType)) {
    return getCalendarHeatmapChartSelections(points as CalendarHeatmapDataPoint[]);
  }

  return [];
}

export function getSelectableWidgetAttributes(
  widgetType: WidgetTypeInternal,
  dataOptions: ChartDataOptions | PivotTableDataOptions,
) {
  let targetDataOptions: (Column | StyledColumn)[] = [];

  if (widgetType === 'custom') {
    targetDataOptions = [];
  } else if (widgetType === 'text') {
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
  } else if (isCalendarHeatmap(widgetType)) {
    targetDataOptions = [(dataOptions as CalendarHeatmapChartDataOptions).date];
  }

  return targetDataOptions.map(translateColumnToAttribute);
}

/**
 * Applies unselection rules to a given filter based on the existing filters.
 * If the filter matches or partially matches the existing filter, it will apply
 * unselection logic and return a modified filter. Otherwise, it returns `null`.
 */
function applyUnselectionRulesToFilter(
  selectionFilter: Filter,
  existingFilters: Filter[],
  allowPartialUnselection: boolean,
): Filter | null {
  const existingFilter = getFilterByAttribute(existingFilters, selectionFilter.attribute);

  if (!existingFilter || isIncludeAllFilter(existingFilter)) {
    return null;
  }

  if (isEqualMembersFilters(selectionFilter, existingFilter)) {
    return clearMembersFilter(selectionFilter);
  }

  if (isMembersFilter(existingFilter) && allowPartialUnselection) {
    const [intersectedMembers, differentMembers] = partition(existingFilter.members, (member) =>
      (selectionFilter as MembersFilter).members.includes(member),
    );

    const shouldUnselect =
      intersectedMembers.length === (selectionFilter as MembersFilter).members.length &&
      differentMembers.length;

    if (shouldUnselect) {
      return createCommonFilter(selectionFilter.attribute, differentMembers, [existingFilter]);
    }
  }

  return null;
}

type FiltersWithSelectionFlag = {
  filters: Filter[];
  isSelection: boolean;
};

/**
 * Applies unselection rules to a set of filters based on existing filters and selection options.
 * This function maps over the selected filters, applying the unselection logic when appropriate.
 */
function applyUnselectionRulesToFilters(
  selectionFilters: Filter[],
  existingFilters: Filter[],
  allowPartialUnselection: boolean,
): FiltersWithSelectionFlag {
  const enabledExistingFilters = existingFilters.filter((f) => !f.config.disabled);
  const unselectionFilters = selectionFilters
    .map((selectionFilter) =>
      applyUnselectionRulesToFilter(
        selectionFilter,
        enabledExistingFilters,
        allowPartialUnselection,
      ),
    )
    .filter((filter): filter is Filter => !!filter);
  const isSelection = selectionFilters.length !== unselectionFilters.length;

  return {
    filters: isSelection ? selectionFilters : unselectionFilters,
    isSelection,
  };
}

/**
 * Creates a set of common filters based on the current selections, considering existing filters and
 * the common filters unselection rules.
 */
export function createCommonFiltersOverSelections(
  selections: DataSelection[],
  existingCommonFilters: Filter[],
  allowPartialUnselection = false,
): FiltersWithSelectionFlag {
  const selectionFilters = selections.map(({ attribute, values }) =>
    createCommonFilter(attribute, values, existingCommonFilters),
  );
  const selectionFiltersWithoutLockedFilters = removeLockedFilters(
    existingCommonFilters,
    selectionFilters,
  );
  return applyUnselectionRulesToFilters(
    selectionFiltersWithoutLockedFilters,
    existingCommonFilters,
    allowPartialUnselection,
  );
}

/**
 * Removes filters, that are present in `existingFilters` and are locked, from `filtersToRemoveFrom`
 */
function removeLockedFilters(existingFilters: Filter[], filtersToRemoveFrom: Filter[]): Filter[] {
  const lockedExistingFilters = existingFilters.filter((filter) => filter.config.locked);

  if (!lockedExistingFilters.length) {
    return filtersToRemoveFrom;
  }
  return filtersToRemoveFrom.filter(
    (filter) =>
      !lockedExistingFilters.some((lockedFilter) => haveSameAttribute(lockedFilter, filter)),
  );
}

function getWidgetSelectionsTitle(
  widgetType: WidgetTypeInternal,
  dataOptions: ChartDataOptions | PivotTableDataOptions,
  points: Array<ChartDataPoint>,
) {
  const selections = getWidgetSelections(widgetType, dataOptions, points)
    // Note: leave selections that only contain values to display
    .filter(({ displayValues }) => displayValues.length);

  if (selections.length === 0) return '';

  const [selection] = selections;
  const isSinglePoint = points.length === 1;
  const hasExcessValues = selection.displayValues.length > SELECTION_TITLE_MAXIMUM_ITEMS;

  // For multiple selections
  if (selections.length > 1) {
    if (isSinglePoint) {
      return selections.map((s) => s.displayValues[0]).join(', ');
    }
    return hasExcessValues ? '' : selection.displayValues.join(', ');
  }

  // For single selection
  return hasExcessValues ? selection.attribute.name : selection.displayValues.join(', ');
}

export function getWidgetSelectionsTitleMenuItem(
  widgetType: WidgetTypeInternal,
  dataOptions: ChartDataOptions | PivotTableDataOptions,
  points: Array<ChartDataPoint>,
): MenuItemSection | null {
  const sectionTitle = getWidgetSelectionsTitle(widgetType, dataOptions, points);
  if (!sectionTitle) {
    return null;
  }
  return {
    id: MenuSectionIds.CROSSFILTERING_CHART_POINTS_SELECTION,
    sectionTitle,
  };
}

export function getSelectMenuItem(title: string, selectHandler: () => void): MenuItemSection {
  return {
    items: [
      {
        caption: title,
        onClick: selectHandler,
      },
    ],
  };
}
