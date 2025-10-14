import { useCallback, useMemo, useState } from 'react';

import type { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';
import { type JaqlRequest } from '@sisense/sdk-pivot-client';
import isEqual from 'lodash-es/isEqual';

import {
  PivotTableDataOptionsInternal,
  StyledColumn,
  StyledMeasureColumn,
} from '@/chart-data-options/types';
import { translateColumnToAttribute, translateColumnToMeasure } from '@/chart-data-options/utils';
import { RangeDataColorOptions } from '@/chart-data/data-coloring';
import { useDebouncedValue } from '@/common/hooks/use-debounced-value';
import { ExecutePivotQueryParams } from '@/query-execution';
import { useExecutePivotQueryInternal } from '@/query-execution/use-execute-pivot-query';

import { normalizePivotSort } from '../sorting-utils';

const PIVOT_JAQL_UPDATE_DEBOUNCE = 200;

const getPivotAttribute = (dataOption: StyledColumn) => {
  return {
    attribute: translateColumnToAttribute(dataOption),
    includeSubTotals: dataOption.includeSubTotals || false,
    ...(dataOption.sortType && {
      sort: normalizePivotSort(dataOption.sortType),
    }),
  };
};

const getPivotMeasure = (dataOption: StyledMeasureColumn) => {
  return {
    measure: translateColumnToMeasure(dataOption),
    totalsCalculation: dataOption.totalsCalculation,
    dataBars: dataOption.dataBars || false,
    shouldRequestMinMax: (dataOption.color as RangeDataColorOptions)?.type === 'range',
  };
};

export const getPivotQueryOptions = (
  dataOptions: PivotTableDataOptionsInternal,
): Pick<ExecutePivotQueryParams, 'rows' | 'columns' | 'values' | 'grandTotals'> => {
  const {
    rows: rowsInternal = [],
    columns: columnsInternal = [],
    values: valuesInternal = [],
    grandTotals,
  } = dataOptions;

  const rows = rowsInternal.flatMap(getPivotAttribute);
  const columns = columnsInternal.flatMap(getPivotAttribute);
  const values = valuesInternal.flatMap(getPivotMeasure);

  return { rows, columns, values, grandTotals };
};

/**
 * A hook that returns the JAQL request object from pivot table props.
 *
 * @internal
 */
export const usePivotTableQuery = ({
  dataSet,
  dataOptionsInternal,
  filters,
  highlights,
}: {
  dataSet?: DataSource;
  dataOptionsInternal: PivotTableDataOptionsInternal;
  filters?: Filter[] | FilterRelations;
  highlights?: Filter[];
}) => {
  const [jaql, setJaql] = useState<JaqlRequest | undefined>();
  const { rows, columns, values, grandTotals } = useMemo(
    () => getPivotQueryOptions(dataOptionsInternal),
    [dataOptionsInternal],
  );

  // retrieve the Jaql query without executing it
  const onBeforeQuery = useCallback(
    (query: JaqlRequest) => {
      setJaql((prevJaql) => {
        return isEqual(prevJaql, query) ? prevJaql : query;
      });
    },
    [setJaql],
  );

  // Debounce the query parameters to avoid frequent re-renders that may lead to formatting issues
  const queryParams: ExecutePivotQueryParams = useDebouncedValue(
    useMemo(
      () => ({
        dataSource: dataSet,
        rows,
        columns,
        values,
        grandTotals,
        filters,
        highlights,
        onBeforeQuery,
      }),
      [dataSet, rows, columns, values, grandTotals, filters, highlights, onBeforeQuery],
    ),
    PIVOT_JAQL_UPDATE_DEBOUNCE,
  );

  const { error } = useExecutePivotQueryInternal(queryParams);

  return { jaql, error };
};
