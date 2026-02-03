import { TFunction } from '@sisense/sdk-common';
import { Filter } from '@sisense/sdk-data';

import { isNumericString } from '@/shared/utils/is-numeric-string.js';

import {
  filterToDefaultValues,
  filterToOption,
} from '../../../criteria-filter-tile/criteria-filter-operations.js';
import {
  isConditionalFilter,
  isExcludeMembersFilter,
  isNumericBetweenFilter,
  isSupportedByFilterEditor,
} from '../../utils.js';
import {
  createExcludeMembersFilter,
  getConfigWithUpdatedDeactivated,
  getCriteriaFilterBuilder,
  getMembersWithoutDeactivated,
} from '../utils.js';
import { NumericCondition, NumericConditionFilterData, NumericConditionType } from './types.js';

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
  if (
    !isConditionalFilter(filter) ||
    isNumericBetweenFilter(filter) ||
    !isSupportedByFilterEditor(filter)
  ) {
    // returns first condition by default
    return initialCondition;
  }

  if (isExcludeMembersFilter(filter)) {
    return NumericCondition.EXCLUDE;
  }

  return filterToOption(filter) as NumericConditionType;
}

export function getNumericFilterValue(filter: Filter): string {
  if (!isConditionalFilter(filter)) {
    return '';
  }
  const value = filterToDefaultValues(filter)[0] ?? '';
  return `${value}`;
}

export function createConditionalFilter(baseFilter: Filter, data: NumericConditionFilterData) {
  const { attribute } = baseFilter;
  const { condition, value, selectedMembers, multiSelectEnabled } = data;
  if (condition === NumericCondition.EXCLUDE) {
    const config = getConfigWithUpdatedDeactivated(baseFilter, selectedMembers);
    const members = getMembersWithoutDeactivated(baseFilter, selectedMembers);

    return createExcludeMembersFilter(attribute, members, {
      ...config,
      enableMultiSelection: multiSelectEnabled,
    });
  }

  if (!isNumericString(value)) {
    return null;
  }

  const builder = getCriteriaFilterBuilder(condition);
  return builder.fn(attribute, parseFloat(value), baseFilter.config);
}
