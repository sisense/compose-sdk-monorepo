import {
  LevelAttribute,
  DataSource,
  Filter,
  DateRangeFilter,
  FilterTypes,
} from '@sisense/sdk-data';
import cloneDeep from 'lodash/cloneDeep';
import { useState } from 'react';
import { asSisenseComponent } from '../../../../decorators/component-decorators/as-sisense-component';
import { FilterTile } from '../../filter-tile';
import { EditableDateRangeFilter } from './editable-date-range-filter';
import { DateRangeFilterDisplay } from './date-range-filter-display';
import { TranslatableError } from '@/translation/translatable-error';
import { AnyObject } from '@/utils/utility-types';
import { useDateLimits } from './use-date-limits';

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

  /**
   * Whether to display the filter as a tiled version.
   * @default false
   * @internal
   */
  tiled?: boolean;
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
    const {
      filter,
      onChange,
      title,
      earliestDate,
      lastDate,
      attribute,
      dataSource,
      parentFilters,
      tiled = false,
    } = props;
    if (!isDateRangeFilter(filter)) {
      throw new TranslatableError('errors.invalidFilterType');
    }
    const [lastFilter, setLastFilter] = useState(filter);
    let disabled = lastFilter.disabled;

    const onUpdateValues = (newFilter: DateRangeFilter) => {
      if (newFilter) {
        setLastFilter(newFilter);
      }
      onChange(newFilter);
    };

    const dateLimits = useDateLimits(
      {
        minDate: earliestDate,
        maxDate: lastDate,
      },
      attribute,
      dataSource,
      parentFilters,
    );

    if (!tiled) {
      if (!dateLimits) {
        return null;
      }
      return (
        <EditableDateRangeFilter
          {...props}
          filter={filter}
          dateLimits={dateLimits}
          isOldDateRangeFilterTile
        />
      );
    }

    return (
      <FilterTile
        title={title}
        renderContent={(collapsed) => {
          return collapsed || !dateLimits ? (
            <DateRangeFilterDisplay filter={filter} />
          ) : (
            <div className="csdk-mt-2 csdk-ml-2 csdk-mb-1">
              <EditableDateRangeFilter
                {...props}
                filter={filter}
                dateLimits={dateLimits}
                disabled={disabled}
              />
            </div>
          );
        }}
        onToggleDisabled={() => {
          disabled = !disabled;
          const newFilter = cloneDeep(lastFilter);
          newFilter.disabled = disabled;
          onUpdateValues(newFilter);
        }}
        disabled={disabled}
      />
    );
  },
);

function isDateRangeFilter(filter: Filter & AnyObject): filter is DateRangeFilter {
  return 'filterType' in filter && filter.filterType === FilterTypes.date;
}
