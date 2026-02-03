import { useCallback, useMemo, useState } from 'react';

import type { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';
import { type JaqlRequest } from '@sisense/sdk-pivot-query-client';
import isEqual from 'lodash-es/isEqual';

import { ExecutePivotQueryParams } from '@/domains/query-execution';
import { useExecutePivotQueryInternal } from '@/domains/query-execution/hooks/use-execute-pivot-query/use-execute-pivot-query';
import {
  PivotTableDataOptionsInternal,
  StyledColumn,
  StyledMeasureColumn,
} from '@/domains/visualizations/core/chart-data-options/types';
import {
  translateColumnToAttribute,
  translateColumnToMeasure,
} from '@/domains/visualizations/core/chart-data-options/utils';
import { RangeDataColorOptions } from '@/domains/visualizations/core/chart-data/data-coloring';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';

import { normalizePivotSort } from '../sorting-utils';

const PIVOT_JAQL_UPDATE_DEBOUNCE = 200;

const getPivotAttribute = (dataOption: StyledColumn) => {
  return {
    attribute: translateColumnToAttribute(dataOption),
    includeSubTotals: dataOption.includeSubTotals || false,
    ...(dataOption.sortType && {
      sort: normalizePivotSort(dataOption.sortType),
    }),
    ...(dataOption.name && {
      name: dataOption.name,
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
