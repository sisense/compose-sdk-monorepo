import { Attribute, IncludeMembersFilter } from '@sisense/sdk-data';
import { createDataColumn } from './translate-widget-data-options';
import { DatetimeMask, Panel, PanelItem, WidgetType } from './types';
import { getEnabledPanelItems } from './utils';
import { DataPoint, DrilldownOptions } from '../types';
import { applyDateFormat } from '../query/date-formats/apply-date-format';

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
      (item.through.jaql.filter as IncludeMembersFilter)?.members?.map(
        dateFormat
          ? (member) => ({
              categoryValue: member,
              categoryDisplayValue: applyDateFormat(new Date(member), dateFormat),
            })
          : (member) => ({ categoryValue: member }),
      ) ?? [];

    return [...getDrilldownSelections(item.parent), { nextDimension, points }];
  }
  return [];
};

/**
 * Gets the panel name allowed for drilling based on the widget type.
 *
 * @param {WidgetType} widgetType - The type of the widget.
 * @returns {string[]} An array of panel names allowed for drilling.
 */
function getDrilldownAllowedPanelName(widgetType: WidgetType) {
  switch (widgetType) {
    case 'chart/line':
    case 'chart/area':
      return 'x-axis';
    case 'chart/boxplot':
      return 'category';
    default:
      return 'categories';
  }
}

export const extractDrilldownOptions = (
  widgetType: WidgetType,
  panels: Panel[],
): DrilldownOptions => {
  const categoriesPanelName = getDrilldownAllowedPanelName(widgetType);
  const item = getEnabledPanelItems(panels, categoriesPanelName)[0];
  const drilldownSelections = getDrilldownSelections(item);
  const drilldownDimensions = getAvailableDrilldowns(item);
  return {
    drilldownDimensions,
    drilldownSelections,
  };
};
