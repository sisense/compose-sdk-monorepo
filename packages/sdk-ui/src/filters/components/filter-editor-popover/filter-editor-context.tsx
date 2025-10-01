import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { DataSource, Filter } from '@ethings-os/sdk-data';

type FilterEditorContextValue = {
  defaultDataSource: DataSource | null;
  parentFilters: Filter[];
  membersOnlyMode: boolean;
};

const FilterEditorContext = createContext<FilterEditorContextValue>({
  defaultDataSource: null,
  parentFilters: [],
  membersOnlyMode: false,
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
  const membersOnlyMode = useMemo(() => value.membersOnlyMode ?? [], [value.membersOnlyMode]);

  useEffect(() => {
    if (defaultDataSource !== value.defaultDataSource) {
      setDefaultDataSource(value.defaultDataSource);
    }
  }, [defaultDataSource, value.defaultDataSource]);

  return (
    <FilterEditorContext.Provider value={{ defaultDataSource, parentFilters, membersOnlyMode }}>
      {children}
    </FilterEditorContext.Provider>
  );
};
