import { TFunction } from '@sisense/sdk-common';
import { Filter } from '@sisense/sdk-data';
import {
  filterToDefaultValues,
  filterToOption,
} from '../../../criteria-filter-tile/criteria-filter-operations.js';
import { CriteriaFilterType } from '../../../criteria-filter-tile';
import {
  isConditionalFilter,
  isExcludeMembersFilter,
  isNumericBetweenFilter,
} from '../../utils.js';
import { isNumericString } from '@/utils/is-numeric-string.js';
import { NumericCondition, NumericConditionType, NumericConditionFilterData } from './types.js';
import { createExcludeMembersFilter, getCriteriaFilterBuilder } from '../utils.js';

export function validateInputValue(value: string, t: TFunction) {
  if (!isNumericString(value)) {
    return t('filterEditor.validationErrors.invalidNumber');
  }

  return undefined;
}

export function getNumericFilterCondition(
  filter: Filter,
  initialCondition: NumericConditionType,
): NumericConditionType {
  if (!isConditionalFilter(filter) || isNumericBetweenFilter(filter)) {
    // returns first condition by default
    return initialCondition;
  }

  if (isExcludeMembersFilter(filter)) {
    return NumericCondition.EXCLUDE;
  }

  return filterToOption(filter as CriteriaFilterType) as NumericConditionType;
}

export function getNumericFilterValue(filter: Filter): string {
  if (!isConditionalFilter(filter)) {
    return '';
  }
  const value = filterToDefaultValues(filter as CriteriaFilterType)[0] ?? '';
  return `${value}`;
}

export function createConditionalFilter(baseFilter: Filter, data: NumericConditionFilterData) {
  const { attribute, config } = baseFilter;
  const { condition, value, selectedMembers, multiSelectEnabled } = data;

  if (condition === NumericCondition.EXCLUDE) {
    return createExcludeMembersFilter(attribute, selectedMembers, {
      ...config,
      enableMultiSelection: multiSelectEnabled,
    });
  }

  if (!isNumericString(value)) {
    return null;
  }

  const builder = getCriteriaFilterBuilder(condition);
  return builder.fn(attribute, parseFloat(value), config);
}
