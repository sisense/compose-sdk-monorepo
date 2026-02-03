import { TranslatableError } from '../../../translation/translatable-error.js';
import { Attribute, Filter, LevelAttribute, MembersFilterConfig } from '../../interfaces.js';
import { FilterJaql } from '../../types.js';
import * as filterFactory from '../factory.js';
import { getDefaultBaseFilterConfig, simplifyFilterConfig } from '../filter-config-utils.js';
import {
  createAttributeFromFilterJaql,
  createMeasureFromFilterJaql,
} from './attribute-measure-util.js';
import {
  createAttributeFilterFromConditionFilterJaql,
  createMeasureFilterFromConditionFilterJaql,
} from './condition-filter-util.js';
import { extractFilterTypeFromFilterJaql } from './filter-types-util.js';
import {
  BaseFilterJaql,
  ConditionFilterJaql,
  FILTER_TYPES,
  FilterJaqlInternal,
  FilterModalType,
  FilterMultiSelectJaql,
  PeriodFilterJaql,
  RangeFilterJaql,
  SpecificItemsFilterJaql,
} from './types.js';

/**
 * Creates a generic filter (aka pass-through JAQL filter) if the JAQL cannot be translated to a specific filter type.
 *
 * @param jaql - The JAQL object.
 * @param guid - Optional GUID for the filter
 * @returns A generic Filter object.
 */
export const createGenericFilter = (
  jaql: FilterJaql | FilterJaqlInternal,
  guid: string,
): Filter => {
  const baseFilter = {
    config: { ...getDefaultBaseFilterConfig(), guid, originalFilterJaql: jaql },
    jaql: (nested?: boolean) => {
      if (nested) {
        return jaql;
      }
      return {
        jaql,
        panel: 'scope',
      };
    },
    attribute: {
      id: jaql.dim,
    },
    type: 'filter',
  };

  return {
    ...baseFilter,
  } as Filter;
};

/**
 * Creates a filter that includes all members of the attribute.
 *
 * @param attribute - The attribute.
 * @param guid - GUID for the filter
 * @returns The created Filter object.
 */
export const createFilterIncludeAll = (attribute: Attribute, guid: string): Filter => {
  // empty members array is interpreted by server as all members are included
  return filterFactory.members(attribute, [], { guid });
};

/**
 * Creates a filter from a specific items filter JAQL object.
 *
 * @param attribute - attribute
 * @param specificItemsFilterJaql - Specific Items Filter Jaql
 * @param guid - GUID for the filter
 * @returns Filter object
 */
export const createFilterFromSpecificItemsFilterJaql = (
  attribute: Attribute,
  specificItemsFilterJaql: SpecificItemsFilterJaql,
  guid: string,
  multiSelection?: boolean,
): Filter => {
  const deactivatedMembers = getDeactivatedMembersFromFilterJaql(specificItemsFilterJaql);
  const activeMembers = getActiveMembersFromFilterJaql(specificItemsFilterJaql, deactivatedMembers);
  const config: MembersFilterConfig = simplifyFilterConfig({
    guid,
    excludeMembers: false,
    enableMultiSelection: multiSelection ?? true,
    deactivatedMembers,
  });

  return filterFactory.members(attribute, activeMembers, config);
};

function getDeactivatedMembersFromFilterJaql(filterJaql: SpecificItemsFilterJaql): string[] {
  return filterJaql.filter?.turnedOff ? filterJaql.filter?.exclude?.members ?? [] : [];
}

function getActiveMembersFromFilterJaql(
  filterJaql: SpecificItemsFilterJaql,
  deactivatedMembers: string[] | undefined,
): string[] {
  const allMembers = filterJaql.members;
  return deactivatedMembers
    ? allMembers.filter((member) => !deactivatedMembers.includes(member))
    : allMembers;
}

/**
 * Creates a filter from a date range filter JAQL object.
 *
 * @param attribute - attribute
 * @param rangeFilterJaql - Range Filter Jaql
 * @param guid - GUID for the filter
 * @returns Filter object
 */
export const createFilterFromDateRangeFilterJaql = (
  attribute: LevelAttribute,
  rangeFilterJaql: RangeFilterJaql,
  guid: string,
): Filter => {
  return filterFactory.dateRange(
    attribute,
    rangeFilterJaql.from as string,
    rangeFilterJaql.to as string,
    { guid },
  );
};

/**
 * Creates a filter from a numeric range filter JAQL object.
 *
 * @param attribute - attribute
 * @param rangeFilterJaql - Range Filter Jaql
 * @param guid - GUID for the filter
 * @returns Filter object
 */
export const createFilterFromNumericRangeJaql = (
  attribute: Attribute,
  rangeFilterJaql: RangeFilterJaql,
  guid: string,
): Filter => {
  return filterFactory.between(
    attribute,
    rangeFilterJaql.from as number,
    rangeFilterJaql.to as number,
    { guid },
  );
};

/**
 * Creates a filter from a period filter JAQL object.
 *
 * @param attribute - attribute
 * @param periodFilterJaql - Period Filter Jaql
 * @param guid - GUID for the filter
 * @returns Filter object
 */
export const createFilterFromPeriodFilterJaql = (
  attribute: LevelAttribute,
  periodFilterJaql: PeriodFilterJaql,
  guid: string,
): Filter => {
  if (periodFilterJaql.last) {
    return filterFactory.dateRelativeTo(
      attribute,
      periodFilterJaql.last.offset,
      periodFilterJaql.last.count,
      periodFilterJaql.last.anchor,
      { guid },
    );
  } else {
    return filterFactory.dateRelativeFrom(
      attribute,
      periodFilterJaql.next.offset,
      periodFilterJaql.next.count,
      periodFilterJaql.next.anchor,
      { guid },
    );
  }
};

/**
 * Creates a filter from a custom filter JAQL object.
 *
 * @param attribute - attribute
 * @param customFilterJaql - Custom Filter Jaql
 * @param guid - GUID for the filter
 * @returns Filter object
 */
export const createFilterFromCustomFilterJaql = (
  attribute: Attribute,
  customFilterJaql: BaseFilterJaql,
  guid: string,
): Filter => {
  return filterFactory.customFilter(attribute, customFilterJaql, {
    guid,
  });
};

/**
 * Creates a filter from a filter JAQL object.
 *
 * @param jaql - The filter JAQL object.
 * @param guid - GUID for the filter
 * @returns Filter object.
 */
export const createFilterFromJaqlInternal = (jaql: FilterJaqlInternal, guid: string): Filter => {
  try {
    if ('formula' in jaql) {
      // generic pass-through JAQL filter will be used instead
      throw new TranslatableError('errors.filter.formulaFiltersNotSupported', {
        filter: JSON.stringify(jaql),
        attributeName: jaql.title ?? jaql.column ?? jaql.dim,
      });
    }
    const filterJaqlWrapperWithType = extractFilterTypeFromFilterJaql(
      jaql,
      jaql.datatype as FilterModalType,
    );

    const { filter: filterJaqlWithType } = filterJaqlWrapperWithType;
    const { filterType } = filterJaqlWithType;
    const attribute = createAttributeFromFilterJaql(jaql);
    const measure = createMeasureFromFilterJaql(jaql);

    switch (filterType) {
      case FILTER_TYPES.INCLUDE_ALL:
        return createFilterIncludeAll(attribute, guid);
      case FILTER_TYPES.SPECIFIC_ITEMS:
        return createFilterFromSpecificItemsFilterJaql(
          attribute,
          filterJaqlWithType as SpecificItemsFilterJaql,
          guid,
          (filterJaqlWithType as FilterMultiSelectJaql).multiSelection,
        );
      case FILTER_TYPES.CONDITION:
        if (measure) {
          return createMeasureFilterFromConditionFilterJaql(
            measure,
            filterJaqlWithType as ConditionFilterJaql,
            guid,
          );
        } else {
          return createAttributeFilterFromConditionFilterJaql(
            attribute,
            filterJaqlWithType as ConditionFilterJaql,
            guid,
          );
        }
      case FILTER_TYPES.DATE_RANGE:
        return createFilterFromDateRangeFilterJaql(
          attribute as LevelAttribute,
          filterJaqlWithType as RangeFilterJaql,
          guid,
        );
      case FILTER_TYPES.PERIOD:
        return createFilterFromPeriodFilterJaql(
          attribute as LevelAttribute,
          filterJaqlWithType as PeriodFilterJaql,
          guid,
        );
      case FILTER_TYPES.NUMERIC_RANGE:
        return createFilterFromNumericRangeJaql(
          attribute,
          filterJaqlWithType as RangeFilterJaql,
          guid,
        );
      case FILTER_TYPES.ADVANCED:
        return createFilterFromCustomFilterJaql(attribute, filterJaqlWithType, guid);
      case FILTER_TYPES.INVALID:
        return createGenericFilter(jaql, guid);
    }
  } catch (e) {
    // if a filter type is untranslatable, fall back to the generic pass-through JAQL filter
    console.debug(
      'Fall back to generic pass-through JAQL filter due to filter translation error:',
      e,
    );
  }
  return createGenericFilter(jaql, guid);
};
