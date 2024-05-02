import { type DataSource } from '@sisense/sdk-data';
import { WidgetModel } from '../widget/widget-model';

/** @internal */
export interface Layout {
  columns: {
    widthPercentage: number;
    cells: {
      subcells: {
        widthPercentage: number;
        height: number | string;
        widgetId: string;
      }[];
    }[];
  }[];
}

export type DashboardModel = {
  oid: string;
  title: string;
  dataSource: DataSource;
  widgets?: WidgetModel[];
  /** @internal */
  layout?: Layout;
};
