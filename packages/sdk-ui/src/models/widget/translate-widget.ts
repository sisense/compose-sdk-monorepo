import { CompleteThemeSettings } from '../../types';
import { getChartType } from '@/dashboard-widget/utils';
import { WidgetDto, WidgetType } from '../../dashboard-widget/types';
import { WidgetTypeInternal } from './types';
import { WidgetModel } from './widget-model';

export function translateWidget(
  widget: WidgetDto,
  themeSettings?: CompleteThemeSettings,
): WidgetModel {
  return new WidgetModel(widget, themeSettings);
}

export function translateWidgetType(widgetType: WidgetType): WidgetTypeInternal {
  if (widgetType === 'plugin') {
    return 'plugin';
  } else if (widgetType === 'pivot' || widgetType === 'pivot2') {
    return 'pivot';
  } else {
    return getChartType(widgetType);
  }
}
