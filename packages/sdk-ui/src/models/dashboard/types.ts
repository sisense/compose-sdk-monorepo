import { type DataSource } from '@sisense/sdk-data';
import { WidgetModel } from '../widget/widget-model';

export type DashboardModel = {
  oid: string;
  title: string;
  dataSource: DataSource;
  widgets?: WidgetModel[];
};
