/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable complexity */
import {
  Attribute,
  Data,
  DataSource,
  Filter,
  FilterRelation,
  isDataSource,
  Measure,
} from '@sisense/sdk-data';
import { useEffect, useRef, useState } from 'react';
import { useSisenseContext } from '../../sisense-context/sisense-context';

import { executeQuery } from '../../query/execute-query';
import { isMeasureColumn, TableDataOptionsInternal } from '../../chart-data-options/types';
import { useSetError } from '../../error-boundary/use-set-error';
import { TranslatableError } from '../../translation/translatable-error';

type UseDataProps = {
  dataSet: Data | DataSource | undefined;
  dataOptions: TableDataOptionsInternal | null;
  filters: Filter[] | undefined;
  filterRelations: FilterRelation | undefined;
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
  dataOptions,
  filters,
  filterRelations,
  count,
  offset,
}: UseDataProps): Data | null => {
  const setError = useSetError();
  const [data, setData] = useState<Data | null>(null);
  const isMoreDataAvailable = useRef(true);
  const { isInitialized, app } = useSisenseContext();

  useEffect(() => {
    let ignore = false;

    if (!dataOptions) return;
    const { attributes, measures } = getTableAttributesAndMeasures(dataOptions);

    if (dataSet === undefined || isDataSource(dataSet)) {
      if (!isInitialized) {
        setError(new TranslatableError('errors.chartNoSisenseContext'));
      }

      if (!app || (!isMoreDataAvailable.current && offset > 0)) return;

      executeQuery(
        {
          dataSource: dataSet,
          dimensions: attributes,
          measures,
          filters,
          filterRelations,
          count: count + 1,
          offset,
        },
        app,
      )
        .then((queryResult) => {
          if (ignore) return;

          isMoreDataAvailable.current = queryResult.rows.length > count;

          if (offset > 0) {
            setData((d) => ({
              columns: queryResult.columns,
              rows: [...(d ? d.rows : []), ...queryResult.rows.slice(0, count)],
            }));
          } else {
            setData({
              columns: queryResult.columns,
              rows: queryResult.rows.slice(0, count),
            });
          }
        })
        .catch((e: Error) => setError(e));
    } else {
      setData(dataSet);
    }

    // Set up cleanup function to ignore async fetch results of previous render
    // when the Effect is firing twice in Strict Mode
    // Reference: https://react.dev/learn/synchronizing-with-effects#fetching-data
    return () => {
      ignore = true;
    };
  }, [app, dataSet, dataOptions, filters, filterRelations, offset, count, isInitialized, setError]);

  return data;
};
