import { DateFilter } from '..';
import { LevelAttribute, DataSource, Filter, DateRangeFilter, filters } from '@sisense/sdk-data';
import { useDateLimits } from './use-date-limits';
import { asSisenseComponent } from '../../../../decorators/as-sisense-component';

export interface DateRangeFilterTileProps {
  /**
   * Title of the filter tile
   */
  title: string;
  /**
   * Date level attribute the filter is based on
   */
  attribute: LevelAttribute;
  /**
   * Data source the query is run against - e.g. `Sample ECommerce`
   *
   * If not specified, the query will use the `defaultDataSource` specified in the parent {@link SisenseContextProvider} component.
   */
  dataSource?: DataSource;
  /**
   * Date range filter.
   */
  filter: Filter;
  /**
   * Earliest valid date in date range select. If not specified a query will run.
   */
  earliestDate?: string;
  /**
   * Last valid date in date range select. If not specified a query will run.
   */
  lastDate?: string;
  /**
   * Callback function that is called when the date range filter object should be updated.
   *
   * @param filter - Date range filter
   */
  onChange: (filter: Filter) => void;
}

/**
 * Date Range Filter Tile component for filtering data by date range.
 *
 * @example
 * React example of configuring the date min max values and handling onChange event.
 * ```tsx
 * const [dateRangeFilter, setDateRangeFilter] = useState<Filter>(
 *   filters.dateRange(DM.Commerce.Date.Years),
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
 */
export const DateRangeFilterTile = asSisenseComponent({ componentName: 'DateRangeFilterTile' })(
  (props: DateRangeFilterTileProps) => {
    const dateRangeFilter = props.filter as DateRangeFilter;
    const { attribute, dataSource, onChange, earliestDate, lastDate } = props;
    const dateLimits = useDateLimits(
      {
        minDate: earliestDate,
        maxDate: lastDate,
      },
      attribute,
      dataSource,
    );

    if (!dateLimits) {
      return null;
    }

    const fromDate = dateRangeFilter.from || dateLimits?.minDate;
    const toDate = dateRangeFilter.to || dateLimits?.maxDate;

    return (
      <DateFilter
        onChange={(dateFilter) => {
          const newFilter = filters.dateRange(
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
      />
    );
  },
);
