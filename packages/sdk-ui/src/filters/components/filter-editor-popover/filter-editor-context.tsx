import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { DataSource } from '@sisense/sdk-data';

type FilterEditorContextValue = { defaultDataSource: DataSource | null };

const FilterEditorContext = createContext<FilterEditorContextValue>({ defaultDataSource: null });

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

  useEffect(() => {
    if (defaultDataSource !== value.defaultDataSource) {
      setDefaultDataSource(value.defaultDataSource);
    }
  }, [defaultDataSource, value.defaultDataSource]);

  return (
    <FilterEditorContext.Provider value={{ defaultDataSource }}>
      {children}
    </FilterEditorContext.Provider>
  );
};
