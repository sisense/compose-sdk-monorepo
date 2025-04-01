import { useState, useCallback } from 'react';
import {
  Filter,
  isText as isTextAttributeType,
  isNumber as isNumberAttributeType,
  isDatetime as isDatetimeAttributeType,
  DataSource,
} from '@sisense/sdk-data';
import { FilterEditorPopover } from '@/filters/components/filter-editor-popover/filter-editor-popover';
import type { UseExistingFilterEditingConfig } from '../types';

type UseExistingFilterEditingParams = {
  onFilterChanged: (filter: Filter) => void;
  defaultDataSource?: DataSource;
  config?: UseExistingFilterEditingConfig;
};

type UseExistingFilterEditingReturn = {
  ExistingFilterEditor: () => JSX.Element | null;
  startEditingFilter: (anchorEl: HTMLElement, filter: Filter) => void;
};

/**
 * Hook that keeps editing process of existing filters.
 * Returns a function to start editing a filter and a component that renders the filter editing popover.
 */
export const useExistingFilterEditing = ({
  config,
  defaultDataSource,
  onFilterChanged,
}: UseExistingFilterEditingParams): UseExistingFilterEditingReturn => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [filterToEdit, setFilterToEdit] = useState<Filter | null>(null);

  return {
    ExistingFilterEditor: useCallback(() => {
      return config?.enabled && anchorEl ? (
        <FilterEditorPopover
          filter={filterToEdit}
          position={{
            anchorEl,
          }}
          onChange={(changedFilter) => {
            onFilterChanged(changedFilter);
            setFilterToEdit(null);
          }}
          onClose={() => {
            setFilterToEdit(null);
            setAnchorEl(null);
          }}
          config={config}
          defaultDataSource={defaultDataSource}
        />
      ) : null;
    }, [anchorEl, filterToEdit, config, onFilterChanged, defaultDataSource]),
    startEditingFilter: useCallback((anchorEl, filter) => {
      setAnchorEl(anchorEl);
      setFilterToEdit(filter);
    }, []),
  };
};

export function isFilterSupportEditing(filter: Filter): boolean {
  return (
    isTextAttributeType(filter.attribute.type) ||
    isNumberAttributeType(filter.attribute.type) ||
    isDatetimeAttributeType(filter.attribute.type)
  );
}
