import { DateRangeFilter, filterFactory } from '@sisense/sdk-data';

import { DateFilter } from '../date-filter';
import type { DateRangeFilterTileProps } from './date-range-filter-tile';
import { DateLimits } from './use-date-limits';

type EditableDateRangeFilterProps = DateRangeFilterTileProps & {
  filter: DateRangeFilter;
  dateLimits: Required<DateLimits>;
  isOldDateRangeFilterTile?: boolean;
  disabled?: boolean;
};

/**
 * Editable Date Range Filter component for filtering data by date range.
 */
export const EditableDateRangeFilter = (props: EditableDateRangeFilterProps) => {
  const {
    filter,
    attribute,
    onChange,
    parentFilters: rawParentFilters,
    dateLimits,
    isOldDateRangeFilterTile,
    disabled,
  } = props;
  const parentFilters =
    rawParentFilters && rawParentFilters?.filter((filter) => filter && filter !== null);

  const fromDate = filter.from || dateLimits?.minDate;
  const toDate = filter.to || dateLimits?.maxDate;

  return (
    <DateFilter
      onChange={(dateFilter) => {
        const newFilter = filterFactory.dateRange(
          attribute,
          dateFilter.filter.from,
          dateFilter.filter.to,
        );
        onChange(newFilter);
      }}
      value={{
        from: fromDate,
        to: toDate,
      }}
      limit={dateLimits}
      isDependent={parentFilters && parentFilters.length > 0}
      variant={isOldDateRangeFilterTile ? 'grey' : 'white'}
      disabled={disabled}
    />
  );
};
