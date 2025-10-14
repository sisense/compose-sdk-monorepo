import { CascadingFilter, DataSource, Filter } from '@sisense/sdk-data';

import { useSynchronizedFilter } from '@/filters/hooks/use-synchronized-filter.js';
import { clearMembersFilter, cloneFilterAndToggleDisabled } from '@/utils/filters.js';

import { asSisenseComponent } from '../../../decorators/component-decorators/as-sisense-component.js';
import { FilterVariant } from '../common/filter-utils.js';
import { FilterTileContainer } from '../filter-tile-container.js';
import { CascadingLevelFilterTile } from './cascading-level-filter.js';

/**
 * Props for {@link CascadingFilterTile}
 *
 * @internal
 */
export interface CascadingFilterTileProps {
  /** Cascading filter object to initialize filter type and default values */
  filter: Filter;
  /**
   * Data source the query is run against - e.g. `Sample ECommerce`
   *
   * If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.
   */
  dataSource?: DataSource;
  /** Arrangement of the filter inputs. Use vertical for standard filter tiles and horizontal for toolbars */
  arrangement?: FilterVariant;
  /** Callback returning filter object, or null for failure */
  onChange: (filter: Filter) => void;
  /** Filter delete callback */
  onDelete?: () => void;
  /** Filter edit callback */
  onEdit?: (levelIndex: number) => void;
}

/**
 * UI component representing group of cascading (dependent) filters.
 *
 * @param props - Cascading filter tile props
 * @returns Cascading filter tile component
 * @group Filter Tiles
 * @internal
 */
export const CascadingFilterTile = asSisenseComponent({ componentName: 'CascadingFilterTile' })(
  (props: CascadingFilterTileProps) => {
    const {
      filter: filterFromProps,
      arrangement,
      onChange: updateFilterFromProps,
      onDelete,
      dataSource,
      onEdit,
    } = props;

    const { filter, updateFilter } = useSynchronizedFilter<CascadingFilter>(
      filterFromProps as CascadingFilter,
      updateFilterFromProps,
    );

    const levelFilters = filter.filters;

    const handleLevelFilterChange = (
      changedLevelFilter: Filter,
      changedLevelFilterIndex: number,
    ) => {
      const newLevelFilters = filter.filters.map((levelFilter, index) => {
        if (index === changedLevelFilterIndex) {
          return changedLevelFilter;
        }
        if (index > changedLevelFilterIndex) {
          return clearMembersFilter(levelFilter);
        }
        return levelFilter;
      });

      const { guid, disabled } = filter.config;

      const newCascadingFilter = new CascadingFilter(newLevelFilters, { guid, disabled });

      updateFilter(newCascadingFilter);
    };

    const handleToggleDisabled = () => {
      const newCascadingFilter = cloneFilterAndToggleDisabled(filter);
      updateFilter(newCascadingFilter);
    };

    return (
      <FilterTileContainer
        renderContent={() => {
          const parentFilters: Filter[] = [];
          return levelFilters.map((levelFilter, index) => {
            const currentParentFilters = [...parentFilters];
            parentFilters.push(levelFilter);
            return (
              <CascadingLevelFilterTile
                key={index}
                filter={levelFilter}
                dataSource={dataSource}
                parentFilters={currentParentFilters}
                onChange={(newFilter) => {
                  return newFilter ? handleLevelFilterChange(newFilter, index) : null;
                }}
                isLast={index === levelFilters.length - 1}
                onEdit={onEdit ? () => onEdit?.(index) : undefined}
              />
            );
          });
        }}
        arrangement={arrangement}
        disabled={filter.config.disabled}
        onToggleDisabled={handleToggleDisabled}
        design={{
          header: {
            shouldBeShown: false,
            disableGroupHover: true,
          },
        }}
        locked={filter.config.locked}
        onDelete={onDelete}
      />
    );
  },
);
