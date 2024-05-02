import { WidgetDto, Datasource } from '../../dashboard-widget/types';
import { FilterJaql, FilterRelationsModel } from '@sisense/sdk-data';
import { AnyObject } from '../../utils/utility-types';

/** @internal */
export type Layout = {
  columns: {
    width: number;
    cells: {
      subcells: {
        width: number;
        elements: {
          height: number | string;
          widgetid: string;
        }[];
      }[];
    }[];
  }[];
};

export type Filter = {
  isCascading?: false;
  jaql: FilterJaql & AnyObject;
  instanceid?: string;
  disabled?: boolean;
};

export type CascadingFilter = {
  isCascading: true;
  levels: FilterJaql[];
  instanceid?: string;
  disabled?: boolean;
};

export type DashboardDto = {
  oid: string;
  title: string;
  datasource: Datasource;
  widgets?: WidgetDto[];
  filters?: Array<Filter | CascadingFilter>;
  filterRelations?: {
    filterRelations: FilterRelationsModel;
  }[];
  layout?: Layout;
} & AnyObject;
