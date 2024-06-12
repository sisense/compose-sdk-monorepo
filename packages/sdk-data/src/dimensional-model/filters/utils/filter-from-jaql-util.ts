import {
  ConditionFilterJaql,
  FILTER_TYPES,
  FilterJaqlInternal,
  FilterModalType,
  PeriodFilterJaql,
  RangeFilterJaql,
  SpecificItemsFilterJaql,
} from './types.js';
import { Attribute, BaseMeasure, Filter, LevelAttribute } from '../../interfaces.js';
import { FilterJaql } from '../../types.js';
import * as filterFactory from '../factory.js';
import {
  createAttributeFilterFromConditionFilterJaql,
  createMeasureFilterFromConditionFilterJaql,
} from './condition-filter-util.js';
import { extractFilterTypeFromFilterJaql } from './filter-types-util.js';
import { withComposeCode } from './filter-code-util.js';
import {
  createAttributeFromFilterJaql,
  createMeasureFromFilterJaql,
} from './attribute-measure-util.js';
import { guidFast } from '../../../utils.js';

/**
 * Creates a generic filter (aka pass-through JAQL filter) if the JAQL cannot be translated to a specific filter type.
 *
 * @param jaql - The JAQL object.
 * @param guid - Optional GUID for the filter
 * @returns A generic Filter object.
 */
export const createGenericFilter = (
  jaql: FilterJaql | FilterJaqlInternal,
  guid?: string,
): Filter => {
  return {
    guid: guid || guidFast(13),
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

    serializable() {
      return { ...this, jaql: this.jaql() };
    },
    toJSON() {
      return this.serializable();
    },
  } as Filter;
};

/**
 * Creates a filter that includes all members of the attribute.
 *
 * @param attribute - The attribute.
 * @param guid - Optional GUID for the filter
 * @returns The created Filter object.
 */
export const createFilterIncludeAll = (attribute: Attribute, guid?: string): Filter => {
  return withComposeCode(filterFactory.members)(attribute, [], guid);
};

/**
 * Creates a filter from a specific items filter JAQL object.
 *
 * @param attribute - attribute
 * @param specificItemsFilterJaql - Specific Items Filter Jaql
 * @param guid - Optional GUID for the filter
 * @returns Filter object
 */
export const createFilterFromSpecificItemsFilterJaql = (
  attribute: Attribute,
  specificItemsFilterJaql: SpecificItemsFilterJaql,
  guid?: string,
): Filter => {
  return withComposeCode(filterFactory.members)(attribute, specificItemsFilterJaql.members, guid);
};

/**
 * Creates a filter from a date range filter JAQL object.
 *
 * @param attribute - attribute
 * @param rangeFilterJaql - Range Filter Jaql
 * @param guid - Optional GUID for the filter
 * @returns Filter object
 */
export const createFilterFromDateRangeFilterJaql = (
  attribute: LevelAttribute,
  rangeFilterJaql: RangeFilterJaql,
  guid?: string,
): Filter => {
  return withComposeCode(filterFactory.dateRange)(
    attribute,
    rangeFilterJaql.from as string,
    rangeFilterJaql.to as string,
    guid,
  );
};

/**
 * Creates a filter from a numeric range filter JAQL object.
 *
 * @param attribute - attribute
 * @param rangeFilterJaql - Range Filter Jaql
 * @param guid - Optional GUID for the filter
 * @returns Filter object
 */
export const createFilterFromNumericRangeJaql = (
  attribute: Attribute,
  rangeFilterJaql: RangeFilterJaql,
  guid?: string,
): Filter => {
  return withComposeCode(filterFactory.between)(
    attribute,
    rangeFilterJaql.from as number,
    rangeFilterJaql.to as number,
    guid,
  );
};

/**
 * Creates a filter from a period filter JAQL object.
 *
 * @param attribute - attribute
 * @param periodFilterJaql - Period Filter Jaql
 * @param guid - Optional GUID for the filter
 * @returns Filter object
 */
export const createFilterFromPeriodFilterJaql = (
  attribute: LevelAttribute,
  periodFilterJaql: PeriodFilterJaql,
  guid?: string,
): Filter => {
  if (periodFilterJaql.last) {
    return withComposeCode(filterFactory.dateRelativeTo)(
      attribute,
      periodFilterJaql.last.offset,
      periodFilterJaql.last.count,
      periodFilterJaql.last.anchor,
      guid,
    );
  } else {
    return withComposeCode(filterFactory.dateRelativeFrom)(
      attribute,
      periodFilterJaql.next.offset,
      periodFilterJaql.next.count,
      periodFilterJaql.next.anchor,
      guid,
    );
  }
};

/**
 * Creates a filter from a condition filter JAQL object.
 *
 * @param attribute - attribute
 * @param conditionFilterJaql - Condition Filter Jaql
 * @param measure - measure
 * @param guid - Optional GUID for the filter
 * @returns Filter object
 */
export const createFilterFromConditionFilterJaql = (
  attribute: Attribute,
  conditionFilterJaql: ConditionFilterJaql,
  measure?: BaseMeasure,
  guid?: string,
): Filter => {
  if (measure) {
    return createMeasureFilterFromConditionFilterJaql(measure, conditionFilterJaql, guid);
  } else {
    return createAttributeFilterFromConditionFilterJaql(attribute, conditionFilterJaql, guid);
  }
};

/**
 * Creates a filter from a filter JAQL object.
 *
 * @param jaql - The filter JAQL object.
 * @param guid - Optional GUID for the filter
 * @returns Filter object.
 */
export const createFilterFromJaqlInternal = (jaql: FilterJaqlInternal, guid?: string): Filter => {
  try {
    if ('formula' in jaql) {
      // generic pass-through JAQL filter will be used instead
      throw 'Formula-based filter not supported yet: ' + JSON.stringify(jaql);
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
        );
      case FILTER_TYPES.CONDITION:
        return createFilterFromConditionFilterJaql(
          attribute,
          filterJaqlWithType as ConditionFilterJaql,
          measure,
          guid,
        );
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
      case FILTER_TYPES.INVALID:
        return createGenericFilter(jaql, guid);
    }
  } catch (e) {
    // if a filter type is untranslatable, fall back to the generic pass-through JAQL filter
    // console.error(e);
  }

  return createGenericFilter(jaql, guid);
};
