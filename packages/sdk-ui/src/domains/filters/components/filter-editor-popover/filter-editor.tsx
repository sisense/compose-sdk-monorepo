import React, { useMemo } from 'react';

import { DataSource, Filter } from '@sisense/sdk-data';

import { FilterEditorContextProvider } from './filter-editor-context.js';
import { FilterEditorDatetime } from './filter-editor-datetime.js';
import { FilterEditorNumerical } from './filter-editor-numerical.js';
import { FilterEditorTextual } from './filter-editor-textual.js';
import { FilterEditorConfig } from './types.js';
import { getFilterEditorValueType } from './utils.js';

function toDataSourceFromAttribute(
  dataSource: NonNullable<Filter['attribute']['dataSource']>,
): DataSource {
  return {
    title: dataSource.title,
    type: dataSource.type ?? (dataSource.live ? 'live' : 'elasticube'),
    ...(dataSource.id ? { id: dataSource.id } : {}),
    ...(dataSource.address ? { address: dataSource.address } : {}),
  };
}

type FilterEditorProps = {
  filter: Filter;
  parentFilters?: Filter[];
  onChange?: (filter: Filter | null) => void;
  /** Default data source used for filter attribute */
  defaultDataSource?: DataSource;
  dataSources?: DataSource[];
  config?: FilterEditorConfig;
};

/** @internal */
export const FilterEditor = ({
  filter,
  parentFilters,
  config,
  onChange,
  defaultDataSource,
  dataSources,
}: FilterEditorProps) => {
  const showMultiselectToggle = config?.multiSelect?.visible;
  const valueType = getFilterEditorValueType(filter.attribute);
  const parentFiltersInternal = useMemo(() => parentFilters ?? [], [parentFilters]);
  const dataSourcesInternal = useMemo(() => {
    if (dataSources !== undefined) {
      return dataSources;
    }
    if (defaultDataSource) {
      return [defaultDataSource];
    }
    if (filter.attribute.dataSource) {
      return [toDataSourceFromAttribute(filter.attribute.dataSource)];
    }
    return [];
  }, [dataSources, defaultDataSource, filter.attribute.dataSource]);

  return (
    <FilterEditorContextProvider
      value={{
        defaultDataSource: defaultDataSource ?? null,
        dataSources: dataSourcesInternal,
        parentFilters: parentFiltersInternal,
        membersOnlyMode: config?.membersOnlyMode ?? false,
        rankingVisible: config?.ranking?.visible ?? true,
      }}
    >
      {valueType === 'text' && (
        <FilterEditorTextual
          filter={filter}
          onChange={onChange}
          showMultiselectToggle={showMultiselectToggle}
        />
      )}
      {valueType === 'numeric' && (
        <FilterEditorNumerical
          filter={filter}
          onChange={onChange}
          showMultiselectToggle={showMultiselectToggle}
        />
      )}
      {valueType === 'datetime' && (
        <FilterEditorDatetime
          filter={filter}
          onChange={onChange}
          showMultiselectToggle={showMultiselectToggle}
        />
      )}
    </FilterEditorContextProvider>
  );
};
