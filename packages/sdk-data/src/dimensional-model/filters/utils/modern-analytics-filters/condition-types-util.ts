/* eslint-disable max-lines */
import { ConditionTypes } from './types.js';
import type { ConditionJaql } from './types.js';

export const isTopCondition = (
  filter: ConditionJaql,
  selected = ConditionTypes.NONE,
): ConditionTypes => {
  if (filter.top !== undefined) {
    return ConditionTypes.TOP;
  }

  return selected;
};

export const isBottomCondition = (
  filter: ConditionJaql,
  selected = ConditionTypes.NONE,
): ConditionTypes => {
  if (filter.bottom !== undefined) {
    return ConditionTypes.BOTTOM;
  }

  return selected;
};

export const isExcludeCondition = (
  filter: ConditionJaql,
  selected = ConditionTypes.NONE,
): ConditionTypes => {
  if (filter.exclude?.members) {
    return ConditionTypes.IS_NOT;
  }

  return selected;
};

export const isMembersCondition = (
  filter: ConditionJaql,
  selected = ConditionTypes.NONE,
): ConditionTypes => {
  if (filter.members && filter.isCondition) {
    return ConditionTypes.IS;
  }

  return selected;
};

export const isWithinCondition = (
  filter: ConditionJaql,
  selected = ConditionTypes.NONE,
): ConditionTypes => {
  if (filter.last?.anchor !== undefined || filter.next?.anchor !== undefined) {
    return ConditionTypes.IS_WITHIN;
  }

  return selected;
};

export const isGreaterThanCondition = (
  filter: ConditionJaql,
  selected = ConditionTypes.NONE,
): ConditionTypes => {
  if (filter.fromNotEqual !== undefined) {
    return ConditionTypes.GREATER_THAN;
  }

  return selected;
};

export const isGreaterThanOrEqualCondition = (
  filter: ConditionJaql,
  selected = ConditionTypes.NONE,
): ConditionTypes => {
  if (filter.from !== undefined && !filter.isBetween) {
    return ConditionTypes.GREATER_THAN_OR_EQUAL;
  }

  return selected;
};

export const isLessThanCondition = (
  filter: ConditionJaql,
  selected = ConditionTypes.NONE,
): ConditionTypes => {
  if (filter.toNotEqual !== undefined) {
    return ConditionTypes.LESS_THAN;
  }

  return selected;
};

export const isLessThanOrEqualCondition = (
  filter: ConditionJaql,
  selected = ConditionTypes.NONE,
): ConditionTypes => {
  if (filter.to !== undefined && !filter.isBetween) {
    return ConditionTypes.LESS_THAN_OR_EQUAL;
  }

  return selected;
};

export const isEqualsCondition = (
  filter: ConditionJaql,
  selected = ConditionTypes.NONE,
): ConditionTypes => {
  if (filter.equals !== undefined) {
    return ConditionTypes.EQUALS;
  }

  return selected;
};

export const isNotEqualCondition = (
  filter: ConditionJaql,
  selected = ConditionTypes.NONE,
): ConditionTypes => {
  if (filter.doesntEqual !== undefined) {
    return ConditionTypes.DOESNT_EQUAL;
  }

  return selected;
};

export const isEmptyCondition = (
  filter: ConditionJaql,
  selected = ConditionTypes.NONE,
): ConditionTypes => {
  if (filter.equals === '' && filter.isEmpty) {
    return ConditionTypes.IS_EMPTY;
  }

  return selected;
};

export const isNotEmptyCondition = (
  filter: ConditionJaql,
  selected = ConditionTypes.NONE,
): ConditionTypes => {
  if (filter.doesntEqual === '' && filter.isEmpty) {
    return ConditionTypes.IS_NOT_EMPTY;
  }

  return selected;
};

export const isContainsCondition = (
  filter: ConditionJaql,
  selected = ConditionTypes.NONE,
): ConditionTypes => {
  if (filter.contains !== undefined) {
    return ConditionTypes.CONTAINS;
  }

  return selected;
};

export const isDoesntContainCondition = (
  filter: ConditionJaql,
  selected = ConditionTypes.NONE,
): ConditionTypes => {
  if (filter.doesntContain !== undefined) {
    return ConditionTypes.DOESNT_CONTAIN;
  }

  return selected;
};

export const isStartsWithCondition = (
  filter: ConditionJaql,
  selected = ConditionTypes.NONE,
): ConditionTypes => {
  if (filter.startsWith !== undefined) {
    return ConditionTypes.STARTS_WITH;
  }

  return selected;
};

export const isDoesntStartsWithCondition = (
  filter: ConditionJaql,
  selected = ConditionTypes.NONE,
): ConditionTypes => {
  if (filter.doesntStartWith !== undefined) {
    return ConditionTypes.DOESNT_START_WITH;
  }

  return selected;
};

export const isEndsWithCondition = (
  filter: ConditionJaql,
  selected = ConditionTypes.NONE,
): ConditionTypes => {
  if (filter.endsWith !== undefined) {
    return ConditionTypes.ENDS_WITH;
  }

  return selected;
};

export const isDoesntEndWithCondition = (
  filter: ConditionJaql,
  selected = ConditionTypes.NONE,
): ConditionTypes => {
  if (filter.doesntEndWith !== undefined) {
    return ConditionTypes.DOESNT_END_WITH;
  }

  return selected;
};

export const isBetweenCondition = (
  filter: ConditionJaql,
  selected = ConditionTypes.NONE,
): ConditionTypes => {
  if (filter.from !== undefined && filter.to !== undefined) {
    return ConditionTypes.BETWEEN;
  }

  return selected;
};

export const isNotBetweenCondition = (
  filter: ConditionJaql,
  selected = ConditionTypes.NONE,
): ConditionTypes => {
  const { exclude } = filter;

  if (exclude?.from !== undefined && exclude?.to !== undefined) {
    return ConditionTypes.IS_NOT_BETWEEN;
  }

  return selected;
};

export const isMultipleCondition = (
  filter: ConditionJaql,
  selected = ConditionTypes.NONE,
): ConditionTypes => {
  const { or, and } = filter;

  if (or || and) {
    return ConditionTypes.MULTIPLE_CONDITION;
  }

  return selected;
};
