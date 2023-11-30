/* eslint-disable security/detect-object-injection */
import { useRef, useState } from 'react';
import {
  FilterInfo,
  CRITERIA_FILTER_MAP,
  operatorsToOption,
  isVertical,
  FilterVariant,
} from './criteria-filter-operations.js';
import { FilterTile } from '../filter-tile.js';
import { CriteriaFilterMenu } from './criteria-filter-menu.js';
import { Filter, NumericFilter, TextFilter } from '@sisense/sdk-data';
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
}

export type CriteriaFilterType = NumericFilter | TextFilter;

/**
 * UI component that allows the user to filter numeric or text attributes according to
 * a number of built-in operations defined in the {@link NumericFilter} or {@link TextFilter}.
 *
 * The arrangement prop determines whether the filter is rendered vertically or horizontally, with the latter intended for toolbar use and omitting title, enable/disable, and collapse/expand functionality.
 *
 * @param props - Criteria filter tile props
 * @returns Criteria filter tile component
 */
export const CriteriaFilterTile = asSisenseComponent({ componentName: 'CriteriaFilterTile' })(
  (props: CriteriaFilterTileProps) => {
    const { title, filter, arrangement = 'vertical', onUpdate } = props;
    // It's possible the user could pass in null as a filter as they edit inputs, so we need to account for that by remembering the last VALID (i.e. non-null) filter
    const lastFilter = useRef(filter);
    const filterType = operatorsToOption(
      lastFilter.current.operatorA,
      lastFilter.current.operatorB,
    );
    const filterInfo: FilterInfo = CRITERIA_FILTER_MAP[filterType];

    // These variables will change throughout filter editing
    const defaultValues = [
      filter?.valueA ?? lastFilter.current.valueA,
      filter?.valueB ?? lastFilter.current.valueB,
    ].filter((v) => v !== undefined) as (number | string)[];
    const [disabled, setDisabled] = useState(false);
    const [values, setValues] = useState(defaultValues);

    const onUpdateValues = (newValues: (number | string)[]) => {
      setValues(newValues);
      // make new filters, then call onUpdate
      const newFilter: Filter | null =
        filterInfo.fn(lastFilter.current.attribute, ...newValues) ?? null;
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
            <CriteriaFilterDisplay filterType={filterType} values={values} />
          ) : (
            <CriteriaFilterMenu
              filterType={filterType}
              arrangement={arrangement}
              defaultValues={values}
              onUpdate={onUpdateValues}
              disabled={disabled}
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
