import type {
  DashboardDto,
  Layout as SisenseLayout,
  FilterDto,
} from '../../api/types/dashboard-dto';
import { translateWidget } from '../widget/translate-widget';
import type { Layout, DashboardModel } from './types';
import { Filter, createFilterFromJaql } from '@sisense/sdk-data';

export const translateLayout = (layout: SisenseLayout): Layout => ({
  columns: layout.columns.map((c) => ({
    widthPercentage: c.width,
    cells: c.cells.map((cell) => ({
      subcells: cell.subcells.map((subcell) => ({
        widthPercentage: subcell.width,
        height: subcell.elements[0].height,
        widgetId: subcell.elements[0].widgetid,
      })),
    })),
  })),
});

const createFilterFromFilterDto = (filterDto: FilterDto): Filter => {
  const filter: Filter = createFilterFromJaql(filterDto.jaql);
  filter.disabled = filterDto.disabled ?? false;
  return filter;
};

export function translateDashboard({
  oid,
  title,
  datasource,
  widgets,
  layout,
  filters,
}: DashboardDto): DashboardModel {
  return {
    oid,
    title,
    layout: layout && translateLayout(layout),
    dataSource: datasource.fullname ?? datasource.title,
    ...(widgets && {
      widgets: widgets.map(translateWidget),
    }),
    ...(filters && {
      filters: filters
        // currently only non-cascading filters are supported
        .filter((filterDto) => !filterDto.isCascading)
        .map((filterDto) => {
          return createFilterFromFilterDto(filterDto as FilterDto);
        }),
    }),
  };
}
