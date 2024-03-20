import { type DataSource } from '@sisense/sdk-data';
import { WidgetModel } from '../widget/widget-model';

/** @internal */
export type Layout = {
  columns: {
    width: number;
    cells: {
      subcells: { width: number; elements: { height: number | string; widgetId: string }[] }[];
    }[];
  }[];
};

export type DashboardModel = {
  oid: string;
  title: string;
  dataSource: DataSource;
  widgets?: WidgetModel[];
  /** @internal */
  layout?: Layout;
};
