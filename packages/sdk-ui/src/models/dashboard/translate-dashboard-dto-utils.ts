import {
  BackgroundFilter,
  BaseFilter,
  CascadingFilter,
  DimensionalBaseMeasure,
  ExcludeMembersFilter,
  Filter,
  FilterJaql,
  getColumnNameFromAttribute,
  getTableNameFromAttribute,
  IncludeMembersFilter,
  MembersFilter,
  RankingFilter,
  TurnOffMembersFilter,
} from '@sisense/sdk-data';
import { CascadingFilterDto, FilterDto } from '@/api/types/dashboard-dto';
import { ConditionFilterJaql } from '@sisense/sdk-data/dist/dimensional-model/filters/utils/types';

/**
 * Translates a {@link Filter} to a {@link FilterDto}.
 * @param filter
 *
 * @returns FilterDto
 *
 * @internal
 */
export function filterToFilterDto(filter: Filter): FilterDto | CascadingFilterDto {
  return filter instanceof CascadingFilter
    ? cascadingFilterToFilterDto(filter)
    : regularFilterToFilterDto(filter);
}

function regularFilterToFilterDto(filter: Filter): FilterDto {
  if (filter instanceof MembersFilter) {
    return membersFilterToDto(filter);
  } else if (filter instanceof RankingFilter) {
    return rankingFilterToDto(filter);
  }
  return getFilterBaseDto(filter);
}

function cascadingFilterToFilterDto(filter: CascadingFilter): CascadingFilterDto {
  return {
    isCascading: true,
    instanceid: filter.id,
    disabled: filter.disabled,
    levels: filter.filters.map((f) => regularFilterToFilterDto(f).jaql),
  };
}

function getFilterBaseDto(filter: Filter): FilterDto {
  const { disabled } = filter;
  const filterJaql: FilterJaql = Object.assign(Object.create(filter), {
    disabled: false,
    backgroundFilter: undefined,
  }).jaql(true);

  return {
    jaql: {
      ...filterJaql,
      table: getTableNameFromAttribute(filter.attribute),
      column: getColumnNameFromAttribute(filter.attribute),
    },
    disabled,
    instanceid: filter.guid,
    isCascading: false,
  };
}

function membersFilterToDto(filter: MembersFilter) {
  const filterDto = getFilterBaseDto(filter);

  (filterDto.jaql.filter as IncludeMembersFilter).multiSelection = filter.multiSelection;

  // Current implementation of MembersFilter missing original order of members
  if (filter.deactivatedMembers.length > 0) {
    if (filter.excludeMembers) {
      (filterDto.jaql.filter as ExcludeMembersFilter).exclude.members = [
        ...filter.members,
        ...filter.deactivatedMembers,
      ];
    } else {
      (filterDto.jaql.filter as IncludeMembersFilter).members = [
        ...filter.members,
        ...filter.deactivatedMembers,
      ];
    }
  }

  if (filter.backgroundFilter) {
    setInnerFilter(filterDto.jaql, regularFilterToFilterDto(filter.backgroundFilter).jaql.filter);
  }

  if (filter.deactivatedMembers.length > 0) {
    setInnerFilter(filterDto.jaql, {
      exclude: { members: filter.deactivatedMembers },
      turnedOff: true,
    });
  }

  return filterDto;
}

function rankingFilterToDto(filter: RankingFilter): FilterDto {
  const filterDto = getFilterBaseDto(filter);

  // In case of formula we still have messing table and column names in context, but this not break filter
  if (filter.measure instanceof DimensionalBaseMeasure) {
    const resultFilter = filterDto.jaql.filter as ConditionFilterJaql;
    resultFilter.by!.table = getTableNameFromAttribute(filter.measure.attribute);
    resultFilter.by!.column = getColumnNameFromAttribute(filter.measure.attribute);

    resultFilter.rankingMessage = filter.measure.name;
  }

  return filterDto;
}

/**
 * Recursively sets the inner filter of a parent filter.
 * @param parentFilter - The parent filter.
 * @param innerFilter - The inner filter.
 *
 * @internal
 */
function setInnerFilter(
  parentFilter: FilterJaql,
  innerFilter: BaseFilter | BackgroundFilter | TurnOffMembersFilter,
): void {
  if (parentFilter.filter) {
    return setInnerFilter(parentFilter.filter as FilterJaql, innerFilter);
  } else {
    parentFilter.filter = innerFilter;
  }
}
