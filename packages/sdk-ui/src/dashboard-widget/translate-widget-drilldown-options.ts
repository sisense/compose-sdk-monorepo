import { Attribute, IncludeMembersFilter } from '@sisense/sdk-data';
import { createDataColumn } from './translate-widget-data-options';
import { DatetimeMask, Panel, PanelItem, WidgetType } from './types';
import { getEnabledPanelItems } from './utils';
import { DataPoint, DrilldownOptions } from '../types';
import { applyDateFormat } from '../query/date-formats/apply-date-format';
import parseISO from 'date-fns/parseISO';
import uniqBy from 'lodash-es/uniqBy';

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

export const extractDrilldownOptions = (
  widgetType: WidgetType,
  panels: Panel[],
  drillHistory: PanelItem[] = [],
  enableDrillToAnywhere?: boolean,
): DrilldownOptions => {
  const panelNames = getDrilldownAllowedPanelNames(widgetType);
  const drilledItem = panelNames
    .map((name) => getEnabledPanelItems(panels, name))
    .flat()
    .find((item) => !!item.parent);

  const drilldownSelections = getDrilldownSelections(drilledItem);
  const targetDrilldownDimensions = uniqBy(
    [
      ...(drilledItem ? getAvailableDrilldowns(drilledItem) : []),
      ...(enableDrillToAnywhere ? drillHistory.map(getAvailableDrilldowns).flat() : []),
    ],
    ({ expression }) => expression,
  );

  return {
    drilldownDimensions: targetDrilldownDimensions,
    drilldownSelections,
  };
};
