import { WidgetDto, Datasource } from '../../dashboard-widget/types';
import { FilterJaql, FilterRelationsModel } from '@sisense/sdk-data';
import { AnyObject } from '../../utils/utility-types';

/** @internal */
export type Layout = {
  columns: {
    width: number;
    cells?: {
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

export type FilterDto = {
  isCascading?: false;
  jaql: FilterJaql & AnyObject;
  instanceid?: string;
  disabled?: boolean;
};

export type CascadingFilterDto = {
  isCascading: true;
  levels: FilterJaql[];
  instanceid?: string;
  disabled?: boolean;
};

export const isCascadingFilterDto = (
  filter: FilterDto | CascadingFilterDto,
): filter is CascadingFilterDto => {
  return 'levels' in filter && filter.isCascading === true;
};

export type DashboardDto = {
  oid: string;
  title: string;
  datasource: Datasource;
  widgets?: WidgetDto[];
  filters?: Array<FilterDto | CascadingFilterDto>;
  filterRelations?: {
    filterRelations: FilterRelationsModel;
  }[];
  layout?: Layout;
} & AnyObject;
