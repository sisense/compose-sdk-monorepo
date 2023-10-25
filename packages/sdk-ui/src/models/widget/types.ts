import { DataSource } from '@sisense/sdk-data';

export type WidgetModel = {
  oid: string;
  title: string;
  dataSource: DataSource;
};
