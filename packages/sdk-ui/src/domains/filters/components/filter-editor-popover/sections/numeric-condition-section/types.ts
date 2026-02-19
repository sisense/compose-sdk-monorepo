import { FilterOption } from '../../../criteria-filter-tile/criteria-filter-operations.js';

export const NumericCondition = {
  EXCLUDE: 'exclude',
  EQUALS: FilterOption.EQUALS_NUMERIC,
  NOT_EQUALS: FilterOption.NOT_EQUALS_NUMERIC,
  LESS_THAN: FilterOption.LESS_THAN,
  LESS_THAN_OR_EQUAL: FilterOption.LESS_THAN_OR_EQUAL,
  GREATER_THAN: FilterOption.GREATER_THAN,
  GREATER_THAN_OR_EQUAL: FilterOption.GREATER_THAN_OR_EQUAL,
} as const;

export type NumericConditionType = (typeof NumericCondition)[keyof typeof NumericCondition];

export type NumericConditionFilterData = {
  condition: NumericConditionType;
  value: string;
  selectedMembers: string[];
  multiSelectEnabled: boolean;
};
