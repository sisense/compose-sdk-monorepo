/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/ban-types */
import { filters, NumericOperators } from '@sisense/sdk-data';

/**
 * Collection of numeric filter options for the {@link CriteriaFilterMenu},
 * to be provided to subcomponents as the `filterType` prop.
 *
 * @internal
 */
export const NumericFilterOption = {
  EQUALS: NumericOperators.Equals,
  NOT_EQUALS: NumericOperators.DoesntEqual,
  LESS_THAN: NumericOperators.ToNotEqual,
  LESS_THAN_OR_EQUAL: NumericOperators.To,
  GREATER_THAN: NumericOperators.FromNotEqual,
  GREATER_THAN_OR_EQUAL: NumericOperators.From,
};

export type NumericFilterOptionType = keyof typeof NumericFilterOption;

/**
 * Object containing related information for a numeric filter option,
 * including the function to be used for filtering, the number of inputs,
 * and the messages to be displayed in the UI as field labels.
 * Ranked indicated whether the filter is ranked (e.g. Top 10).
 *
 * @internal
 */
export type NumericFilterInfo = {
  fn: Function;
  inputCount: number;
  messages: string[];
  ranked: boolean;
};

/**
 * Map of {@link NumericFilterOption} to {@link NumericFilterInfo}
 * for each type of numeric filter available.
 *
 * TODO: add internationalization for messages
 *
 * @internal
 */
export const NUMERIC_FILTER_MAP: { [key: string]: NumericFilterInfo } = {
  [NumericFilterOption.EQUALS]: {
    fn: filters.equals,
    inputCount: 1,
    messages: ['='],
    ranked: false,
  },
  [NumericFilterOption.NOT_EQUALS]: {
    fn: filters.doesntEqual,
    inputCount: 1,
    messages: ['≠'],
    ranked: false,
  },
  [NumericFilterOption.LESS_THAN]: {
    fn: filters.lessThan,
    inputCount: 1,
    messages: ['<'],
    ranked: false,
  },
  [NumericFilterOption.LESS_THAN_OR_EQUAL]: {
    fn: filters.lessThanOrEqual,
    inputCount: 1,
    messages: ['≤'],
    ranked: false,
  },
  [NumericFilterOption.GREATER_THAN]: {
    fn: filters.greaterThan,
    inputCount: 1,
    messages: ['>'],
    ranked: false,
  },
  [NumericFilterOption.GREATER_THAN_OR_EQUAL]: {
    fn: filters.greaterThanOrEqual,
    inputCount: 1,
    messages: ['≥'],
    ranked: false,
  },
};

export const numOperatorsToNumOption = (operatorA?: string, operatorB?: string) => {
  const opStr = `${operatorA ?? ''}${operatorB ?? ''}`;
  const key = Object.keys(NumericFilterOption).find(
    (option) => NumericFilterOption[option] == opStr,
  ) as keyof typeof NumericFilterOption;
  return NumericFilterOption[key] as NumericFilterOptionType;
};
