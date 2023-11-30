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

export const extractDrilldownOptions = (
  widgetType: WidgetType,
  panels: Panel[],
): DrilldownOptions => {
  const categoriesPanelName = [WidgetType.LineChart, WidgetType.AreaChart].includes(widgetType)
    ? 'x-axis'
    : 'categories';

  const item = getEnabledPanelItems(panels, categoriesPanelName)[0];
  const drilldownSelections = getDrilldownSelections(item);
  const drilldownDimensions = getAvailableDrilldowns(item);
  return {
    drilldownDimensions,
    drilldownSelections,
  };
};
