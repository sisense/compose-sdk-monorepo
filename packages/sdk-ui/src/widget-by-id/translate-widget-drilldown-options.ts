import {
  Attribute,
  BaseJaql,
  DateLevels,
  DimensionalLevelAttribute,
  IncludeMembersFilterJaql,
  isDatetime,
} from '@sisense/sdk-data';
import parseISO from 'date-fns/parseISO';
import uniqBy from 'lodash-es/uniqBy';
import partition from 'lodash-es/partition';
import { createDataColumn } from './translate-widget-data-options.js';
import { DatetimeMask, Panel, PanelItem, WidgetType } from './types.js';
import { getEnabledPanelItems, getRootPanelItem } from './utils.js';
import { DataPoint, DrilldownOptions } from '../types.js';
import { applyDateFormat } from '../query/date-formats/apply-date-format.js';
import { sliceFromMatched } from '@/utils/array-utils';
import { Column } from '@/chart-data/types';
import { Hierarchy, HierarchyId } from '@/models/hierarchy';

const getAvailableDrilldowns = (item: PanelItem): Attribute[] =>
  item?.parent
    ? [...getAvailableDrilldowns(item.parent), createDataColumn(item).column as Attribute]
    : [];

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
              categoryDisplayValue: applyDateFormat(parseISO(member), dateFormat),
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
 * @param {WidgetType} widgetType - The type of the widget.
 * @returns {string[]} An array of panel names allowed for drilling.
 */
function getDrilldownAllowedPanelNames(widgetType: WidgetType) {
  switch (widgetType) {
    case 'chart/line':
    case 'chart/area':
      return ['x-axis'];
    case 'chart/boxplot':
      return ['category'];
    case 'chart/scatter':
      return ['x-axis', 'y-axis', 'point', 'Break By / Color'];
    default:
      return ['categories'];
  }
}

const findDrillableItem = (widgetType: WidgetType, panels: Panel[]): PanelItem | undefined => {
  const drillableItems = getDrilldownAllowedPanelNames(widgetType)
    .map((name) => getEnabledPanelItems(panels, name))
    .flat()
    .filter((item) => {
      const isMeasure = 'agg' in item.jaql && item.jaql.agg;
      const isFormula = 'formula' in item.jaql && item.jaql.formula;
      return !isMeasure && !isFormula;
    });
  // Note: drilldown is allowed only if the widget has a single drillable item.
  const isDrilldownAllowed = drillableItems.length === 1;

  return isDrilldownAllowed ? drillableItems[0] : undefined;
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
  widgetType: WidgetType,
  panels: Panel[],
  drillHistory: PanelItem[] = [],
  enableDrillToAnywhere?: boolean,
): DrilldownOptions => {
  const drillableItem = findDrillableItem(widgetType, panels);
  const rootItem = drillableItem && getRootPanelItem(drillableItem);
  const drilldownSelections = getDrilldownSelections(drillableItem);
  const drilldownHierarchies = extractDrilldownHierarchies(rootItem);
  const drilldownDimensions = uniqBy(
    [
      ...(drillableItem ? getAvailableDrilldowns(drillableItem) : []),
      ...(enableDrillToAnywhere ? drillHistory.map(getAvailableDrilldowns).flat() : []),
    ],
    ({ expression }) => expression,
  );

  return {
    drilldownPaths: [...drilldownDimensions, ...drilldownHierarchies],
    drilldownSelections,
  };
};
