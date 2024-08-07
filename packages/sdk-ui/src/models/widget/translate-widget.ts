import { CompleteThemeSettings } from '../../types';
import { getChartType } from '@/dashboard-widget/utils';
import { WidgetDto, WidgetType } from '../../dashboard-widget/types';
import { WidgetTypeInternal } from './types';
import { WidgetModel } from './widget-model';
import { AppSettings } from '@/app/settings/settings';

/**
 * Translates a widget DTO to a widget model.
 * @param widget - The widget DTO to be converted to a widget model
 * @param themeSettings - Optional theme settings
 * @param appSettings - Optional application settings
 * @returns The widget model
 */
export function translateWidget(
  widget: WidgetDto,
  themeSettings?: CompleteThemeSettings,
  appSettings?: AppSettings,
): WidgetModel {
  return new WidgetModel(widget, themeSettings, appSettings);
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
