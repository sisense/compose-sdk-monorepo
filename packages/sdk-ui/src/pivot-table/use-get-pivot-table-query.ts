import { PivotTableProps } from '@/props';
import { type JaqlRequest } from '@sisense/sdk-pivot-client';
import { useCallback, useRef } from 'react';
import { ExecutePivotQueryParams } from '../query-execution';
import { useExecutePivotQueryInternal } from '../query-execution/use-execute-pivot-query';
import { Category, PivotTableDataOptionsInternal, Value } from '../chart-data-options/types';
import { translatePivotTableDataOptions } from '../chart-data-options/translate-data-options';
import { translateCategoryToAttribute, translateValueToMeasure } from '../chart-data-options/utils';

const getPivotAttribute = (category: Category) => {
  return {
    attribute: translateCategoryToAttribute(category),
    includeSubTotals: category.includeSubTotals || false,
  };
};

const getPivotMeasure = (value: Value) => {
  return {
    measure: translateValueToMeasure(value),
    totalsCalculation: value.totalsCalculation,
    dataBars: value.dataBars || false,
  };
};

const getPivotQueryOptions = (
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
export const useGetPivotTableQuery = ({ dataSet, dataOptions, filters }: PivotTableProps) => {
  const jaqlRef = useRef<JaqlRequest | null>(null);

  const dataOptionsInternal = translatePivotTableDataOptions(dataOptions);
  const { rows, columns, values, grandTotals } = getPivotQueryOptions(dataOptionsInternal);

  // retrieve the Jaql query without executing it
  const onBeforeQuery = useCallback((query: JaqlRequest) => {
    jaqlRef.current = query;
  }, []);

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
