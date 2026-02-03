import React, { useMemo } from 'react';

import { DataSource, Filter, isDatetime, isNumber, isText } from '@sisense/sdk-data';

import { FilterEditorContextProvider } from './filter-editor-context.js';
import { FilterEditorDatetime } from './filter-editor-datetime.js';
import { FilterEditorNumerical } from './filter-editor-numerical.js';
import { FilterEditorTextual } from './filter-editor-textual.js';
import { FilterEditorConfig } from './types.js';

type FilterEditorProps = {
  filter: Filter;
  parentFilters?: Filter[];
  onChange?: (filter: Filter | null) => void;
  /** Default data source used for filter attribute */
  defaultDataSource?: DataSource;
  config?: FilterEditorConfig;
};

/** @internal */
export const FilterEditor = ({
  filter,
  parentFilters,
  config,
  onChange,
  defaultDataSource,
}: FilterEditorProps) => {
  const showMultiselectToggle = config?.multiSelect?.visible;
  const parentFiltersInternal = useMemo(() => parentFilters ?? [], [parentFilters]);

  return (
    <FilterEditorContextProvider
      value={{
        defaultDataSource: defaultDataSource ?? null,
        parentFilters: parentFiltersInternal,
        membersOnlyMode: config?.membersOnlyMode ?? false,
      }}
    >
      {isText(filter.attribute.type) && (
        <FilterEditorTextual
          filter={filter}
          onChange={onChange}
          showMultiselectToggle={showMultiselectToggle}
        />
      )}
      {isNumber(filter.attribute.type) && (
        <FilterEditorNumerical
          filter={filter}
          onChange={onChange}
          showMultiselectToggle={showMultiselectToggle}
        />
      )}
      {isDatetime(filter.attribute.type) && (
        <FilterEditorDatetime
          filter={filter}
          onChange={onChange}
          showMultiselectToggle={showMultiselectToggle}
        />
      )}
    </FilterEditorContextProvider>
  );
};
