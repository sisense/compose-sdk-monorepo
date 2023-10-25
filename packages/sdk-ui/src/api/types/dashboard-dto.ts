import { WidgetDto, Datasource, FilterJaql } from '../../dashboard-widget/types';

type Filter = {
  jaql: FilterJaql;
  isCascading: boolean;
};

export type DashboardDto = {
  oid: string;
  title: string;
  datasource: Datasource;
  widgets?: WidgetDto[];
  filters?: Filter[];
};
