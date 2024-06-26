import { FilterTile } from '../filter-tile.js';
import { CascadingFilter, Filter } from '@sisense/sdk-data';
import { asSisenseComponent } from '../../../decorators/component-decorators/as-sisense-component.js';
import { FilterVariant } from '../common/filter-utils.js';
import { CascadingLevelFilterTile } from './cascading-level-filter.js';
import { cloneFilterAndToggleDisabled } from '@/filters/utils.js';
import { useSynchronizedFilter } from '@/filters/hooks/use-synchronized-filter.js';

/**
 * Props for {@link CascadingFilterTile}
 *
 * @internal
 */
export interface CascadingFilterTileProps {
  /** Cascading filter object to initialize filter type and default values */
  filter: CascadingFilter;
  /** Arrangement of the filter inputs. Use vertical for standard filter tiles and horizontal for toolbars */
  arrangement?: FilterVariant;
  /** Callback returning filter object, or null for failure */
  onChange: (filter: Filter) => void;
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
    const { filter: filterFromProps, arrangement, onChange: updateFilterFromProps } = props;

    const { filter, updateFilter } = useSynchronizedFilter<CascadingFilter>(
      filterFromProps,
      updateFilterFromProps,
    );

    const levelFilters = filter.filters;

    const handleLevelFilterChange = (levelFilter: Filter, index: number) => {
      levelFilters[`${index}`] = levelFilter;
      updateFilter(filter);
    };

    return (
      <FilterTile
        renderContent={() => {
          const parentFilters: Filter[] = [];
          return levelFilters.map((levelFilter, index) => {
            const currentParentFilters = [...parentFilters];
            parentFilters.push(levelFilter);
            return (
              <CascadingLevelFilterTile
                key={index}
                filter={levelFilter}
                parentFilters={currentParentFilters}
                onChange={(newFilter) => {
                  return newFilter ? handleLevelFilterChange(newFilter, index) : null;
                }}
                isLast={index === levelFilters.length - 1}
              />
            );
          });
        }}
        arrangement={arrangement}
        disabled={filter.disabled}
        onToggleDisabled={() => {
          const newCascadingFilter = cloneFilterAndToggleDisabled(filter);
          updateFilter(newCascadingFilter);
        }}
        design={{
          header: {
            shouldBeShown: false,
          },
        }}
      />
    );
  },
);
