/* eslint-disable max-lines */
import {
  ConditionJaql,
  ConditionTypes,
  FILTER_TYPES,
  FilterJaqlInternal,
  FilterModalTypes,
  RangeJaql,
  SpecificItemsJaql,
} from './modern-analytics-filters/types.js';
import { Attribute, Filter, LevelAttribute } from '../../interfaces.js';
import { isNumber } from '../../simple-column-types.js';
import { FilterJaql, MetadataTypes } from '../../types.js';
import { DimensionalAttribute, DimensionalLevelAttribute } from '../../attributes.js';
import * as filterFactory from '../factory.js';
import { getSelectedConditionOption } from './modern-analytics-filters/condition-filter-util.js';
import { extractTypeFromFilterJaql } from './modern-analytics-filters/filter-types-util.js';
import { normalizeAttributeName } from '../../base.js';

const DATA_MODEL_MODULE_NAME = 'DM';

/**
 * High order function to construct compose code for filter factory functions
 *
 * @param func - filter factory function
 */
function withComposeCode(func: (...args: any[]) => any): (...args: any[]) => any {
  return function (...args: any[]): any {
    const argValues = args
      .map((arg) => {
        if (MetadataTypes.isAttribute(arg)) {
          return (arg as Attribute).composeCode;
        }

        if (Array.isArray(arg)) {
          return (
            '[' +
            arg
              .map((item) => {
                if (typeof item === 'string') {
                  return `'${item}'`;
                }
                if (typeof item === 'number') {
                  return item;
                }
                return JSON.stringify(item);
              })
              .join(', ') +
            ']'
          );
        }

        return JSON.stringify(arg);
      })
      .join(', ');
    const signature = `filterFactory.${func.name}(${argValues})`;
    const filter: Filter = func(...args);
    filter.composeCode = signature;
    return filter;
  };
}

/**
 * Creates a generic filter if the JAQL cannot be translated to a specific filter type.
 *
 * @param jaql - The JAQL object.
 * @param instanceid - The instance ID.
 * @returns - The created Filter object.
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

export const createFilterIncludeAll = (attribute: Attribute): Filter => {
  return withComposeCode(filterFactory.members)(attribute, []);
};

export const createFilterFromConditionJaql = (
  attribute: Attribute,
  conditionJaql: ConditionJaql,
): Filter => {
  switch (getSelectedConditionOption(conditionJaql)) {
    case ConditionTypes.BOTTOM:
      return withComposeCode(filterFactory.bottomRanking)(
        attribute,
        conditionJaql[ConditionTypes.BOTTOM] as number,
      );
    case ConditionTypes.GREATER_THAN:
      return withComposeCode(filterFactory.greaterThan)(
        attribute,
        conditionJaql[ConditionTypes.GREATER_THAN] as number,
      );
    case ConditionTypes.GREATER_THAN_OR_EQUAL:
      return withComposeCode(filterFactory.greaterThanOrEqual)(
        attribute,
        conditionJaql[ConditionTypes.GREATER_THAN_OR_EQUAL] as number,
      );
    case ConditionTypes.EQUALS:
      return withComposeCode(filterFactory.equals)(
        attribute,
        conditionJaql[ConditionTypes.EQUALS] as number,
      );
  }

  throw 'Jaql contains unsupported condition filter: ' + JSON.stringify(conditionJaql);
};

export const createFilterFromSpecificItemsJaql = (
  attribute: Attribute,
  specificItemsJaql: SpecificItemsJaql,
): Filter => {
  return withComposeCode(filterFactory.members)(attribute, specificItemsJaql.members);
};

export const createFilterFromRangeJaql = (
  attribute: LevelAttribute,
  rangeJaql: RangeJaql,
): Filter => {
  return withComposeCode(filterFactory.dateRange)(
    attribute,
    rangeJaql.from as string,
    rangeJaql.to as string,
  );
};

// TODO
// export const createFilterFromPeriodJaql = (
//   attribute: LevelAttribute,
//   periodJaql: PeriodJaql,
// ): Filter => {
//   return filterFactory.dateRange(attribute, rangeJaql.from as string, rangeJaql.to as string);
// };

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const createAttributeFromFilterJaql = (
  jaql: FilterJaql | FilterJaqlInternal,
): Attribute | LevelAttribute => {
  if (jaql.level) {
    // while level in JAQL is in lowercase, LevelAttribute.granularity has the first char capitalized
    const dateLevel = capitalizeFirstLetter(jaql.level);
    const levelAttribute: LevelAttribute = new DimensionalLevelAttribute(
      jaql.column,
      jaql.dim,
      dateLevel,
    );
    levelAttribute.composeCode = normalizeAttributeName(
      jaql.table,
      jaql.column,
      dateLevel,
      DATA_MODEL_MODULE_NAME,
    );
    return levelAttribute;
  }
  const attributeType = isNumber(jaql.datatype)
    ? MetadataTypes.NumericAttribute
    : MetadataTypes.TextAttribute;
  const attribute: Attribute = new DimensionalAttribute(jaql.column, jaql.dim, attributeType);
  attribute.composeCode = normalizeAttributeName(
    jaql.table,
    jaql.column,
    undefined,
    DATA_MODEL_MODULE_NAME,
  );

  return attribute;
};

/**
 * Creates a filter from a JAQL object.
 *
 * @param jaql - The filter JAQL object.
 * @param instanceid - The instance ID.
 * @returns - The created Filter object.
 */
// eslint-disable-next-line complexity
export const createFilterFromJaqlInternal = (
  jaql: FilterJaqlInternal,
  instanceid?: string,
): Filter => {
  try {
    const jaqlWrapperType = extractTypeFromFilterJaql(jaql, jaql.datatype as FilterModalTypes);

    const { filter: filterJaqlWithType } = jaqlWrapperType;
    const { jaqlType } = filterJaqlWithType;
    const attribute = createAttributeFromFilterJaql(jaql);

    switch (jaqlType) {
      case FILTER_TYPES.INCLUDE_ALL:
        return createFilterIncludeAll(attribute);
      case FILTER_TYPES.SPECIFIC_ITEMS:
        return createFilterFromSpecificItemsJaql(
          attribute,
          filterJaqlWithType as SpecificItemsJaql,
        );
      case FILTER_TYPES.CONDITION:
        return createFilterFromConditionJaql(attribute, filterJaqlWithType as ConditionJaql);
      case FILTER_TYPES.DATE_RANGE:
        return createFilterFromRangeJaql(
          attribute as LevelAttribute,
          filterJaqlWithType as RangeJaql,
        );
      case FILTER_TYPES.PERIOD:
        // TODO implement Filters of Period type
        break;
      case FILTER_TYPES.NUMERIC_RANGE:
        // TODO implement Filters of Numeric Range type
        break;
      case FILTER_TYPES.ADVANCED:
        // TODO implement Filters of Advanced type
        break;
      case FILTER_TYPES.INVALID:
        return createGenericFilter(jaql, instanceid);
    }
  } catch (e) {
    // console.error(e);
    return createGenericFilter(jaql, instanceid);
  }

  // if a filter type is untranslatable, fall back to the generic filter
  return createGenericFilter(jaql, instanceid);
};
