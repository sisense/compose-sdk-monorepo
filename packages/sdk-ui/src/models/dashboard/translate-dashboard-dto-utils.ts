import { Filter, getColumnNameFromAttribute, getTableNameFromAttribute } from '@sisense/sdk-data';
import { FilterDto } from '@/api/types/dashboard-dto';

/**
 * Translates a {@link Filter} to a {@link FilterDto}.
 * @param filter
 *
 * @returns FilterDto
 *
 * @internal
 */
export function filterToFilterDto(filter: Filter): FilterDto {
  const { disabled } = filter;
  const filterJaql = Object.assign(Object.create(filter), { disabled: false }).jaql(true);
  return {
    jaql: {
      ...filterJaql,
      table: getTableNameFromAttribute(filter.attribute),
      column: getColumnNameFromAttribute(filter.attribute),
    },
    disabled,
    instanceid: filter.id,
    isCascading: false,
  } as FilterDto;
}
