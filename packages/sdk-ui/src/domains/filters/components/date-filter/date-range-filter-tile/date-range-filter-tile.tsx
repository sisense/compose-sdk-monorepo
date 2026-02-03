import { DataSource, Filter, isDateRangeFilter, LevelAttribute } from '@sisense/sdk-data';

import { useSynchronizedFilter } from '@/domains/filters/hooks/use-synchronized-filter';
import { TranslatableError } from '@/infra/translation/translatable-error';
import { cloneFilterAndToggleDisabled } from '@/shared/utils/filters';

import { asSisenseComponent } from '../../../../../infra/decorators/component-decorators/as-sisense-component';
import { FilterTileContainer, FilterTileDesignOptions } from '../../filter-tile-container';
import { DateRangeFilterDisplay } from './date-range-filter-display';
import { EditableDateRangeFilter } from './editable-date-range-filter';
import { useDateLimits } from './use-date-limits';

/**
 * Props of the {@link DateRangeFilterTile} component.
 */
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
  /** Filter delete callback */
  onDelete?: () => void;
  /** Filter edit callback */
  onEdit?: () => void;
  /**
   * List of filters this filter is dependent on.
   */
  parentFilters?: Filter[];

  /**
   * Whether to display the filter as a tiled version.
   *
   * @default false
   * @internal
   */
  tiled?: boolean;

  /**
   * Design options for the filter tile component
   *
   * @internal
   */
  tileDesignOptions?: FilterTileDesignOptions;
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
  ({
    filter: filterFromProps,
    onChange: updateFilterFromProps,
    onDelete,
    onEdit,
    title,
    earliestDate,
    lastDate,
    attribute,
    dataSource,
    parentFilters,
    tiled = false,
    tileDesignOptions,
  }: DateRangeFilterTileProps) => {
    const { filter, updateFilter } = useSynchronizedFilter(filterFromProps, updateFilterFromProps);

    if (!isDateRangeFilter(filter)) {
      throw new TranslatableError('errors.invalidFilterType', { filterType: 'DateRangeFilter' });
    }

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
          filter={filter}
          dateLimits={dateLimits}
          isOldDateRangeFilterTile
          onChange={updateFilter}
          title={title}
          attribute={attribute}
        />
      );
    }

    return (
      <FilterTileContainer
        title={title}
        renderContent={(collapsed) => {
          return collapsed || !dateLimits ? (
            <DateRangeFilterDisplay filter={filter} />
          ) : (
            <div className="csdk-mt-2 csdk-ml-2 csdk-mb-1">
              <EditableDateRangeFilter
                filter={filter}
                dateLimits={dateLimits}
                disabled={filter.config.disabled}
                onChange={updateFilter}
                title={title}
                attribute={attribute}
              />
            </div>
          );
        }}
        onToggleDisabled={() => {
          const newFilter = cloneFilterAndToggleDisabled(filter);
          updateFilter(newFilter);
        }}
        disabled={filter.config.disabled}
        design={tileDesignOptions}
        locked={filter.config.locked}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    );
  },
);
