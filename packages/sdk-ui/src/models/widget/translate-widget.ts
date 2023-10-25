import { WidgetDto } from '../../dashboard-widget/types';
import { WidgetModel } from './types';

export function translateWidget(widget: WidgetDto): WidgetModel {
  const { oid, title, datasource } = widget;
  return {
    oid,
    title,
    dataSource: datasource.fullname ?? datasource.title,
  };
}
