import { type DashboardDto } from '../../api/types/dashboard-dto';
import { translateWidget } from '../widget/translate-widget';
import { type DashboardModel } from './types';

export function translateDashboard({
  oid,
  title,
  datasource,
  widgets,
}: DashboardDto): DashboardModel {
  return {
    oid,
    title,
    dataSource: datasource.fullname ?? datasource.title,
    ...(widgets && {
      widgets: widgets.map(translateWidget),
    }),
  };
}
