import { useState } from 'react';

import { DataSource } from '@sisense/sdk-data';

export const useDataSourceSelection = (
  initialDataSource: DataSource,
): { selectedDataSource: DataSource; selectDataSource: (dataSource: DataSource) => void } => {
  const [selectedDataSource, selectDataSource] = useState(initialDataSource);
  return { selectedDataSource, selectDataSource };
};
