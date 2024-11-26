import { useCallback, useState } from 'react';
import {
  FilterInfo,
  CRITERIA_FILTER_MAP,
  filterToOption,
  CriteriaFilterValueType,
  filterToDefaultValues,
  valuesToDisplayValues,
} from './criteria-filter-operations.js';
import { FilterTile, FilterTileDesignOptions } from '../filter-tile.js';
import { CriteriaFilterMenu } from './criteria-filter-menu.js';
import {
  ExcludeFilter,
  Filter,
  Measure,
  NumericFilter,
  RankingFilter,
  TextFilter,
} from '@sisense/sdk-data';
import { CriteriaFilterDisplay } from './criteria-filter-display.js';
import { asSisenseComponent } from '../../../decorators/component-decorators/as-sisense-component';
import { FilterVariant, isVertical } from '../common/filter-utils.js';
import { useSynchronizedFilter } from '@/filters/hooks/use-synchronized-filter.js';

/**
 * Props for {@link CriteriaFilterTile}
 */
export interface CriteriaFilterTileProps {
  /** Title for the filter tile, which is rendered into the header */
  title: string;
  /** Text or numeric filter object to initialize filter type and default values */
  filter: CriteriaFilterType;
  /** Arrangement of the filter inputs. Use vertical for standard filter tiles and horizontal for toolbars */
  arrangement?: FilterVariant;
  /** Callback returning filter object, or null for failure */
  onUpdate: (filter: Filter | null) => void;
  /** Filter delete callback */
  onDelete?: () => void;
  /** List of available measures to rank by. Required only for ranking filters. */
  measures?: Measure[];
  /**
   * Design options for the filter tile component
   *
   * @internal
   */
  tileDesignOptions?: FilterTileDesignOptions;
}

export type CriteriaFilterType = NumericFilter | TextFilter | RankingFilter | ExcludeFilter;

/**
 * UI component that allows the user to filter numeric or text attributes according to
 * a number of built-in operations defined in the numeric filter, text filter, or ranking filter.
 *
 * The arrangement prop determines whether the filter is rendered vertically or horizontally, with the latter intended for toolbar use and omitting title, enable/disable, and collapse/expand functionality.
 *
 * @example
 * ```tsx
 * const initialRevenueFilter = filterFactory.greaterThanOrEqual(DM.Commerce.Revenue, 10000);
 * const [revenueFilter, setRevenueFilter] = useState<Filter | null>(initialRevenueFilter);
 *
 * return (
 *   <CriteriaFilterTile
 *     title={'Revenue'}
 *     filter={revenueFilter}
 *     onUpdate={setRevenueFilter}
 *   />
 * );
 * ```
 *
 * <img src="media://criteria-filter-tile-example-1.png" width="300px" />
 * @param props - Criteria filter tile props
 * @returns Criteria filter tile component
 * @group Filter Tiles
 */
export const CriteriaFilterTile = asSisenseComponent({ componentName: 'CriteriaFilterTile' })(
  (props: CriteriaFilterTileProps) => {
    const {
      title,
      filter: filterFromProps,
      arrangement = 'vertical',
      onUpdate: updateFilterFromProps,
      onDelete,
      measures,
      tileDesignOptions,
    } = props;

    const { filter, updateFilter } = useSynchronizedFilter(filterFromProps, updateFilterFromProps);

    const disabled = filter.disabled;

    const filterOption = filterToOption(filter as CriteriaFilterType);
    const filterInfo: FilterInfo = CRITERIA_FILTER_MAP[filterOption];

    // These variables will change throughout filter editing
    const defaultValues: CriteriaFilterValueType[] = filterToDefaultValues(
      filter as CriteriaFilterType,
    );

    const [values, setValues] = useState<CriteriaFilterValueType[]>(defaultValues);

    // callback to update filter values
    const updateValues = (newValues: CriteriaFilterValueType[]) => {
      setValues(newValues);
      const newFilter = createFilter(newValues, disabled);
      updateFilter(newFilter);
    };

    const createFilter = useCallback(
      (newValues: CriteriaFilterValueType[], newDisabled: boolean): Filter => {
        let newFilter: Filter | null = null;
        if (filterInfo.ranked) {
          // for ranked functions, Measure must come before count.
          newFilter = filterInfo.fn(
            filter.attribute,
            newValues?.[1],
            newValues?.[0],
            filterFromProps.guid,
          );
        } else {
          newFilter = filterInfo.fn(filter.attribute, ...newValues, filterFromProps.guid);
        }
        newFilter.disabled = newDisabled;
        return newFilter;
      },
      [filterFromProps.guid, filter.attribute, filterInfo],
    );

    return (
      <FilterTile
        title={title}
        renderContent={(collapsed) => {
          return collapsed && isVertical(arrangement) ? (
            <CriteriaFilterDisplay
              filterType={filterOption}
              values={valuesToDisplayValues(values)}
            />
          ) : (
            <CriteriaFilterMenu
              filterType={filterOption}
              arrangement={arrangement}
              defaultValues={values}
              onUpdate={updateValues}
              disabled={disabled}
              measures={measures}
            />
          );
        }}
        arrangement={arrangement}
        disabled={disabled}
        onToggleDisabled={() => {
          const newDisabled = !disabled;
          const newFilter = createFilter(values, newDisabled);
          updateFilter(newFilter);
        }}
        design={tileDesignOptions}
        locked={filter.locked}
        onDelete={onDelete}
      />
    );
  },
);
