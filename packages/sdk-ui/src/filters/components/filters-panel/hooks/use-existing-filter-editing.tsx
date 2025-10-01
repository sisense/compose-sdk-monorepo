import { useState, useCallback, useMemo } from 'react';
import {
  Filter,
  isText as isTextAttributeType,
  isNumber as isNumberAttributeType,
  isDatetime as isDatetimeAttributeType,
  DataSource,
  isCascadingFilter,
  isMembersFilter,
  filterFactory,
} from '@ethings-os/sdk-data';
import { FilterEditorPopover } from '@/filters/components/filter-editor-popover/filter-editor-popover';
import type { UseExistingFilterEditingConfig } from '../types';
import clone from 'lodash-es/clone';

type UseExistingFilterEditingParams = {
  onFilterChanged: (filter: Filter) => void;
  defaultDataSource?: DataSource;
  config?: UseExistingFilterEditingConfig;
};

type UseExistingFilterEditingReturn = {
  ExistingFilterEditor: () => JSX.Element | null;
  startEditingFilter: (anchorEl: HTMLElement, filter: Filter, levelIndex?: number) => void;
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
  const [levelIndexToEdit, setLevelIndexToEdit] = useState<number | null>(null);
  const parentFilters = useMemo(
    () => getParentFilters(filterToEdit, levelIndexToEdit),
    [filterToEdit, levelIndexToEdit],
  );

  const extendedConfig = useMemo(() => {
    const isMembersOnlyMode = filterToEdit && checkForMembersOnlyModeCase(filterToEdit);
    return isMembersOnlyMode ? { ...config, membersOnlyMode: true } : config;
  }, [config, filterToEdit]);

  const handleChange = useCallback(
    (changedFilter: Filter) => {
      let newFilter = changedFilter;
      if (filterToEdit && isCascadingFilter(filterToEdit)) {
        newFilter = filterFactory.cascading(
          filterToEdit.filters.map((filter, index) => {
            if (index === levelIndexToEdit) {
              return changedFilter;
            }
            if (isMembersFilter(filter) && index > levelIndexToEdit!) {
              return Object.assign(clone(filter), { members: [] });
            }
            return filter;
          }),
          filterToEdit?.config,
        );
      }
      onFilterChanged(newFilter);

      setLevelIndexToEdit(null);
      setFilterToEdit(null);
    },
    [filterToEdit, levelIndexToEdit, onFilterChanged],
  );

  return {
    ExistingFilterEditor: useCallback(() => {
      return config?.enabled && anchorEl ? (
        <FilterEditorPopover
          filter={
            filterToEdit && isCascadingFilter(filterToEdit) && levelIndexToEdit !== null
              ? filterToEdit.filters[levelIndexToEdit]
              : filterToEdit
          }
          position={{
            anchorEl,
          }}
          parentFilters={parentFilters}
          onChange={handleChange}
          onClose={() => {
            setFilterToEdit(null);
            setAnchorEl(null);
            setLevelIndexToEdit(null);
          }}
          config={extendedConfig}
          defaultDataSource={defaultDataSource}
        />
      ) : null;
    }, [
      anchorEl,
      filterToEdit,
      config,
      handleChange,
      defaultDataSource,
      levelIndexToEdit,
      extendedConfig,
      parentFilters,
    ]),
    startEditingFilter: useCallback((anchorEl, filter, levelIndex) => {
      setAnchorEl(anchorEl);
      setLevelIndexToEdit(levelIndex ?? null);
      setFilterToEdit(filter);
    }, []),
  };
};

export function isFilterSupportEditing(filter: Filter): boolean {
  return (
    isTextAttributeType(filter.attribute.type) ||
    isNumberAttributeType(filter.attribute.type) ||
    isDatetimeAttributeType(filter.attribute.type) ||
    isCascadingFilter(filter)
  );
}

/**
 * Get parent filters for the given filter.
 * @param filter - The filter to get parent filters for.
 * @param levelIndex - The index of the filter in the cascading filter.
 * @internal
 */
function getParentFilters(filter: Filter | null, levelIndex: number | null): Filter[] {
  const parentFilters: Filter[] = [];

  if (!filter || (isCascadingFilter(filter) && levelIndex === null)) {
    return parentFilters;
  }
  if (isCascadingFilter(filter)) {
    parentFilters.push(...filter.filters.slice(0, levelIndex!));
  }
  const curFilter = isCascadingFilter(filter) ? filter.filters[levelIndex!] : filter;
  if (isMembersFilter(curFilter) && curFilter.config.backgroundFilter) {
    parentFilters.push(curFilter.config.backgroundFilter);
  }

  return parentFilters;
}

/**
 * Check if the filter should be edited with members only mode.
 * @internal
 */
function checkForMembersOnlyModeCase(filter: Filter): boolean {
  return isCascadingFilter(filter) || (isMembersFilter(filter) && !!filter.config.backgroundFilter);
}
