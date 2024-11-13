import { WidgetDto } from '../../widget-by-id/types';
import { FilterJaql, FilterRelationsModel, JaqlDataSource } from '@sisense/sdk-data';
import { AnyObject } from '../../utils/utility-types';

/** @internal */
export type LayoutDto = {
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
  locked?: boolean;
};

export type CascadingFilterDto = {
  isCascading: true;
  levels: FilterJaql[];
  instanceid?: string;
  disabled?: boolean;
  locked?: boolean;
};

export type DashboardStyleDto = {
  palette?: {
    name: string;
    colors: string[];
  };
  paletteId?: string;
};

export const isCascadingFilterDto = (
  filter: FilterDto | CascadingFilterDto,
): filter is CascadingFilterDto => {
  return 'levels' in filter && filter.isCascading === true;
};

/**
 * @internal
 */
export type DashboardDto = {
  oid: string;
  title: string;
  datasource: JaqlDataSource;
  widgets?: WidgetDto[];
  filters?: Array<FilterDto | CascadingFilterDto>;
  filterRelations?: {
    filterRelations: FilterRelationsModel;
  }[];
  layout?: LayoutDto;
  style?: DashboardStyleDto;
} & AnyObject;
