import { isMeasureColumn, translateColumnToAttribute } from '@/chart-data-options/utils';
import {
  isAreamap,
  isBoxplot,
  isCartesian,
  isCategorical,
  isRange,
  isScatter,
  isScattermap,
} from '@/chart-options-processor/translations/types';
import { Column, Attribute, Filter, isMembersFilter, MembersFilter } from '@sisense/sdk-data';
import uniq from 'lodash-es/uniq';
import groupBy from 'lodash-es/groupBy';
import partition from 'lodash-es/partition';
import {
  AreamapDataPoint,
  BoxplotDataPoint,
  CartesianChartDataOptions,
  CategoricalChartDataOptions,
  ChartDataOptions,
  ChartDataPoint,
  DataPoint,
  DataPointEntry,
  PivotTableDataOptions,
  ScatterChartDataOptions,
  ScatterDataPoint,
  ScattermapChartDataOptions,
  ScattermapDataPoint,
  StyledColumn,
  MenuItemSection,
} from '../index.js';
import { createCommonFilter, getFilterByAttribute, isEqualMembersFilters } from './utils.js';
import { WidgetTypeInternal } from '@/models/widget/types.js';
import { clearMembersFilter, isIncludeAllFilter } from '@/utils/filters.js';
import { MenuSectionIds } from '@/common/components/menu/menu-ids.js';
import { haveSameAttribute } from '@/utils/filters-comparator.js';

export const SELECTION_TITLE_MAXIMUM_ITEMS = 2;

type DataSelection = {
  attribute: Attribute;
  values: (string | number)[];
  displayValues: string[];
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
      displayValues: uniq(entries.map(({ displayValue }) => displayValue)),
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

export function getWidgetSelections(
  widgetType: WidgetTypeInternal,
  dataOptions: ChartDataOptions | PivotTableDataOptions,
  points: Array<ChartDataPoint>,
) {
  if (widgetType === 'custom') {
    // no custom widgets support
    return [];
  } else if (widgetType === 'text') {
    // no text support
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
