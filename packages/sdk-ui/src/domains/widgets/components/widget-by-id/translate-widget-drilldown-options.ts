import {
  Attribute,
  BaseJaql,
  DateLevels,
  DimensionalLevelAttribute,
  IncludeMembersFilterJaql,
  isDatetime,
} from '@sisense/sdk-data';
import partition from 'lodash-es/partition';
import uniqBy from 'lodash-es/uniqBy';

import { formatDateValue } from '@/domains/query-execution/core/date-formats/apply-date-format.js';
import { Column } from '@/domains/visualizations/core/chart-data/types.js';
import { sliceFromMatched } from '@/shared/utils/array-utils';

import { Hierarchy, HierarchyId } from '../../../../domains/drilldown/hierarchy-model/index';
import { DataPoint, DrilldownOptions, PivotTableDrilldownOptions } from '../../../../types.js';
import { createDataColumn } from './translate-widget-data-options.js';
import { DatetimeMask, FusionWidgetType, Panel, PanelItem } from './types.js';
import { getEnabledPanelItems, getRootPanelItem } from './utils.js';

const getAvailableDrilldowns = (item: PanelItem): Attribute[] =>
  item?.parent
    ? [...getAvailableDrilldowns(item.parent), createDataColumn(item).column as Attribute]
    : [];

/**
 * Checks if the item has a drilldown selection.
 *
 * @param {PanelItem} item - The item to check.
 * @returns {boolean} True if the item has a drilldown selection, false otherwise.
 */
const hasDrilldownSelection = (item?: PanelItem): boolean => {
  if (item?.parent && item.through && 'filter' in item.through.jaql) {
    return true;
  }
  if (item?.parent) {
    return hasDrilldownSelection(item.parent);
  }
  return false;
};

/* eslint complexity: ['error', 9] */
const getDrilldownSelections = (
  item?: PanelItem,
): { nextDimension: Attribute; points: DataPoint[] }[] => {
  if (item?.parent && item.through && 'filter' in item.through.jaql) {
    const nextDimension = createDataColumn(item).column as Attribute;
    const { jaql, format: { mask } = {} } = item.parent;
    const dateFormat = 'level' in jaql && jaql.level && mask && (mask as DatetimeMask)[jaql.level];

    const points =
      (item.through.jaql.filter as IncludeMembersFilterJaql)?.members?.map(
        dateFormat
          ? (member) => ({
              categoryValue: member,
              categoryDisplayValue: formatDateValue(member, dateFormat),
            })
          : (member) => ({ categoryValue: member }),
      ) ?? [];

    return [...getDrilldownSelections(item.parent), { nextDimension, points }];
  }
  return [];
};

/**
 * Gets the panel names allowed for drilling based on the widget type.
 *
 * @param {FusionWidgetType} widgetType - The type of the widget.
 * @returns {string[]} An array of panel names allowed for drilling.
 */
function getDrilldownAllowedPanelNames(widgetType: FusionWidgetType) {
  switch (widgetType) {
    case 'chart/line':
    case 'chart/area':
      return ['x-axis'];
    case 'chart/boxplot':
      return ['category'];
    case 'chart/scatter':
      return ['x-axis', 'y-axis', 'point', 'Break By / Color'];
    case 'pivot2':
      return ['rows', 'columns'];
    default:
      return ['categories'];
  }
}

const findDrillableItems = (widgetType: FusionWidgetType, panels: Panel[]): PanelItem[] => {
  const drillableItems = getDrilldownAllowedPanelNames(widgetType)
    .map((name) => getEnabledPanelItems(panels, name))
    .flat()
    .filter((item) => {
      const isMeasure = 'agg' in item.jaql && item.jaql.agg;
      const isFormula = 'formula' in item.jaql && item.jaql.formula;
      return !isMeasure && !isFormula;
    });

  if (widgetType === 'pivot2') {
    return drillableItems;
  }

  // Only first drillable item is allowed for drilldown for other widgets than pivot table
  return drillableItems.slice(0, 1);
};

const DATE_CALENDAR_HIERARCHY_ID = 'calendar';
const DATE_WEEK_HIERARCHY_ID = 'calendar - weeks';

const DATE_CALENDAR_HIERARCHY_GRANULARITIES = [
  DateLevels.Years,
  DateLevels.Quarters,
  DateLevels.Months,
  DateLevels.Days,
];
const DATE_WEEK_HIERARCHY_GRANULARITIES = [DateLevels.Years, DateLevels.Weeks, DateLevels.Days];
const DATE_COMBINED_HIERARCHY_GRANULARITIES = [
  DateLevels.Years,
  DateLevels.Quarters,
  DateLevels.Months,
  DateLevels.Weeks,
  DateLevels.Days,
];

const getPredefinedDateHierarchyGranularities = (predefinedDateHierarchyIds: string[]) => {
  if (predefinedDateHierarchyIds.length === 2) {
    return DATE_COMBINED_HIERARCHY_GRANULARITIES;
  }

  if (predefinedDateHierarchyIds[0] === DATE_CALENDAR_HIERARCHY_ID) {
    return DATE_CALENDAR_HIERARCHY_GRANULARITIES;
  }

  if (predefinedDateHierarchyIds[0] === DATE_WEEK_HIERARCHY_ID) {
    return DATE_WEEK_HIERARCHY_GRANULARITIES;
  }

  return [];
};

const withPredefinedDateHierarchies = (
  hierarchyIds: HierarchyId[],
  attribute: DimensionalLevelAttribute,
): (HierarchyId | Hierarchy)[] => {
  const [predefinedDateHierarchyIds = [], otherHierarchyIds] = partition(hierarchyIds, (h) =>
    [DATE_CALENDAR_HIERARCHY_ID, DATE_WEEK_HIERARCHY_ID].includes(h),
  ) as [predefinedDateHierarchyIds: HierarchyId[], otherHierarchyIds: HierarchyId[]];
  const applicableGranularities = sliceFromMatched(
    getPredefinedDateHierarchyGranularities(predefinedDateHierarchyIds),
    attribute.granularity,
  );

  if (applicableGranularities.length) {
    const levels = applicableGranularities.map(
      (granularity) =>
        new DimensionalLevelAttribute(
          `${granularity} in ${attribute.name}`,
          attribute.expression,
          granularity,
          DimensionalLevelAttribute.getDefaultFormatForGranularity(granularity),
        ),
    );
    const predefinedHierarchy: Hierarchy = { title: 'Calendar Hierarchy', levels };
    return [predefinedHierarchy, ...otherHierarchyIds];
  }

  return otherHierarchyIds;
};

const extractDrilldownHierarchies = (
  drilledItem: PanelItem | undefined,
): (Hierarchy | HierarchyId)[] => {
  const styledColumn = drilledItem && createDataColumn(drilledItem);
  const rawHierarchies = drilledItem?.hierarchies || [];

  if (styledColumn && isDatetime((styledColumn.column as Column).type)) {
    // Set column as a name to match drilldown hierarchy levels name format
    styledColumn.column.name = (drilledItem?.jaql as BaseJaql).column;

    return withPredefinedDateHierarchies(
      rawHierarchies,
      styledColumn.column as DimensionalLevelAttribute,
    );
  }

  return rawHierarchies;
};

export const extractDrilldownOptions = (
  widgetType: FusionWidgetType,
  panels: Panel[],
  drillHistory: PanelItem[] = [],
  enableDrillToAnywhere?: boolean,
): DrilldownOptions | PivotTableDrilldownOptions => {
  const drillableItems = findDrillableItems(widgetType, panels);
  // Only single item from drillableItems array can have drilldown selections
  const drillableItemWithSelections = drillableItems.find(hasDrilldownSelection);
  const drilldownSelections = getDrilldownSelections(drillableItemWithSelections);
  const drilldownHierarchies = drillableItems
    .map((item) => getRootPanelItem(item))
    .map((rootItem) => extractDrilldownHierarchies(rootItem))
    .flat();
  const drilldownDimensions = uniqBy(
    [
      ...(drillableItemWithSelections ? getAvailableDrilldowns(drillableItemWithSelections) : []),
      ...(enableDrillToAnywhere ? drillHistory.map(getAvailableDrilldowns).flat() : []),
    ],
    ({ expression }) => expression,
  );

  if (widgetType === 'pivot2') {
    const rootItemWithSelections =
      drillableItemWithSelections && getRootPanelItem(drillableItemWithSelections);
    const drilldownTarget =
      rootItemWithSelections && (createDataColumn(rootItemWithSelections).column as Attribute);
    return {
      drilldownPaths: [...drilldownDimensions, ...drilldownHierarchies],
      ...(drilldownTarget &&
        drilldownSelections.length && {
          drilldownTarget: drilldownTarget,
          drilldownSelections: drilldownSelections,
        }),
    };
  }

  return {
    drilldownPaths: [...drilldownDimensions, ...drilldownHierarchies],
    drilldownSelections,
  };
};
