import {
  BackgroundFilterJaql,
  BaseFilterJaql,
  CascadingFilter,
  DimensionalBaseMeasure,
  ExcludeMembersFilterJaql,
  Filter,
  FilterJaql,
  getColumnNameFromAttribute,
  getTableNameFromAttribute,
  IncludeMembersFilterJaql,
  isCascadingFilter,
  isMembersFilter,
  isRankingFilter,
  MembersFilter,
  RankingFilter,
  TurnOffMembersFilterJaql,
} from '@sisense/sdk-data';
import { CascadingFilterDto, FilterDto, LayoutDto } from '@/api/types/dashboard-dto';
import { ConditionFilterJaql } from '@sisense/sdk-data/dist/dimensional-model/filters/utils/types';
import { WidgetsPanelLayout } from '@/dashboard/types';

/**
 * Translates a {@link Filter} to a {@link FilterDto}.
 *
 * @param filter - The filter to translate.
 * @returns FilterDto
 * @internal
 */
export function filterToFilterDto(filter: Filter): FilterDto | CascadingFilterDto {
  return isCascadingFilter(filter)
    ? cascadingFilterToFilterDto(filter)
    : regularFilterToFilterDto(filter);
}

function regularFilterToFilterDto(filter: Filter): FilterDto {
  if (isMembersFilter(filter)) {
    return membersFilterToDto(filter);
  } else if (isRankingFilter(filter)) {
    return rankingFilterToDto(filter);
  }
  return getFilterBaseDto(filter);
}

function cascadingFilterToFilterDto(filter: CascadingFilter): CascadingFilterDto {
  return {
    isCascading: true,
    instanceid: filter.config.guid,
    disabled: filter.config.disabled,
    levels: filter.filters.map((f) => {
      const levelFilterDto = regularFilterToFilterDto(f);
      return {
        ...levelFilterDto.jaql,
        instanceid: levelFilterDto.instanceid,
      };
    }),
  };
}

function getFilterBaseDto(filter: Filter): FilterDto {
  const {
    config: { disabled },
  } = filter;
  const filterJaql: FilterJaql = Object.assign(Object.create(filter), {
    config: { ...filter.config, disabled: false },
  }).jaql(true);

  return {
    jaql: {
      ...filterJaql,
      table: getTableNameFromAttribute(filter.attribute),
      column: getColumnNameFromAttribute(filter.attribute),
    },
    disabled,
    instanceid: filter.config.guid,
    isCascading: false,
  };
}

function membersFilterToDto(filter: MembersFilter) {
  const filterDto = getFilterBaseDto(filter);

  (filterDto.jaql.filter as IncludeMembersFilterJaql).multiSelection =
    filter.config.enableMultiSelection;

  // Current implementation of MembersFilter missing original order of members
  if (filter.config.deactivatedMembers.length > 0) {
    if (filter.config.excludeMembers) {
      (filterDto.jaql.filter as ExcludeMembersFilterJaql).exclude.members = [
        ...filter.members,
        ...filter.config.deactivatedMembers,
      ];
    } else {
      (filterDto.jaql.filter as IncludeMembersFilterJaql).members = [
        ...filter.members,
        ...filter.config.deactivatedMembers,
      ];
    }
  }

  if (filter.config.backgroundFilter) {
    setInnerFilter(
      filterDto.jaql,
      regularFilterToFilterDto(filter.config.backgroundFilter).jaql.filter,
    );
  }

  if (filter.config.deactivatedMembers.length > 0) {
    setInnerFilter(filterDto.jaql, {
      exclude: { members: filter.config.deactivatedMembers },
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
 *
 * @param parentFilter - The parent filter.
 * @param innerFilter - The inner filter.
 * @internal
 */
function setInnerFilter(
  parentFilter: FilterJaql,
  innerFilter: BaseFilterJaql | BackgroundFilterJaql | TurnOffMembersFilterJaql,
): void {
  if (parentFilter.filter) {
    return setInnerFilter(parentFilter.filter as FilterJaql, innerFilter);
  } else {
    parentFilter.filter = innerFilter;
  }
}

export function layoutToLayoutDto(layout: WidgetsPanelLayout): LayoutDto {
  const DEFAULT_HEIGHT = '500px';
  return {
    columns: layout.columns.map((column) => ({
      width: column.widthPercentage,
      cells: column.rows.map((row) => ({
        subcells: row.cells.map((cell) => ({
          width: cell.widthPercentage,
          elements: [
            {
              widgetid: cell.widgetId,
              height: cell.height ?? DEFAULT_HEIGHT,
            },
          ],
        })),
      })),
    })),
  };
}
