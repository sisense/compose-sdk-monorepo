import { Filter, RelativeDateFilter as RelativeDateFilterType } from '@sisense/sdk-data';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';

import { useSynchronizedFilter } from '@/domains/filters/hooks/use-synchronized-filter.js';
import { cloneFilterAndToggleDisabled } from '@/shared/utils/filters.js';

import { asSisenseComponent } from '../../../../../infra/decorators/component-decorators/as-sisense-component.js';
import { isVertical } from '../../common/filter-utils.js';
import { FilterVariant } from '../../common/index.js';
import { FilterTileContainer, FilterTileDesignOptions } from '../../filter-tile-container.js';
import { RelativeDateFilterDisplay } from './relative-date-filter-display.js';
import { RelativeDateFilter } from './relative-date-filter.js';

dayjs.extend(isToday);

/**
 * Props of the {@link RelativeDateFilterTile} component.
 */
export interface RelativeDateFilterTileProps {
  /**Filter tile title */
  title: string;
  /** Relative date filter. */
  filter: Filter;
  /** Arrangement of the filter inputs. Use vertical for standard filter tiles and horizontal for toolbars */
  arrangement?: FilterVariant;
  /**
   * Callback function that is called when the relative date filter object should be updated.
   *
   * @param filter - Relative date filter
   */
  onUpdate: (filter: Filter) => void;
  /** Filter delete callback */
  onDelete?: () => void;
  /** Filter edit callback */
  onEdit?: () => void;
  /**
   * Limit of the date range that can be selected.
   */
  limit?: {
    maxDate: string;
    minDate: string;
  };
  /**
   * Design options for the filter tile component
   *
   * @internal
   */
  tileDesignOptions?: FilterTileDesignOptions;
}

/**
 * UI component that allows the user to filter date attributes according to
 * a number of built-in operations defined in the relative date filter.
 * Useful for filtering data by relative date ranges, such as "last 7 days" or "next 30 days from Date".
 *
 * @param props - Relative date filter tile props
 * @returns Relative date filter tile component
 * @group Filter Tiles
 */
export const RelativeDateFilterTile = asSisenseComponent({
  componentName: 'RelativeDateFilterTile',
})((props: RelativeDateFilterTileProps) => {
  const {
    title,
    filter: filterFromProps,
    arrangement = 'horizontal',
    onUpdate: updateFilterFromProps,
    onDelete,
    onEdit,
    limit,
    tileDesignOptions,
  } = props;

  const { filter, updateFilter } = useSynchronizedFilter<RelativeDateFilterType>(
    filterFromProps as RelativeDateFilterType,
    updateFilterFromProps,
  );
  const disabled = filter.config.disabled;

  return (
    <FilterTileContainer
      title={title}
      renderContent={(collapsed) => {
        return collapsed && isVertical(arrangement) ? (
          <RelativeDateFilterDisplay filter={filter} />
        ) : (
          <RelativeDateFilter
            filter={filter}
            arrangement={arrangement}
            onUpdate={updateFilter}
            disabled={disabled}
            limit={limit}
          />
        );
      }}
      onToggleDisabled={() => {
        const newFilter = cloneFilterAndToggleDisabled(filter);
        updateFilter(newFilter);
      }}
      disabled={disabled}
      arrangement={arrangement}
      design={tileDesignOptions}
      locked={filter.config.locked}
      onDelete={onDelete}
      onEdit={onEdit}
    />
  );
});
