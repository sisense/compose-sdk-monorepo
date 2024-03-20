import { DateFilter } from '..';
import {
  LevelAttribute,
  DataSource,
  Filter,
  DateRangeFilter,
  filterFactory,
} from '@sisense/sdk-data';
import { useDateLimits } from './use-date-limits';
import { asSisenseComponent } from '../../../../decorators/component-decorators/as-sisense-component';

export interface DateRangeFilterTileProps {
  /**
   * Filter tile title
   */
  title: string;
  /**
   * Date level attribute the filter is based on
   */
  attribute: LevelAttribute;
  /**
   * Data source the query is run against - e.g. `Sample ECommerce`
   *
   * If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.
   */
  dataSource?: DataSource;
  /**
   * Date range filter.
   */
  filter: Filter;
  /**
   * Earliest allowed date for selection.
   *
   * If not specified, the earliest date of the target date-level attribute will be used.
   */
  earliestDate?: string;
  /**
   * Latest allowed date for selection.
   *
   * If not specified, the latest date of the target date-level attribute will be used.
   */
  lastDate?: string;
  /**
   * Callback function that is called when the date range filter object should be updated.
   *
   * @param filter - Date range filter
   */
  onChange: (filter: Filter) => void;
  /**
   * List of filters this filter is dependent on.
   */
  parentFilters?: Filter[];
}

/**
 * Date Range Filter Tile component for filtering data by date range.
 *
 * @example
 * React example of configuring the date min max values and handling onChange event.
 * ```tsx
 * const [dateRangeFilter, setDateRangeFilter] = useState<Filter>(
 *   filterFactory.dateRange(DM.Commerce.Date.Years),
 * );
 *
 * return (
 *   <DateRangeFilterTile
 *     title="Date Range"
 *     attribute={DM.Commerce.Date.Years}
 *     filter={dateRangeFilter}
 *     onChange={(filter: Filter) => {
 *       setDateRangeFilter(filter);
 *     }}
 *   />
 * );
 * ```
 *
 * <img src="media://date-filter-example-1.png" width="800px" />
 * @param props - Date Range Filter Tile Props
 * @returns Date Range Filter Tile component
 * @group Filter Tiles
 */
export const DateRangeFilterTile = asSisenseComponent({ componentName: 'DateRangeFilterTile' })(
  (props: DateRangeFilterTileProps) => {
    const dateRangeFilter = props.filter as DateRangeFilter;
    const {
      attribute,
      dataSource,
      onChange,
      earliestDate,
      lastDate,
      parentFilters: rawParentFilters,
    } = props;
    const parentFilters =
      rawParentFilters && rawParentFilters?.filter((filter) => filter && filter !== null);
    const dateLimits = useDateLimits(
      {
        minDate: earliestDate,
        maxDate: lastDate,
      },
      attribute,
      dataSource,
      parentFilters,
    );

    if (!dateLimits) {
      return null;
    }

    const fromDate = dateRangeFilter.from || dateLimits?.minDate;
    const toDate = dateRangeFilter.to || dateLimits?.maxDate;

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
      />
    );
  },
);
