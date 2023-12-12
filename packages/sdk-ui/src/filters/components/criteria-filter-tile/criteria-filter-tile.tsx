/* eslint-disable security/detect-object-injection */
import { useRef, useState } from 'react';
import {
  FilterInfo,
  CRITERIA_FILTER_MAP,
  filterToOption,
  isVertical,
  FilterVariant,
  CriteriaFilterValueType,
  filterToDefaultValues,
  valuesToDisplayValues,
} from './criteria-filter-operations.js';
import { FilterTile } from '../filter-tile.js';
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
  /** List of available measures to rank by. Required only for ranking filters. */
  measures?: Measure[];
}

export type CriteriaFilterType = NumericFilter | TextFilter | RankingFilter | ExcludeFilter;

/**
 * UI component that allows the user to filter numeric or text attributes according to
 * a number of built-in operations defined in the {@link NumericFilter}, {@link TextFilter}, or {@link RankingFilter}.
 *
 * The arrangement prop determines whether the filter is rendered vertically or horizontally, with the latter intended for toolbar use and omitting title, enable/disable, and collapse/expand functionality.
 *
 * @example
 * ```tsx
 * const initialRevenueFilter = filters.greaterThanOrEqual(DM.Commerce.Revenue, 10000);
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
 */
export const CriteriaFilterTile = asSisenseComponent({ componentName: 'CriteriaFilterTile' })(
  // eslint-disable-next-line complexity, sonarjs/cognitive-complexity
  (props: CriteriaFilterTileProps) => {
    const { title, filter, arrangement = 'vertical', onUpdate, measures } = props;
    // It's possible the user could pass in null as a filter as they edit inputs, so we need to account for that by remembering the last VALID (i.e. non-null) filter
    const lastFilter = useRef(filter);
    const filterOption = filterToOption(lastFilter.current);
    const filterInfo: FilterInfo = CRITERIA_FILTER_MAP[filterOption];

    // These variables will change throughout filter editing
    const defaultValues: CriteriaFilterValueType[] = filterToDefaultValues(
      filter ?? lastFilter.current,
    );
    const [disabled, setDisabled] = useState(false);
    const [values, setValues] = useState<CriteriaFilterValueType[]>(defaultValues);

    const onUpdateValues = (newValues: CriteriaFilterValueType[]) => {
      setValues(newValues);
      // make new filters, then call onUpdate
      let newFilter: Filter | null = null;
      if (filterInfo.ranked) {
        // for ranked functions, Measure must come before count.
        newFilter = filterInfo.fn(lastFilter.current.attribute, newValues?.[1], newValues?.[0]);
      } else {
        newFilter = filterInfo.fn(lastFilter.current.attribute, ...newValues) ?? null;
      }
      onUpdate(newFilter);
      if (newFilter) {
        lastFilter.current = newFilter as CriteriaFilterType;
      }
      if (disabled) setDisabled(false);
    };

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
              onUpdate={onUpdateValues}
              disabled={disabled}
              measures={measures}
            />
          );
        }}
        arrangement={arrangement}
        disabled={disabled}
        onToggleDisabled={() => {
          if (!disabled) {
            onUpdate(null);
          } else {
            onUpdate(lastFilter.current);
          }
          setDisabled((v) => !v);
        }}
      />
    );
  },
);
