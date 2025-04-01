import React from 'react';
import { DataSource, Filter, isDatetime, isNumber, isText } from '@sisense/sdk-data';
import { FilterEditorTextual } from './filter-editor-textual';
import { FilterEditorNumerical } from './filter-editor-numerical';
import { FilterEditorDatetime } from './filter-editor-datetime';
import { FilterEditorContextProvider } from './filter-editor-context';
import { FilterEditorConfig } from './types';

type FilterEditorProps = {
  filter: Filter;
  onChange?: (filter: Filter | null) => void;
  /** Default data source used for filter attribute */
  defaultDataSource?: DataSource;
  config?: FilterEditorConfig;
};

/** @internal */
export const FilterEditor = ({
  filter,
  config,
  onChange,
  defaultDataSource,
}: FilterEditorProps) => {
  const showMultiselectToggle = config?.multiSelect?.visible;

  return (
    <FilterEditorContextProvider value={{ defaultDataSource: defaultDataSource ?? null }}>
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
