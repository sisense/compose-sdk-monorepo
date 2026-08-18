import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { DataSource, Filter } from '@sisense/sdk-data';

type FilterEditorContextValue = {
  defaultDataSource: DataSource | null;
  dataSources: DataSource[];
  parentFilters: Filter[];
  membersOnlyMode: boolean;
  rankingVisible: boolean;
};

const FilterEditorContext = createContext<FilterEditorContextValue>({
  defaultDataSource: null,
  dataSources: [],
  parentFilters: [],
  membersOnlyMode: false,
  rankingVisible: true,
});

/** @internal */
export const useFilterEditorContext = () => {
  return useContext(FilterEditorContext);
};

/** @internal */
export const FilterEditorContextProvider = ({
  value,
  children,
}: {
  value: FilterEditorContextValue;
  children: ReactNode;
}) => {
  const [defaultDataSource, setDefaultDataSource] = useState<DataSource | null>(
    value.defaultDataSource,
  );
  const parentFilters = useMemo(() => value.parentFilters ?? [], [value.parentFilters]);
  const membersOnlyMode = useMemo(() => value.membersOnlyMode ?? false, [value.membersOnlyMode]);
  const rankingVisible = useMemo(() => value.rankingVisible ?? true, [value.rankingVisible]);
  const dataSources = useMemo(() => value.dataSources ?? [], [value.dataSources]);

  useEffect(() => {
    if (defaultDataSource !== value.defaultDataSource) {
      setDefaultDataSource(value.defaultDataSource);
    }
  }, [defaultDataSource, value.defaultDataSource]);

  return (
    <FilterEditorContext.Provider
      value={{ defaultDataSource, dataSources, parentFilters, membersOnlyMode, rankingVisible }}
    >
      {children}
    </FilterEditorContext.Provider>
  );
};
