import { ConditionFilterJaql, ConditionFilterType } from './types.js';
import { Attribute, BaseMeasure, Filter } from '../../interfaces.js';
import { withComposeCode } from './filter-code-util.js';
import * as filterFactory from '../factory.js';
import { createMeasureFromRankingFilterJaql } from './attribute-measure-util.js';

const isTopCondition = (filter: ConditionFilterJaql): boolean => filter.top !== undefined;
const isBottomCondition = (filter: ConditionFilterJaql): boolean => filter.bottom !== undefined;
const isExcludeCondition = (filter: ConditionFilterJaql): boolean => !!filter.exclude?.members;
const isMembersCondition = (filter: ConditionFilterJaql): boolean =>
  !!filter.members && !!filter.isCondition;
const isWithinCondition = (filter: ConditionFilterJaql): boolean =>
  filter.last?.anchor !== undefined || filter.next?.anchor !== undefined;
const isGreaterThanCondition = (filter: ConditionFilterJaql): boolean =>
  filter.fromNotEqual !== undefined;
const isGreaterThanOrEqualCondition = (filter: ConditionFilterJaql): boolean =>
  filter.from !== undefined && !filter.isBetween;
const isLessThanCondition = (filter: ConditionFilterJaql): boolean =>
  filter.toNotEqual !== undefined;
const isLessThanOrEqualCondition = (filter: ConditionFilterJaql): boolean =>
  filter.to !== undefined && !filter.isBetween;
const isEqualsCondition = (filter: ConditionFilterJaql): boolean => filter.equals !== undefined;
const isNotEqualCondition = (filter: ConditionFilterJaql): boolean =>
  filter.doesntEqual !== undefined;
const isEmptyCondition = (filter: ConditionFilterJaql): boolean =>
  !!(filter.equals === '' && filter.isEmpty);
const isNotEmptyCondition = (filter: ConditionFilterJaql): boolean =>
  !!(filter.doesntEqual === '' && filter.isEmpty);
const isContainsCondition = (filter: ConditionFilterJaql): boolean => filter.contains !== undefined;
const isDoesntContainCondition = (filter: ConditionFilterJaql): boolean =>
  filter.doesntContain !== undefined;
const isStartsWithCondition = (filter: ConditionFilterJaql): boolean =>
  filter.startsWith !== undefined;
const isDoesntStartsWithCondition = (filter: ConditionFilterJaql): boolean =>
  filter.doesntStartWith !== undefined;
const isEndsWithCondition = (filter: ConditionFilterJaql): boolean => filter.endsWith !== undefined;
const isDoesntEndWithCondition = (filter: ConditionFilterJaql): boolean =>
  filter.doesntEndWith !== undefined;
const isBetweenCondition = (filter: ConditionFilterJaql): boolean =>
  filter.from !== undefined && filter.to !== undefined;
const isNotBetweenCondition = (filter: ConditionFilterJaql): boolean =>
  filter.exclude?.from !== undefined && filter.exclude?.to !== undefined;
const isMultipleCondition = (filter: ConditionFilterJaql): boolean => !!(filter.or || filter.and);

export const getSelectedConditionOption = (filter: ConditionFilterJaql): ConditionFilterType => {
  if (isBottomCondition(filter)) return ConditionFilterType.BOTTOM;
  if (isTopCondition(filter)) return ConditionFilterType.TOP;
  if (isExcludeCondition(filter)) return ConditionFilterType.IS_NOT;
  if (isWithinCondition(filter)) return ConditionFilterType.IS_WITHIN;
  if (isGreaterThanCondition(filter)) return ConditionFilterType.GREATER_THAN;
  if (isGreaterThanOrEqualCondition(filter)) return ConditionFilterType.GREATER_THAN_OR_EQUAL;
  if (isLessThanCondition(filter)) return ConditionFilterType.LESS_THAN;
  if (isLessThanOrEqualCondition(filter)) return ConditionFilterType.LESS_THAN_OR_EQUAL;
  if (isEqualsCondition(filter)) return ConditionFilterType.EQUALS;
  if (isNotEqualCondition(filter)) return ConditionFilterType.DOESNT_EQUAL;
  if (isEmptyCondition(filter)) return ConditionFilterType.IS_EMPTY;
  if (isNotEmptyCondition(filter)) return ConditionFilterType.IS_NOT_EMPTY;
  if (isContainsCondition(filter)) return ConditionFilterType.CONTAINS;
  if (isDoesntContainCondition(filter)) return ConditionFilterType.DOESNT_CONTAIN;
  if (isDoesntEndWithCondition(filter)) return ConditionFilterType.DOESNT_END_WITH;
  if (isDoesntStartsWithCondition(filter)) return ConditionFilterType.DOESNT_START_WITH;
  if (isEndsWithCondition(filter)) return ConditionFilterType.ENDS_WITH;
  if (isStartsWithCondition(filter)) return ConditionFilterType.STARTS_WITH;
  if (isBetweenCondition(filter)) return ConditionFilterType.BETWEEN;
  if (isNotBetweenCondition(filter)) return ConditionFilterType.IS_NOT_BETWEEN;
  if (isMembersCondition(filter)) return ConditionFilterType.IS;
  if (isMultipleCondition(filter)) return ConditionFilterType.MULTIPLE_CONDITION;

  return ConditionFilterType.NONE;
};

/**
 * Creates an attribute filter from the provided attribute and condition filter JAQL object
 *
 * @param attribute - Provided attribute
 * @param conditionFilterJaql - Condition filter JAQL object
 * @returns attribute filter
 */
export const createAttributeFilterFromConditionFilterJaql = (
  attribute: Attribute,
  conditionFilterJaql: ConditionFilterJaql,
): Filter => {
  const conditionType = getSelectedConditionOption(conditionFilterJaql);
  switch (conditionType) {
    case ConditionFilterType.BOTTOM:
      if (conditionFilterJaql.by && 'agg' in conditionFilterJaql.by) {
        return withComposeCode(filterFactory.bottomRanking)(
          attribute,
          createMeasureFromRankingFilterJaql(conditionFilterJaql.by),
          conditionFilterJaql[ConditionFilterType.BOTTOM] as number,
        );
      }
      break;
    case ConditionFilterType.EQUALS:
      return withComposeCode(filterFactory.equals)(
        attribute,
        conditionFilterJaql[ConditionFilterType.EQUALS],
      );
    case ConditionFilterType.GREATER_THAN:
      return withComposeCode(filterFactory.greaterThan)(
        attribute,
        conditionFilterJaql[ConditionFilterType.GREATER_THAN] as number,
      );
    case ConditionFilterType.GREATER_THAN_OR_EQUAL:
      return withComposeCode(filterFactory.greaterThanOrEqual)(
        attribute,
        conditionFilterJaql[ConditionFilterType.GREATER_THAN_OR_EQUAL] as number,
      );
    case ConditionFilterType.TOP:
      if (conditionFilterJaql.by) {
        return withComposeCode(filterFactory.topRanking)(
          attribute,
          createMeasureFromRankingFilterJaql(conditionFilterJaql.by),
          conditionFilterJaql[ConditionFilterType.TOP] as number,
        );
      }
      break;
    case ConditionFilterType.STARTS_WITH:
      return withComposeCode(filterFactory.startsWith)(
        attribute,
        conditionFilterJaql[ConditionFilterType.STARTS_WITH] as string,
      );
    case ConditionFilterType.DOESNT_START_WITH:
      return withComposeCode(filterFactory.doesntStartWith)(
        attribute,
        conditionFilterJaql[ConditionFilterType.DOESNT_START_WITH] as string,
      );
    case ConditionFilterType.ENDS_WITH:
      return withComposeCode(filterFactory.endsWith)(
        attribute,
        conditionFilterJaql[ConditionFilterType.ENDS_WITH] as string,
      );
    case ConditionFilterType.DOESNT_END_WITH:
      return withComposeCode(filterFactory.doesntEndWith)(
        attribute,
        conditionFilterJaql[ConditionFilterType.DOESNT_END_WITH] as string,
      );
    case ConditionFilterType.CONTAINS:
      return withComposeCode(filterFactory.contains)(
        attribute,
        conditionFilterJaql[ConditionFilterType.CONTAINS] as string,
      );
    case ConditionFilterType.DOESNT_CONTAIN:
      return withComposeCode(filterFactory.doesntContain)(
        attribute,
        conditionFilterJaql[ConditionFilterType.DOESNT_CONTAIN] as string,
      );
    case ConditionFilterType.LESS_THAN:
      return withComposeCode(filterFactory.lessThan)(
        attribute,
        conditionFilterJaql[ConditionFilterType.LESS_THAN] as number,
      );
    case ConditionFilterType.LESS_THAN_OR_EQUAL:
      return withComposeCode(filterFactory.lessThanOrEqual)(
        attribute,
        conditionFilterJaql[ConditionFilterType.LESS_THAN_OR_EQUAL] as number,
      );
    case ConditionFilterType.BETWEEN:
      return withComposeCode(filterFactory.between)(
        attribute,
        conditionFilterJaql.from,
        conditionFilterJaql.to,
      );
    case ConditionFilterType.IS_NOT_BETWEEN:
      return withComposeCode(filterFactory.exclude)(
        withComposeCode(filterFactory.between)(
          attribute,
          conditionFilterJaql.exclude?.from as number,
          conditionFilterJaql.exclude?.to as number,
        ),
      );
    case ConditionFilterType.MULTIPLE_CONDITION:
      if (conditionFilterJaql.and) {
        return withComposeCode(filterFactory.intersection)(
          conditionFilterJaql.and.map((c) =>
            createAttributeFilterFromConditionFilterJaql(attribute, c),
          ),
        );
      }
      if (conditionFilterJaql.or) {
        return withComposeCode(filterFactory.union)(
          conditionFilterJaql.or.map((c) =>
            createAttributeFilterFromConditionFilterJaql(attribute, c),
          ),
        );
      }
      break;
    case ConditionFilterType.AFTER:
    case ConditionFilterType.BEFORE:
    case ConditionFilterType.IS_EMPTY:
    case ConditionFilterType.IS_NOT_EMPTY:
      // TODO Handle these cases later; may need filterFactory function added first
      break;
  }

  throw 'Jaql contains unsupported condition filter: ' + JSON.stringify(conditionFilterJaql);
};

/**
 * Creates a measure filter from the provided measure and condition filter JAQL object
 *
 * @param measure - Provided measure
 * @param conditionFilterJaql - Condition filter JAQL object
 * @returns measure filter
 */
export const createMeasureFilterFromConditionFilterJaql = (
  measure: BaseMeasure,
  conditionFilterJaql: ConditionFilterJaql,
): Filter => {
  const conditionType = getSelectedConditionOption(conditionFilterJaql);
  switch (conditionType) {
    case ConditionFilterType.EQUALS:
      return withComposeCode(filterFactory.measureEquals)(
        measure,
        conditionFilterJaql[ConditionFilterType.EQUALS] as number,
      );
    case ConditionFilterType.GREATER_THAN:
      return withComposeCode(filterFactory.measureGreaterThan)(
        measure,
        conditionFilterJaql[ConditionFilterType.GREATER_THAN] as number,
      );
    case ConditionFilterType.GREATER_THAN_OR_EQUAL:
      return withComposeCode(filterFactory.measureGreaterThanOrEqual)(
        measure,
        conditionFilterJaql[ConditionFilterType.GREATER_THAN_OR_EQUAL] as number,
      );
    case ConditionFilterType.LESS_THAN:
      return withComposeCode(filterFactory.measureLessThan)(
        measure,
        conditionFilterJaql[ConditionFilterType.LESS_THAN] as number,
      );
    case ConditionFilterType.LESS_THAN_OR_EQUAL:
      return withComposeCode(filterFactory.measureLessThanOrEqual)(
        measure,
        conditionFilterJaql[ConditionFilterType.LESS_THAN_OR_EQUAL] as number,
      );
    case ConditionFilterType.BETWEEN:
      return withComposeCode(filterFactory.measureBetween)(
        measure,
        conditionFilterJaql.from,
        conditionFilterJaql.to,
      );
  }
  throw 'Jaql contains unsupported condition filter: ' + JSON.stringify(conditionFilterJaql);
};
