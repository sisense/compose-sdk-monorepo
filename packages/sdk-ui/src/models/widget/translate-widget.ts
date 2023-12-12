import { WidgetDto } from '../../dashboard-widget/types';
import { WidgetModel } from './widget-model';

export function translateWidget(widget: WidgetDto): WidgetModel {
  return new WidgetModel(widget);
}
