import { WidgetDto, Datasource } from '../../dashboard-widget/types';
import { FilterJaql } from '@sisense/sdk-data';

export type Filter = {
  isCascading?: false;
  jaql: FilterJaql;
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
};
