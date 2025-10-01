import {
  Attribute,
  ExcludeFilter,
  Filter,
  filterFactory,
  FilterTypes,
  Measure,
  MetadataTypes,
  NumericFilter,
  NumericOperators,
  RankingFilter,
  RankingOperators,
  TextFilter,
  TextOperators,
} from '@ethings-os/sdk-data';
import { TranslatableError } from '@/translation/translatable-error';
import { TFunction } from '@ethings-os/sdk-common';

/**
 * Collection of filter options for the {@link CriteriaFilterMenu},
 * to be provided to subcomponents as the `filterType` prop.
 *
 * @internal
 */
export const FilterOption = {
  // exclude - special case, contains numeric filter as attribute
  NOT_BETWEEN: `${FilterTypes.exclude}${NumericOperators.From}${NumericOperators.To}`,
  // ranking
  TOP: `${FilterTypes.ranking}${RankingOperators.Top}`,
  BOTTOM: `${FilterTypes.ranking}${RankingOperators.Bottom}`,
  // numeric
  BETWEEN: `${FilterTypes.numeric}${NumericOperators.From}${NumericOperators.To}`,
  EQUALS_NUMERIC: `${FilterTypes.numeric}${NumericOperators.Equals}`,
  NOT_EQUALS_NUMERIC: `${FilterTypes.numeric}${NumericOperators.DoesntEqual}`,
  LESS_THAN: `${FilterTypes.numeric}${NumericOperators.ToNotEqual}`,
  LESS_THAN_OR_EQUAL: `${FilterTypes.numeric}${NumericOperators.To}`,
  GREATER_THAN: `${FilterTypes.numeric}${NumericOperators.FromNotEqual}`,
  GREATER_THAN_OR_EQUAL: `${FilterTypes.numeric}${NumericOperators.From}`,
  // text
  EQUALS_TEXT: `${FilterTypes.text}${TextOperators.Equals}`,
  NOT_EQUALS_TEXT: `${FilterTypes.text}${TextOperators.DoesntEqual}`,
  CONTAINS: `${FilterTypes.text}${TextOperators.Contains}`,
  NOT_CONTAIN: `${FilterTypes.text}${TextOperators.DoesntContain}`,
  STARTS_WITH: `${FilterTypes.text}${TextOperators.StartsWith}`,
  NOT_STARTS_WITH: `${FilterTypes.text}${TextOperators.DoesntStartWith}`,
  ENDS_WITH: `${FilterTypes.text}${TextOperators.EndsWith}`,
  NOT_ENDS_WITH: `${FilterTypes.text}${TextOperators.DoesntEndWith}`,
  LIKE: `${FilterTypes.text}${TextOperators.Like}`,
} as const;

export type FilterOptionType = keyof typeof FilterOption;

/**
 * Object containing related information for a filter option,
 * including the function to be used for filtering, the number of inputs,
 * and the symbols to be displayed in the UI as field labels.
 * Ranked indicates whether the filter is ranked (e.g. Top 10).
 *
 * @internal
 */
export type FilterInfo = {
  fn: (...args: any[]) => Filter;
  inputCount: number;
  symbols: string[];
  message: string;
  ranked: boolean;
  type: string;
};

/**
 * Map of {@link FilterOption} to {@link FilterInfo}
 * for each type of filter available.
 *
 * @internal
 */
export const CRITERIA_FILTER_MAP: { [key: string]: FilterInfo } = {
  [FilterOption.EQUALS_NUMERIC]: {
    fn: filterFactory.equals,
    inputCount: 1,
    symbols: ['='],
    message: 'criteriaFilter.equals',
    ranked: false,
    type: FilterTypes.numeric,
  },
  [FilterOption.NOT_EQUALS_NUMERIC]: {
    fn: filterFactory.doesntEqual,
    inputCount: 1,
    symbols: ['≠'],
    message: 'criteriaFilter.notEquals',
    ranked: false,
    type: FilterTypes.numeric,
  },
  [FilterOption.LESS_THAN]: {
    fn: filterFactory.lessThan,
    inputCount: 1,
    symbols: ['<'],
    message: 'criteriaFilter.lessThan',
    ranked: false,
    type: FilterTypes.numeric,
  },
  [FilterOption.LESS_THAN_OR_EQUAL]: {
    fn: filterFactory.lessThanOrEqual,
    inputCount: 1,
    symbols: ['≤'],
    message: 'criteriaFilter.lessThanOrEqual',
    ranked: false,
    type: FilterTypes.numeric,
  },
  [FilterOption.GREATER_THAN]: {
    fn: filterFactory.greaterThan,
    inputCount: 1,
    symbols: ['>'],
    message: 'criteriaFilter.greaterThan',
    ranked: false,
    type: FilterTypes.numeric,
  },
  [FilterOption.GREATER_THAN_OR_EQUAL]: {
    fn: filterFactory.greaterThanOrEqual,
    inputCount: 1,
    symbols: ['≥'],
    message: 'criteriaFilter.greaterThanOrEqual',
    ranked: false,
    type: FilterTypes.numeric,
  },
  [FilterOption.BETWEEN]: {
    fn: filterFactory.between,
    inputCount: 2,
    symbols: ['≥', '≤'],
    message: 'criteriaFilter.between',
    ranked: false,
    type: FilterTypes.numeric,
  },
  [FilterOption.NOT_BETWEEN]: {
    fn: (attribute: Attribute, valueA: number, valueB: number): Filter => {
      return filterFactory.exclude(filterFactory.between(attribute, valueA, valueB), undefined);
    },
    inputCount: 2,
    symbols: ['≤', '≥'],
    message: 'criteriaFilter.notBetween',
    ranked: false,
    type: FilterTypes.exclude,
  },
  [FilterOption.TOP]: {
    fn: filterFactory.topRanking,
    inputCount: 2,
    symbols: ['Top', 'by'],
    message: 'criteriaFilter.top',
    ranked: true,
    type: FilterTypes.ranking,
  },
  [FilterOption.BOTTOM]: {
    fn: filterFactory.bottomRanking,
    inputCount: 2,
    symbols: ['Last', 'by'],
    message: 'criteriaFilter.bottom',
    ranked: true,
    type: FilterTypes.ranking,
  },
  [FilterOption.EQUALS_TEXT]: {
    fn: filterFactory.equals,
    inputCount: 1,
    symbols: [],
    message: 'criteriaFilter.equals',
    ranked: false,
    type: FilterTypes.text,
  },
  [FilterOption.NOT_EQUALS_TEXT]: {
    fn: filterFactory.doesntEqual,
    inputCount: 1,
    symbols: [],
    message: 'criteriaFilter.notEquals',
    ranked: false,
    type: FilterTypes.text,
  },
  [FilterOption.CONTAINS]: {
    fn: filterFactory.contains,
    inputCount: 1,
    symbols: [],
    message: 'criteriaFilter.contains',
    ranked: false,
    type: FilterTypes.text,
  },
  [FilterOption.NOT_CONTAIN]: {
    fn: filterFactory.doesntContain,
    inputCount: 1,
    symbols: [],
    message: 'criteriaFilter.notContains',
    ranked: false,
    type: FilterTypes.text,
  },
  [FilterOption.STARTS_WITH]: {
    fn: filterFactory.startsWith,
    inputCount: 1,
    symbols: [],
    message: 'criteriaFilter.startsWith',
    ranked: false,
    type: FilterTypes.text,
  },
  [FilterOption.NOT_STARTS_WITH]: {
    fn: filterFactory.doesntStartWith,
    inputCount: 1,
    symbols: [],
    message: 'criteriaFilter.notStartsWith',
    ranked: false,
    type: FilterTypes.text,
  },
  [FilterOption.ENDS_WITH]: {
    fn: filterFactory.endsWith,
    inputCount: 1,
    symbols: [],
    message: 'criteriaFilter.endsWith',
    ranked: false,
    type: FilterTypes.text,
  },
  [FilterOption.NOT_ENDS_WITH]: {
    fn: filterFactory.doesntEndWith,
    inputCount: 1,
    symbols: [],
    message: 'criteriaFilter.notEndsWith',
    ranked: false,
    type: FilterTypes.text,
  },
  [FilterOption.LIKE]: {
    fn: filterFactory.like,
    inputCount: 1,
    symbols: [],
    message: 'criteriaFilter.like',
    ranked: false,
    type: FilterTypes.text,
  },
};

/**
 * Given an input filter, use the filterType and operators to determine
 * the corresponding {@link FilterOption} and {@link FilterInfo}.
 *
 * @internal
 */
export const filterToOption = (filter: Filter): FilterOptionType => {
  let operatorA: string | undefined = '';
  let operatorB: string | undefined = '';
  switch (filter.filterType) {
    case FilterTypes.exclude:
      operatorA = ((filter as ExcludeFilter).filter as NumericFilter).operatorA;
      operatorB = ((filter as ExcludeFilter).filter as NumericFilter).operatorB;
      break;
    case FilterTypes.ranking:
      operatorA = (filter as RankingFilter).operator;
      break;
    case FilterTypes.numeric:
      operatorA = (filter as NumericFilter).operatorA;
      operatorB = (filter as NumericFilter).operatorB;
      break;
    case FilterTypes.text:
      operatorA = (filter as TextFilter).operatorA;
      operatorA = (filter as TextFilter).operatorA;
      break;
    default:
      throw new UnsupportedFilterError(filter);
  }
  const opStr = `${filter.filterType}${operatorA ?? ''}${operatorB ?? ''}`;
  const key = Object.keys(FilterOption).find(
    (option) => FilterOption[option] == opStr,
  ) as keyof typeof FilterOption;
  if (FilterOption[key] === undefined) throw new UnsupportedFilterError(filter);
  return FilterOption[key] as FilterOptionType;
};

export type CriteriaFilterValueType = string | number | Measure;
export const filterToDefaultValues = (filter: Filter): CriteriaFilterValueType[] => {
  const values: CriteriaFilterValueType[] = [];
  let valA: CriteriaFilterValueType | undefined = undefined;
  let valB: CriteriaFilterValueType | undefined = undefined;
  switch (filter.filterType) {
    case FilterTypes.exclude:
      valA = ((filter as ExcludeFilter).filter as NumericFilter).valueA;
      valB = ((filter as ExcludeFilter).filter as NumericFilter).valueB;
      break;
    case FilterTypes.ranking:
      valA = (filter as RankingFilter).count;
      valB = (filter as RankingFilter).measure;
      break;
    case FilterTypes.numeric:
      valA = (filter as NumericFilter).valueA;
      valB = (filter as NumericFilter).valueB;
      break;
    case FilterTypes.text:
      valA = (filter as TextFilter).valueA;
      valB = (filter as TextFilter).valueB;
      break;
    default:
  }
  if (valA !== undefined) values.push(valA);
  if (valB !== undefined) values.push(valB);
  return values;
};

export const valuesToDisplayValues = (values: CriteriaFilterValueType[]): (string | number)[] => {
  return values.map((value) => {
    if (MetadataTypes.isMeasure(value)) return (value as Measure).name;
    return value as string | number;
  });
};

export const translatedMsgNoVal = (message: string, t: TFunction) => {
  return t(message, { val: '---' }).replace('---', '');
};

export const filterTypeToInputType = (filterType: string): string => {
  switch (filterType) {
    case FilterTypes.exclude:
    case FilterTypes.ranking:
    case FilterTypes.numeric:
      return 'number';
    case FilterTypes.text:
    default:
      return 'text';
  }
};

class UnsupportedFilterError extends TranslatableError {
  constructor(filter: Filter) {
    super('errors.unsupportedFilter', { filter: JSON.stringify(filter) });
  }
}
