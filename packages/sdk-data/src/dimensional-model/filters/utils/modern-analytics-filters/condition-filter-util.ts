import { ConditionJaql, ConditionTypes } from './types.js';
import * as conditionTypesUtil from './condition-types-util.js';

export const getSelectedConditionOption = (filter: ConditionJaql): ConditionTypes => {
  let selected;

  selected = conditionTypesUtil.isBottomCondition(filter);
  selected = conditionTypesUtil.isTopCondition(filter, selected);
  selected = conditionTypesUtil.isExcludeCondition(filter, selected);
  selected = conditionTypesUtil.isWithinCondition(filter, selected);
  selected = conditionTypesUtil.isGreaterThanCondition(filter, selected);
  selected = conditionTypesUtil.isGreaterThanOrEqualCondition(filter, selected);
  selected = conditionTypesUtil.isLessThanCondition(filter, selected);
  selected = conditionTypesUtil.isLessThanOrEqualCondition(filter, selected);
  selected = conditionTypesUtil.isEqualsCondition(filter, selected);
  selected = conditionTypesUtil.isNotEqualCondition(filter, selected);
  selected = conditionTypesUtil.isEmptyCondition(filter, selected);
  selected = conditionTypesUtil.isNotEmptyCondition(filter, selected);
  selected = conditionTypesUtil.isContainsCondition(filter, selected);
  selected = conditionTypesUtil.isDoesntContainCondition(filter, selected);
  selected = conditionTypesUtil.isDoesntEndWithCondition(filter, selected);
  selected = conditionTypesUtil.isDoesntStartsWithCondition(filter, selected);
  selected = conditionTypesUtil.isEndsWithCondition(filter, selected);
  selected = conditionTypesUtil.isStartsWithCondition(filter, selected);
  selected = conditionTypesUtil.isBetweenCondition(filter, selected);
  selected = conditionTypesUtil.isNotBetweenCondition(filter, selected);
  selected = conditionTypesUtil.isMembersCondition(filter, selected);
  selected = conditionTypesUtil.isMultipleCondition(filter, selected);

  return selected;
};
