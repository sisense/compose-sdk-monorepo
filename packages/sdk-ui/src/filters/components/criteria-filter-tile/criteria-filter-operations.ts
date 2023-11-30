/* eslint-disable max-lines */
/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/ban-types */
import { filters, NumericOperators, TextOperators } from '@sisense/sdk-data';

/**
 * Collection of filter options for the {@link CriteriaFilterMenu},
 * to be provided to subcomponents as the `filterType` prop.
 *
 * @internal
 */
export const FilterOption = {
  // numeric
  BETWEEN: `${NumericOperators.From}${NumericOperators.To}`,
  EQUALS: NumericOperators.Equals,
  NOT_EQUALS: NumericOperators.DoesntEqual,
  LESS_THAN: NumericOperators.ToNotEqual,
  LESS_THAN_OR_EQUAL: NumericOperators.To,
  GREATER_THAN: NumericOperators.FromNotEqual,
  GREATER_THAN_OR_EQUAL: NumericOperators.From,
  // text
  IS: TextOperators.Equals,
  IS_NOT: TextOperators.DoesntEqual,
  CONTAINS: TextOperators.Contains,
  NOT_CONTAIN: TextOperators.DoesntContain,
  STARTS_WITH: TextOperators.StartsWith,
  NOT_STARTS_WITH: TextOperators.DoesntStartWith,
  ENDS_WITH: TextOperators.EndsWith,
  NOT_ENDS_WITH: TextOperators.DoesntEndWith,
  LIKE: TextOperators.Like,
};

export type FilterOptionType = keyof typeof FilterOption;
export type FilterVariant = 'vertical' | 'horizontal';
export type FilterInputType = 'text' | 'number';

/**
 * Object containing related information for a filter option,
 * including the function to be used for filtering, the number of inputs,
 * and the symbols to be displayed in the UI as field labels.
 * Ranked indicates whether the filter is ranked (e.g. Top 10).
 *
 * @internal
 */
export type FilterInfo = {
  fn: Function;
  inputCount: number;
  symbols: string[];
  message: string;
  ranked: boolean;
  type: FilterInputType;
};

/**
 * Map of {@link FilterOption} to {@link FilterInfo}
 * for each type of filter available.
 *
 * @internal
 */
export const CRITERIA_FILTER_MAP: { [key: string]: FilterInfo } = {
  [FilterOption.EQUALS]: {
    fn: filters.equals,
    inputCount: 1,
    symbols: ['='],
    message: 'criteriaFilter.equals',
    ranked: false,
    type: 'number',
  },
  [FilterOption.NOT_EQUALS]: {
    fn: filters.doesntEqual,
    inputCount: 1,
    symbols: ['≠'],
    message: 'criteriaFilter.notEquals',
    ranked: false,
    type: 'number',
  },
  [FilterOption.LESS_THAN]: {
    fn: filters.lessThan,
    inputCount: 1,
    symbols: ['<'],
    message: 'criteriaFilter.lessThan',
    ranked: false,
    type: 'number',
  },
  [FilterOption.LESS_THAN_OR_EQUAL]: {
    fn: filters.lessThanOrEqual,
    inputCount: 1,
    symbols: ['≤'],
    message: 'criteriaFilter.lessThanOrEqual',
    ranked: false,
    type: 'number',
  },
  [FilterOption.GREATER_THAN]: {
    fn: filters.greaterThan,
    inputCount: 1,
    symbols: ['>'],
    message: 'criteriaFilter.greaterThan',
    ranked: false,
    type: 'number',
  },
  [FilterOption.GREATER_THAN_OR_EQUAL]: {
    fn: filters.greaterThanOrEqual,
    inputCount: 1,
    symbols: ['≥'],
    message: 'criteriaFilter.greaterThanOrEqual',
    ranked: false,
    type: 'number',
  },
  [FilterOption.BETWEEN]: {
    fn: filters.between,
    inputCount: 2,
    symbols: ['≥', '≤'],
    message: 'criteriaFilter.between',
    ranked: false,
    type: 'number',
  },
  [FilterOption.IS]: {
    fn: filters.equals,
    inputCount: 1,
    symbols: [],
    message: 'criteriaFilter.is',
    ranked: false,
    type: 'text',
  },
  [FilterOption.IS_NOT]: {
    fn: filters.doesntEqual,
    inputCount: 1,
    symbols: [],
    message: 'criteriaFilter.isNot',
    ranked: false,
    type: 'text',
  },
  [FilterOption.CONTAINS]: {
    fn: filters.contains,
    inputCount: 1,
    symbols: [],
    message: 'criteriaFilter.contains',
    ranked: false,
    type: 'text',
  },
  [FilterOption.NOT_CONTAIN]: {
    fn: filters.doesntContain,
    inputCount: 1,
    symbols: [],
    message: 'criteriaFilter.notContains',
    ranked: false,
    type: 'text',
  },
  [FilterOption.STARTS_WITH]: {
    fn: filters.startsWith,
    inputCount: 1,
    symbols: [],
    message: 'criteriaFilter.startsWith',
    ranked: false,
    type: 'text',
  },
  [FilterOption.NOT_STARTS_WITH]: {
    fn: filters.doesntStartWith,
    inputCount: 1,
    symbols: [],
    message: 'criteriaFilter.notStartsWith',
    ranked: false,
    type: 'text',
  },
  [FilterOption.ENDS_WITH]: {
    fn: filters.endsWith,
    inputCount: 1,
    symbols: [],
    message: 'criteriaFilter.endsWith',
    ranked: false,
    type: 'text',
  },
  [FilterOption.NOT_ENDS_WITH]: {
    fn: filters.doesntEndWith,
    inputCount: 1,
    symbols: [],
    message: 'criteriaFilter.notEndsWith',
    ranked: false,
    type: 'text',
  },
  [FilterOption.LIKE]: {
    fn: filters.like,
    inputCount: 1,
    symbols: [],
    message: 'criteriaFilter.like',
    ranked: false,
    type: 'text',
  },
};

/**
 * Determines whether the arrangement of the filter menu is vertical.
 *
 * @param arrangement - Arrangement of the filter menu
 * @returns True if the arrangement is vertical, false otherwise
 * @internal
 */
export const isVertical = (arrangement: FilterVariant) => arrangement === 'vertical';

export const operatorsToOption = (operatorA?: string, operatorB?: string) => {
  const opStr = `${operatorA ?? ''}${operatorB ?? ''}`;
  const key = Object.keys(FilterOption).find(
    (option) => FilterOption[option] == opStr,
  ) as keyof typeof FilterOption;
  return FilterOption[key] as FilterOptionType;
};

export const translatedMsgNoVal = (message: string, t: Function) => {
  return t(message, { val: '---' }).replace('---', '');
};
