import {
  Attribute,
  Data,
  DataSource,
  Filter,
  FilterRelationsJaql,
  isDataSource,
  Measure,
} from '@sisense/sdk-data';
import { useEffect, useRef, useState } from 'react';
import { useSisenseContext } from '../../sisense-context/sisense-context';

import {
  executeQueryWithCache,
  executeQuery as executeQueryWithoutCache,
} from '../../query/execute-query';
import { isMeasureColumn, TableDataOptionsInternal } from '../../chart-data-options/types';
import { useSetError } from '../../error-boundary/use-set-error';
import { TranslatableError } from '../../translation/translatable-error';

type UseDataProps = {
  dataSet: Data | DataSource | undefined;
  dataOptions: TableDataOptionsInternal | null;
  filters: Filter[] | undefined;
  filterRelations: FilterRelationsJaql | undefined;
  count: number;
  offset: number;
};

export const getTableAttributesAndMeasures = (dataOptions: TableDataOptionsInternal) => {
  const attributes: Attribute[] = [];
  const measures: Measure[] = [];

  for (const column of dataOptions.columns) {
    if (isMeasureColumn(column)) {
      measures.push(column as Measure);
    } else {
      attributes.push(column as Attribute);
    }
  }

  return { attributes, measures };
};

// eslint-disable-next-line max-lines-per-function
export const useTableData = ({
  dataSet,
  dataOptions: originalDataOptions,
  filters,
  filterRelations,
  count,
  offset,
}: UseDataProps): [Data | null, TableDataOptionsInternal | null] => {
  const setError = useSetError();
  const [data, setData] = useState(isDataSource(dataSet) ? null : dataSet);
  const isMoreDataAvailable = useRef(true);
  const { isInitialized, app } = useSisenseContext();
  const [dataOptions, setDataOptions] = useState<TableDataOptionsInternal | null>(null);

  useEffect(() => {
    let ignore = false;

    if (!originalDataOptions) return;
    const { attributes, measures } = getTableAttributesAndMeasures(originalDataOptions);

    if (isDataSource(dataSet)) {
      if (!isInitialized) {
        setError(new TranslatableError('errors.chartNoSisenseContext'));
      }

      if (!app || (!isMoreDataAvailable.current && offset > 0)) return;

      setData(null);

      const executeQuery = app.settings.queryCacheConfig?.enabled
        ? executeQueryWithCache
        : executeQueryWithoutCache;

      executeQuery(
        {
          dataSource: dataSet,
          dimensions: attributes,
          measures,
          filters,
          filterRelations,
          count: count + 1,
          offset,
          // ungroup is needed so query without aggregation returns correct result
          ungroup: true,
        },
        app,
      )
        .then((queryResult) => {
          if (ignore) return;

          isMoreDataAvailable.current = queryResult.rows.length > count;
          const rows = isMoreDataAvailable.current
            ? queryResult.rows.slice(0, count)
            : queryResult.rows;

          if (offset > 0) {
            setData((d) => ({
              columns: queryResult.columns,
              rows: d ? [...d.rows, ...rows] : rows,
            }));
          } else {
            setData({
              columns: queryResult.columns,
              rows,
            });
          }
          setDataOptions(originalDataOptions);
        })
        .catch((e: Error) => setError(e));
    } else {
      setData(dataSet);
      setDataOptions(originalDataOptions);
    }

    // Set up cleanup function to ignore async fetch results of previous render
    // when the Effect is firing twice in Strict Mode
    // Reference: https://react.dev/learn/synchronizing-with-effects#fetching-data
    return () => {
      ignore = true;
    };
  }, [
    app,
    dataSet,
    originalDataOptions,
    filters,
    filterRelations,
    offset,
    count,
    isInitialized,
    setError,
  ]);

  return [data, dataOptions];
};
