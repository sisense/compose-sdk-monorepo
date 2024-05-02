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

/**
 * Creates a generic filter (aka pass-through JAQL filter) if the JAQL cannot be translated to a specific filter type.
 *
 * @param jaql - The JAQL object.
 * @param instanceid - The instance ID.
 * @returns A generic Filter object.
 */
export const createGenericFilter = (
  jaql: FilterJaql | FilterJaqlInternal,
  instanceid?: string,
): Filter => {
  return {
    guid: instanceid,
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
 * @returns The created Filter object.
 */
export const createFilterIncludeAll = (attribute: Attribute): Filter => {
  return withComposeCode(filterFactory.members)(attribute, []);
};

/**
 * Creates a filter from a specific items filter JAQL object.
 *
 * @param attribute - attribute
 * @param specificItemsFilterJaql - Specific Items Filter Jaql
 * @returns Filter object
 */
export const createFilterFromSpecificItemsFilterJaql = (
  attribute: Attribute,
  specificItemsFilterJaql: SpecificItemsFilterJaql,
): Filter => {
  return withComposeCode(filterFactory.members)(attribute, specificItemsFilterJaql.members);
};

/**
 * Creates a filter from a date range filter JAQL object.
 *
 * @param attribute - attribute
 * @param rangeFilterJaql - Range Filter Jaql
 * @returns Filter object
 */
export const createFilterFromDateRangeFilterJaql = (
  attribute: LevelAttribute,
  rangeFilterJaql: RangeFilterJaql,
): Filter => {
  return withComposeCode(filterFactory.dateRange)(
    attribute,
    rangeFilterJaql.from as string,
    rangeFilterJaql.to as string,
  );
};

/**
 * Creates a filter from a numeric range filter JAQL object.
 *
 * @param attribute - attribute
 * @param rangeFilterJaql - Range Filter Jaql
 * @returns Filter object
 */
export const createFilterFromNumericRangeJaql = (
  attribute: Attribute,
  rangeFilterJaql: RangeFilterJaql,
): Filter => {
  return withComposeCode(filterFactory.between)(
    attribute,
    rangeFilterJaql.from as number,
    rangeFilterJaql.to as number,
  );
};

/**
 * Creates a filter from a period filter JAQL object.
 *
 * @param attribute - attribute
 * @param periodFilterJaql - Period Filter Jaql
 * @returns Filter object
 */
export const createFilterFromPeriodFilterJaql = (
  attribute: LevelAttribute,
  periodFilterJaql: PeriodFilterJaql,
): Filter => {
  if (periodFilterJaql.last) {
    return withComposeCode(filterFactory.dateRelativeTo)(
      attribute,
      periodFilterJaql.last.offset,
      periodFilterJaql.last.count,
      periodFilterJaql.last.anchor,
    );
  } else {
    return withComposeCode(filterFactory.dateRelativeFrom)(
      attribute,
      periodFilterJaql.next.offset,
      periodFilterJaql.next.count,
      periodFilterJaql.next.anchor,
    );
  }
};

/**
 * Creates a filter from a condition filter JAQL object.
 *
 * @param attribute - attribute
 * @param conditionFilterJaql - Condition Filter Jaql
 * @param measure - measure
 * @returns Filter object
 */
export const createFilterFromConditionFilterJaql = (
  attribute: Attribute,
  conditionFilterJaql: ConditionFilterJaql,
  measure?: BaseMeasure,
): Filter => {
  if (measure) {
    return createMeasureFilterFromConditionFilterJaql(measure, conditionFilterJaql);
  } else {
    return createAttributeFilterFromConditionFilterJaql(attribute, conditionFilterJaql);
  }
};

/**
 * Creates a filter from a filter JAQL object.
 *
 * @param jaql - The filter JAQL object.
 * @param instanceid - The instance ID.
 * @returns Filter object.
 */
export const createFilterFromJaqlInternal = (
  jaql: FilterJaqlInternal,
  instanceid?: string,
): Filter => {
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
        return createFilterIncludeAll(attribute);
      case FILTER_TYPES.SPECIFIC_ITEMS:
        return createFilterFromSpecificItemsFilterJaql(
          attribute,
          filterJaqlWithType as SpecificItemsFilterJaql,
        );
      case FILTER_TYPES.CONDITION:
        return createFilterFromConditionFilterJaql(
          attribute,
          filterJaqlWithType as ConditionFilterJaql,
          measure,
        );
      case FILTER_TYPES.DATE_RANGE:
        return createFilterFromDateRangeFilterJaql(
          attribute as LevelAttribute,
          filterJaqlWithType as RangeFilterJaql,
        );
      case FILTER_TYPES.PERIOD:
        return createFilterFromPeriodFilterJaql(
          attribute as LevelAttribute,
          filterJaqlWithType as PeriodFilterJaql,
        );
      case FILTER_TYPES.NUMERIC_RANGE:
        return createFilterFromNumericRangeJaql(attribute, filterJaqlWithType as RangeFilterJaql);
      case FILTER_TYPES.ADVANCED:
      case FILTER_TYPES.INVALID:
        return createGenericFilter(jaql, instanceid);
    }
  } catch (e) {
    // if a filter type is untranslatable, fall back to the generic pass-through JAQL filter
    // console.error(e);
  }

  return createGenericFilter(jaql, instanceid);
};
