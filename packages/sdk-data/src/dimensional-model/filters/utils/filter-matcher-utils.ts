import { FilterJaql } from '../../types.js';
import { getSelectedConditionOption } from './condition-filter-util.js';
import { isConditionFilter, isSpecificItemsFilter } from './filter-types-util.js';
import {
  ConditionFilterJaql,
  ConditionFilterType,
  FilterJaqlInternal,
  FilterMultipleConditionJaql,
  SpecificItemsFilterJaql,
} from './types.js';

type FilterMatcher = (value?: string | number) => boolean;
type Formatter = (value?: string | number) => string | undefined;

const defaultFormatter: Formatter = (value?: string | number) => {
  if (value === undefined) {
    return undefined;
  }
  return `${value}`;
};
const defaultDatetimeFormatter: Formatter = (value?: string | number) => {
  if (value === undefined) {
    return undefined;
  }
  return new Date(value).toISOString();
};
const defaultMatcher = () => false;

function createCombinedFilterMatcher(
  createFilterMatcherFn: (f: FilterJaqlInternal) => FilterMatcher,
  filterJaql: FilterJaqlInternal,
): FilterMatcher {
  const filter = filterJaql.filter as FilterMultipleConditionJaql;

  if ('or' in filter) {
    return (value?: string | number) => {
      return filter.or
        .map((filterItem: ConditionFilterJaql) =>
          createFilterMatcherFn({
            ...filterJaql,
            filter: filterItem,
          }),
        )
        .reduce((acc: boolean, filterMatcher: FilterMatcher) => {
          return acc || filterMatcher(value);
        }, false);
    };
  }

  if ('and' in filter) {
    return (value?: string | number) => {
      return filter.and
        .map((filterItem: ConditionFilterJaql) =>
          createFilterMatcherFn({
            ...filterJaql,
            filter: filterItem,
          }),
        )
        .reduce((acc: boolean, filterMatcher: FilterMatcher) => {
          return acc && filterMatcher(value);
        }, true);
    };
  }

  return createFilterMatcherFn(filterJaql);
}

function createMembersFilterMatcher(filterJaql: FilterJaqlInternal): FilterMatcher {
  const { datatype } = filterJaql;
  const filter = filterJaql.filter as SpecificItemsFilterJaql;
  const formatter = datatype === 'datetime' ? defaultDatetimeFormatter : defaultFormatter;

  return (value?: string | number) => {
    const formattedMembers = filter.members.map(formatter);
    const formattedValue = formatter(value);

    return formattedMembers.includes(formattedValue);
  };
}

function createExcludeMembersFilterMatcher(filterJaql: FilterJaqlInternal): FilterMatcher {
  const { datatype } = filterJaql;
  const filter = filterJaql.filter as ConditionFilterJaql;
  const formatter = datatype === 'datetime' ? defaultDatetimeFormatter : defaultFormatter;

  return (value?: string | number) => {
    const formattedMembers = filter.exclude?.members?.map(formatter) || [];
    const formattedValue = formatter(value);

    return !formattedMembers.includes(formattedValue);
  };
}

function createTextFilterMatcher(filterJaql: FilterJaqlInternal): FilterMatcher {
  const filter = filterJaql.filter as ConditionFilterJaql;
  const conditionFilterType = getSelectedConditionOption(filter);

  if (conditionFilterType === ConditionFilterType.STARTS_WITH) {
    return (value?: string | number) => {
      return new RegExp(`^${filter.startsWith}`, 'i').test(value as string);
    };
  }

  if (conditionFilterType === ConditionFilterType.ENDS_WITH) {
    return (value?: string | number) => {
      return new RegExp(`${filter.endsWith}$`, 'i').test(value as string);
    };
  }

  if (conditionFilterType === ConditionFilterType.CONTAINS) {
    return (value?: string | number) => {
      return new RegExp(filter.contains!, 'i').test(value as string);
    };
  }

  if (conditionFilterType === ConditionFilterType.EQUALS) {
    return (value?: string | number) => {
      return (
        (value as string).localeCompare(filter.equals as string, undefined, {
          sensitivity: 'base',
        }) === 0
      );
    };
  }

  if (conditionFilterType === ConditionFilterType.DOESNT_START_WITH) {
    return (value?: string | number) => {
      return !new RegExp(`^${filter.doesntStartWith}`, 'i').test(value as string);
    };
  }

  if (conditionFilterType === ConditionFilterType.DOESNT_END_WITH) {
    return (value?: string | number) => {
      return !new RegExp(`${filter.doesntEndWith}$`, 'i').test(value as string);
    };
  }

  if (conditionFilterType === ConditionFilterType.DOESNT_CONTAIN) {
    return (value?: string | number) => {
      return !new RegExp(filter.doesntContain!, 'i').test(value as string);
    };
  }

  if (conditionFilterType === ConditionFilterType.DOESNT_EQUAL) {
    return (value?: string | number) => {
      return (
        (value as string).localeCompare(filter.doesntEqual as string, undefined, {
          sensitivity: 'base',
        }) !== 0
      );
    };
  }

  return defaultMatcher;
}

function createNumericFilterMatcher(filterJaql: FilterJaqlInternal): FilterMatcher {
  const filter = filterJaql.filter as ConditionFilterJaql;
  const conditionFilterType = getSelectedConditionOption(filter);

  if (conditionFilterType === ConditionFilterType.EQUALS) {
    return (value?: string | number) => {
      return Number(filter.equals) === Number(value);
    };
  }

  if (conditionFilterType === ConditionFilterType.DOESNT_EQUAL) {
    return (value?: string | number) => {
      return Number(filter.doesntEqual) !== Number(value);
    };
  }

  if (conditionFilterType === ConditionFilterType.LESS_THAN) {
    return (value?: string | number) => {
      return Number(value) < Number(filter.toNotEqual);
    };
  }

  if (conditionFilterType === ConditionFilterType.GREATER_THAN) {
    return (value?: string | number) => {
      return Number(value) > Number(filter.fromNotEqual);
    };
  }

  if (conditionFilterType === ConditionFilterType.BETWEEN) {
    return (value?: string | number) => {
      return Number(filter.to) >= Number(value) && Number(value) >= Number(filter.from);
    };
  }

  if (conditionFilterType === ConditionFilterType.GREATER_THAN_OR_EQUAL) {
    return (value?: string | number) => {
      return Number(value) >= Number(filter.from);
    };
  }

  if (conditionFilterType === ConditionFilterType.LESS_THAN_OR_EQUAL) {
    return (value?: string | number) => {
      return Number(filter.to) >= Number(value);
    };
  }

  return defaultMatcher;
}

/** @internal */
export function createFilterMatcher(filterJaql: FilterJaql): FilterMatcher {
  const filterJaqlInternal = filterJaql as FilterJaqlInternal;
  const { datatype } = filterJaqlInternal;
  const filter = filterJaqlInternal.filter!;

  if (isSpecificItemsFilter(filter)) {
    return createMembersFilterMatcher(filterJaqlInternal);
  }

  if (
    isConditionFilter(filter) &&
    getSelectedConditionOption(filter) === ConditionFilterType.IS_NOT
  ) {
    return createExcludeMembersFilterMatcher(filterJaqlInternal);
  }

  // text filters
  if (datatype === 'text') {
    return createCombinedFilterMatcher(createTextFilterMatcher, filterJaqlInternal);
  }

  // // numeric filters
  if (datatype === 'numeric') {
    return createCombinedFilterMatcher(createNumericFilterMatcher, filterJaqlInternal);
  }

  return defaultMatcher;
}
