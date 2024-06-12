import { Filter } from '@sisense/sdk-data';
import cloneDeep from 'lodash/cloneDeep';
import { WidgetModel } from '@/models';

export function isSupportedWidgetTypeByDashboard(widgetType: string) {
  return widgetType !== 'plugin';
}

export function addFiltersToWidget(widget: WidgetModel, filters: Filter[]): WidgetModel {
  const widgetClone = cloneDeep(widget);
  widgetClone.filters = filters.concat(widget.filters || []);
  return widgetClone;
}

export const getDividerStyle = (color: string, width: number) => `${width}px solid ${color}`;
