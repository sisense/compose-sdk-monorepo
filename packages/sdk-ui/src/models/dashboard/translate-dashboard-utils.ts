import {
  type Layout as SisenseLayout,
  type FilterDto,
  type CascadingFilterDto,
  isCascadingFilterDto,
} from '../../api/types/dashboard-dto';
import type { Layout } from './types';
import { CascadingFilter, Filter, createFilterFromJaql } from '@sisense/sdk-data';

export const translateLayout = (layout: SisenseLayout): Layout => ({
  columns: layout.columns.map((c) => ({
    widthPercentage: c.width,
    rows: (c.cells || []).map((cell) => {
      const totalWidth = cell.subcells.reduce((acc, subcell) => acc + subcell.width, 0);
      return {
        cells: cell.subcells.map((subcell) => ({
          // If the total width of the subcells is less than 100, we increase width percentage to make the subcells fill the column
          widthPercentage: totalWidth < 100 ? subcell.width / (totalWidth / 100) : subcell.width,
          height: subcell.elements[0].height,
          widgetId: subcell.elements[0].widgetid,
        })),
      };
    }),
  })),
});

const createFilterFromFilterDto = (filterDto: FilterDto): Filter => {
  const filter: Filter = createFilterFromJaql(filterDto.jaql);
  filter.disabled = filterDto.disabled ?? false;
  return filter;
};

const createFilterFromCascadingFilterDto = (cascadingFilterDto: CascadingFilterDto): Filter => {
  const innerFilters = cascadingFilterDto.levels.map((level) => createFilterFromJaql(level));
  const filter = new CascadingFilter(innerFilters);
  filter.disabled = cascadingFilterDto.disabled ?? false;
  return filter;
};

export function extractDashboardFilters(
  dashboardFilters: Array<FilterDto | CascadingFilterDto>,
): Filter[] {
  return dashboardFilters.map((f) =>
    isCascadingFilterDto(f) ? createFilterFromCascadingFilterDto(f) : createFilterFromFilterDto(f),
  );
}
