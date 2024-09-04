import { useCallback, useState } from 'react';
import { type JaqlRequest } from '@sisense/sdk-pivot-client';
import type { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';

import { normalizePivotSort } from '../sorting-utils';
import isEqual from 'lodash-es/isEqual';
import { ExecutePivotQueryParams } from '@/query-execution';
import { translateCategoryToAttribute, translateValueToMeasure } from '@/chart-data-options/utils';
import { Category, PivotTableDataOptionsInternal, Value } from '@/chart-data-options/types';
import { useExecutePivotQueryInternal } from '@/query-execution/use-execute-pivot-query';

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
  const { rows, columns, values, grandTotals } = getPivotQueryOptions(dataOptionsInternal);

  // retrieve the Jaql query without executing it
  const onBeforeQuery = useCallback(
    (query: JaqlRequest) => {
      setJaql((prevJaql) => {
        return isEqual(prevJaql, query) ? prevJaql : query;
      });
    },
    [setJaql],
  );

  const queryParams: ExecutePivotQueryParams = {
    dataSource: dataSet,
    rows,
    columns,
    values,
    grandTotals,
    filters,
    highlights,
    onBeforeQuery,
  };
  const { error } = useExecutePivotQueryInternal(queryParams);

  return { jaql, error };
};
