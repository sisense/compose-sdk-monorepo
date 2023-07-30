/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable complexity */
import { Attribute, Data, DataSource, Filter, isDataSource, Measure } from '@sisense/sdk-data';
import { useEffect, useRef, useState } from 'react';
import { useSisenseContext } from '../../SisenseContextProvider';
import { executeQuery } from '../../../query/execute-query';
import { isMeasureColumn, TableDataOptionsInternal } from '../../../chart-data-options/types';
import { translation } from '../../../locales/en';
import { useSetError } from '../../ErrorBoundary/useSetError';

type UseDataProps = {
  dataSet: Data | DataSource | undefined;
  dataOptions: TableDataOptionsInternal | null;
  filters: Filter[] | undefined;
  count: number;
  offset: number;
};

const getAttributesAndMeasures = (dataOptions: TableDataOptionsInternal) => {
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

export const useTableData = ({
  dataSet,
  dataOptions,
  filters,
  count,
  offset,
}: UseDataProps): Data | null => {
  const setError = useSetError();
  const [data, setData] = useState<Data | null>(null);
  const isMoreDataAvailable = useRef(true);
  const { isInitialized, app } = useSisenseContext();

  useEffect(() => {
    if (!dataOptions) return;
    const { attributes, measures } = getAttributesAndMeasures(dataOptions);

    if (dataSet === undefined || isDataSource(dataSet)) {
      if (!isInitialized) {
        setError(new Error(translation.errors.chartNoSisenseContext));
      }

      if (!app || (!isMoreDataAvailable.current && offset > 0)) return;

      executeQuery(dataSet, attributes, measures, filters, [], app, count + 1, offset)
        .then((queryResult) => {
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
  }, [app, dataSet, dataOptions, filters, offset, count, isInitialized, setError]);

  return data;
};
