import { useCallback, useRef } from 'react';
import { type JaqlRequest } from '@sisense/sdk-pivot-client';
import type { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';
import { ExecutePivotQueryParams } from '../query-execution';
import { useExecutePivotQueryInternal } from '../query-execution/use-execute-pivot-query';
import { Category, PivotTableDataOptionsInternal, Value } from '../chart-data-options/types';
import { translateCategoryToAttribute, translateValueToMeasure } from '../chart-data-options/utils';
import { normalizePivotSort } from './sorting-utils';

const getPivotAttribute = (category: Category) => {
  return {
    attribute: translateCategoryToAttribute(category),
    includeSubTotals: category.includeSubTotals || false,
    ...(category.sortType && {
      sort: normalizePivotSort(category.sortType),
    }),
  };
};

const getPivotMeasure = (value: Value) => {
  return {
    measure: translateValueToMeasure(value),
    totalsCalculation: value.totalsCalculation,
    dataBars: value.dataBars || false,
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
export const useGetPivotTableQuery = ({
  dataSet,
  dataOptionsInternal,
  filters,
  refreshCounter,
}: {
  dataSet?: DataSource;
  dataOptionsInternal: PivotTableDataOptionsInternal;
  filters?: Filter[] | FilterRelations;
  refreshCounter?: number;
}) => {
  const jaqlRef = useRef<JaqlRequest | null>(null);
  const { rows, columns, values, grandTotals } = getPivotQueryOptions(dataOptionsInternal);

  // retrieve the Jaql query without executing it
  const onBeforeQuery = useCallback(
    (query: JaqlRequest) => {
      jaqlRef.current = query;
    },
    // forces 'onBeforeQuery' callback to be recreated on 'refreshCounter' change in order to refresh the jaql
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshCounter],
  );

  const queryParams: ExecutePivotQueryParams = {
    dataSource: dataSet,
    rows,
    columns,
    values,
    grandTotals,
    filters,
    onBeforeQuery,
  };
  const { isLoading, isSuccess, isError, error } = useExecutePivotQueryInternal(queryParams);

  return { isLoading, isSuccess, isError, error, jaql: jaqlRef.current };
};
