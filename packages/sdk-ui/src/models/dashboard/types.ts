import { type DataSource } from '@sisense/sdk-data';
import { type WidgetModel } from '../widget/types';

export type DashboardModel = {
  oid: string;
  title: string;
  dataSource: DataSource;
  widgets?: WidgetModel[];
};
