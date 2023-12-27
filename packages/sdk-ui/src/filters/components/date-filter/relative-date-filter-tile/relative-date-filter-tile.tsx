/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */
/* eslint-disable security/detect-object-injection */
/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { Filter, RelativeDateFilter as RelativeDateFilterType } from '@sisense/sdk-data';
import { FilterVariant } from '../../common/index.js';
import { asSisenseComponent } from '../../../../decorators/component-decorators/as-sisense-component.js';
import { useState } from 'react';
import { FilterTile } from '../../filter-tile.js';
import { isVertical } from '../../common/filter-utils.js';
import dayjs from 'dayjs';
import { RelativeDateFilterDisplay } from './relative-date-filter-display.js';
import isToday from 'dayjs/plugin/isToday';
import { RelativeDateFilter } from './relative-date-filter.js';
dayjs.extend(isToday);

/**
 * Props for {@link RelativeDateFilterTile}
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
   * @param filter - Relative date filter, or null for failure/disabled
   */
  onUpdate: (filter: Filter | null) => void;
  /**
   * Limit of the date range that can be selected.
   */
  limit?: {
    maxDate: string;
    minDate: string;
  };
}

/**
 * UI component that allows the user to filter date attributes according to
 * a number of built-in operations defined in the relative date filter.
 * Useful for filtering data by relative date ranges, such as "last 7 days" or "next 30 days from Date".
 *
 * @param props - Relative date filter tile props
 * @returns Relative date filter tile component
 */
export const RelativeDateFilterTile = asSisenseComponent({
  componentName: 'RelativeDateFilterTile',
})((props: RelativeDateFilterTileProps) => {
  const { title, filter, arrangement = 'horizontal', onUpdate, limit } = props;
  const [disabled, setDisabled] = useState(false);
  const [lastFilter, setLastFilter] = useState(filter);

  const onUpdateValues = (newFilter: Filter | null) => {
    if (newFilter) {
      setLastFilter(newFilter as RelativeDateFilterType);
    }
    onUpdate(newFilter);
  };

  return (
    <FilterTile
      title={title}
      renderContent={(collapsed) => {
        return collapsed && isVertical(arrangement) ? (
          <RelativeDateFilterDisplay filter={lastFilter as RelativeDateFilterType} />
        ) : (
          <RelativeDateFilter
            filter={lastFilter as RelativeDateFilterType}
            arrangement={arrangement}
            onUpdate={onUpdateValues}
            disabled={disabled}
            limit={limit}
          />
        );
      }}
      onToggleDisabled={() => {
        if (!disabled) {
          onUpdate(null);
        } else {
          onUpdate(lastFilter);
        }
        setDisabled((v) => !v);
      }}
      disabled={disabled}
      arrangement={arrangement}
    />
  );
});
