import { useEffect, useRef, useState } from 'react';

import {
  Attribute,
  Data,
  DataSource,
  Filter,
  FilterRelationsJaql,
  isDataSource,
  Measure,
} from '@sisense/sdk-data';
import isEqual from 'lodash-es/isEqual';

import {
  isMeasureColumn,
  translateColumnToAttribute,
  translateColumnToMeasure,
} from '@/domains/visualizations/core/chart-data-options/utils';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { useSetError } from '@/infra/error-boundary/use-set-error';
import { TranslatableError } from '@/infra/translation/translatable-error';

import {
  executeQueryWithCache,
  executeQuery as executeQueryWithoutCache,
  executeQueryWithRowCount,
} from '../../../../query-execution/core/execute-query';
import { TableDataOptionsInternal } from '../../../core/chart-data-options/types';
import { DataColumnNamesMapping } from '../../../core/chart-data-options/validate-data-options';

type UseDataProps = {
  dataSet: Data | DataSource | undefined;
  dataOptions: TableDataOptionsInternal | null;
  dataColumnNamesMapping: DataColumnNamesMapping;
  filters: Filter[] | undefined;
  filterRelations: FilterRelationsJaql | undefined;
  count: number;
  offset: number;
  /**
   * Whether to additionally request the query's total row count, ignoring
   * `count`/`offset` paging. See {@link TableProps.includeTotalRows}.
   */
  includeTotalRows?: boolean;
};

/**
 * Represents the absolute row range covered by `data` for a query-backed (`DataSource`) table.
 *
 * `start` is inclusive. `end` is exclusive.
 * @internal
 */
export type LoadedRowRange = { start: number; end: number };

type UseTableDataResult = {
  data: Data | null;
  dataOptions: TableDataOptionsInternal | null;
  dataColumnNamesMapping: DataColumnNamesMapping;
  /** `null` for static (already fully in-memory) data. */
  loadedRowRange: LoadedRowRange | null;
  /**
   * Total row count of the table's query, ignoring `count`/`offset` paging.
   * Populated only when `includeTotalRows` is enabled and the Sisense instance
   * supports the row count API; `undefined` otherwise.
   */
  rowCount?: number;
};

export const getTableAttributesAndMeasures = (dataOptions: TableDataOptionsInternal) => {
  const attributes: Attribute[] = [];
  const measures: Measure[] = [];

  for (const column of dataOptions.columns) {
    if (isMeasureColumn(column)) {
      measures.push(translateColumnToMeasure(column));
    } else {
      attributes.push(translateColumnToAttribute(column));
    }
  }

  return { attributes, measures };
};

// eslint-disable-next-line max-lines-per-function
export const useTableData = ({
  dataSet,
  dataOptions: originalDataOptions,
  dataColumnNamesMapping: originalDataColumnNamesMapping,
  filters,
  filterRelations,
  count,
  offset,
  includeTotalRows,
}: UseDataProps): UseTableDataResult => {
  const setError = useSetError();
  const [data, setData] = useState(isDataSource(dataSet) ? null : dataSet);
  const [isLoading, setIsLoading] = useState(false);
  const isMoreDataAvailable = useRef(true);
  const { isInitialized, app } = useSisenseContext();
  const [dataOptions, setDataOptions] = useState(originalDataOptions);
  const [dataColumnNamesMapping, setDataColumnNamesMapping] = useState(
    originalDataColumnNamesMapping,
  );
  const [rowCount, setRowCount] = useState<number | undefined>(undefined);
  const loadedRowRangeRef = useRef<LoadedRowRange | null>(null);
  const [loadedRowRange, setLoadedRowRange] = useState<LoadedRowRange | null>(null);

  // Identifies the query itself, independent of `offset`. When it changes, the loaded window
  // and exhaustion flag from the previous query no longer apply and must not suppress the
  // first fetch of the new one (e.g. an empty result landing at the same offset as a reset).
  // Compared by value, not reference, since callers may pass new but equivalent object/array
  // literals across renders (e.g. plain page-forward navigation) without that being a real
  // query change.
  const queryIdentity = {
    dataSet,
    originalDataOptions,
    filters,
    filterRelations,
    count,
    includeTotalRows,
  };
  const previousQueryIdentityRef = useRef(queryIdentity);
  if (!isEqual(previousQueryIdentityRef.current, queryIdentity)) {
    previousQueryIdentityRef.current = queryIdentity;
    loadedRowRangeRef.current = null;
    isMoreDataAvailable.current = true;
  }

  useEffect(() => {
    let ignore = false;

    if (!originalDataOptions) return;
    const { attributes, measures } = getTableAttributesAndMeasures(originalDataOptions);

    if (isDataSource(dataSet)) {
      if (!isInitialized) {
        setError(new TranslatableError('errors.chartNoSisenseContext'));
        return;
      }

      // Skip only when extending sequentially past a window already known to be exhausted.
      // A jump to a different (e.g. earlier) offset must still fetch even if the last
      // sequential fetch ran out of data further ahead.
      const isSequentialContinuation =
        loadedRowRangeRef.current !== null && offset === loadedRowRangeRef.current.end;
      if (!app || (isSequentialContinuation && !isMoreDataAvailable.current)) return;
      setIsLoading(true);

      const baseExecuteQuery = app.settings.queryCacheConfig?.enabled
        ? executeQueryWithCache
        : executeQueryWithoutCache;

      const queryDescription = {
        dataSource: dataSet,
        dimensions: attributes,
        measures,
        filters,
        filterRelations,
        count: count + 1,
        offset,
        // ungroup is needed so query without aggregation returns correct result
        ungroup: true,
      };

      const dataPromise = includeTotalRows
        ? executeQueryWithRowCount(queryDescription, app, undefined, baseExecuteQuery).then(
            (result) => {
              if (!ignore) setRowCount(result.rowCount);
              return result.data;
            },
          )
        : baseExecuteQuery(queryDescription, app);

      if (!includeTotalRows) {
        setRowCount(undefined);
      }

      dataPromise
        .then((queryResult) => {
          if (ignore) return;

          isMoreDataAvailable.current = queryResult.rows.length > count;
          const rows = isMoreDataAvailable.current
            ? queryResult.rows.slice(0, count)
            : queryResult.rows;

          const previousRange = loadedRowRangeRef.current;
          // Appends only when this batch picks up exactly where the loaded window left off;
          // any other offset (e.g. a jump to a distant page) replaces the loaded window instead.
          const isContiguousExtension = previousRange !== null && offset === previousRange.end;

          setData((d) =>
            isContiguousExtension && d
              ? { columns: queryResult.columns, rows: [...d.rows, ...rows] }
              : { columns: queryResult.columns, rows },
          );

          const newRange: LoadedRowRange = {
            start: isContiguousExtension ? previousRange.start : offset,
            end: offset + rows.length,
          };
          loadedRowRangeRef.current = newRange;
          setLoadedRowRange(newRange);

          setDataOptions(originalDataOptions);
          setDataColumnNamesMapping(originalDataColumnNamesMapping);
        })
        .finally(() => {
          setIsLoading(false);
        })
        .catch((e: Error) => {
          if (!ignore) {
            setError(e);
          }
        });
    } else {
      setData(dataSet);
      setDataOptions(originalDataOptions);
      setDataColumnNamesMapping(originalDataColumnNamesMapping);
      loadedRowRangeRef.current = null;
      setLoadedRowRange(null);
      setRowCount(undefined);
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
    originalDataColumnNamesMapping,
    filters,
    filterRelations,
    offset,
    count,
    includeTotalRows,
    isInitialized,
    setError,
  ]);

  return {
    data: isLoading ? null : data,
    dataOptions,
    dataColumnNamesMapping,
    loadedRowRange,
    rowCount,
  };
};
