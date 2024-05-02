import { measureFactory } from '@sisense/sdk-data';
import type { DataSource, Filter } from '@sisense/sdk-data';
import { useMemo } from 'react';
import type { HistogramDataOptions } from '../Histogram';

// Widget plug-in buildQuery: get min max count
export const useBuildMinMaxQuery = ({
  dataSource,
  dataOptions,
  filters,
}: {
  dataSource?: DataSource;
  dataOptions: HistogramDataOptions;
  filters?: Filter[];
}) => {
  const minMeas = useMemo(() => measureFactory.min(dataOptions.value, 'min'), [dataOptions.value]);
  const maxMeas = useMemo(() => measureFactory.max(dataOptions.value, 'max'), [dataOptions.value]);
  const countMeas = useMemo(
    () => measureFactory.count(dataOptions.value, 'count'),
    [dataOptions.value],
  );
  return useMemo(
    () => ({
      dataSource,
      measures: [minMeas, maxMeas, countMeas],
      filters,
    }),
    [dataSource, minMeas, maxMeas, countMeas, filters],
  );
};
