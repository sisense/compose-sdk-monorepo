/* eslint-disable security/detect-object-injection */
import { FunctionComponent, useState } from 'react';
import {
  NumericFilterInfo,
  NUMERIC_FILTER_MAP,
  numOperatorsToNumOption,
} from './criteria-filter-numeric-operations.js';
import { FilterTile } from '../filter-tile.js';
import { CriteriaFilterMenu } from './criteria-filter-menu.js';
import { Filter, NumericFilter } from '@sisense/sdk-data';
import { CriteriaFilterDisplay } from './criteria-filter-display.js';

/**
 * Props for {@link CriteriaFilterTile}
 */
export interface CriteriaFilterTileProps {
  /** Title for the filter tile, which is rendered into the header */
  title: string;
  /** Numeric filter object to initialize filter type and default values */
  filter: NumericFilter;
  /** Callback returning filter object, or null for failure */
  onUpdate: (filter: Filter | null) => void;
}

/**
 * UI component that allows the user to filter numeric attributes according to
 * a number of built-in operations defined in the {@link NumericFilterOption}.
 *
 * The arrangement prop determines whether the filter is rendered vertically or horizontally, with the latter intended for toolbar use and omitting title, enable/disable, and collapse/expand functionality.
 *
 * @param props - Criteria filter tile props
 * @returns Criteria filter tile component
 */
export const CriteriaFilterTile: FunctionComponent<CriteriaFilterTileProps> = (props) => {
  const { title, filter, onUpdate } = props;
  const filterType = numOperatorsToNumOption(filter.operatorA, filter.operatorB);
  const filterInfo: NumericFilterInfo = NUMERIC_FILTER_MAP[filterType];
  const defaultValues = [filter.valueA, filter.valueB].filter((v) => v !== undefined) as number[];
  const [disabled, setDisabled] = useState(false);
  const [values, setValues] = useState(defaultValues);

  const onUpdateValues = (newValues: number[]) => {
    setValues(newValues);
    // make new filters, then call onUpdate
    const newFilter: Filter | null = filterInfo.fn(filter.attribute, ...newValues) ?? null;
    onUpdate(newFilter);
    if (disabled) setDisabled(false);
  };

  return (
    <FilterTile
      title={title}
      renderContent={(collapsed) => {
        return collapsed ? (
          <CriteriaFilterDisplay filterType={filterType} values={values} />
        ) : (
          <CriteriaFilterMenu
            filterType={filterType}
            defaultValues={values}
            onUpdate={onUpdateValues}
            disabled={disabled}
          />
        );
      }}
      disabled={disabled}
      onToggleDisabled={() => setDisabled((v) => !v)}
    />
  );
};
