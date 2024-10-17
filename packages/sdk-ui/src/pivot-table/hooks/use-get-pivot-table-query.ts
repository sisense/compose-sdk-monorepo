import { useCallback, useState } from 'react';
import { type JaqlRequest } from '@sisense/sdk-pivot-client';
import type { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';

import { normalizePivotSort } from '../sorting-utils';
import isEqual from 'lodash-es/isEqual';
import { ExecutePivotQueryParams } from '@/query-execution';
import { translateColumnToAttribute, translateColumnToMeasure } from '@/chart-data-options/utils';
import {
  PivotTableDataOptionsInternal,
  StyledColumn,
  StyledMeasureColumn,
} from '@/chart-data-options/types';
import { useExecutePivotQueryInternal } from '@/query-execution/use-execute-pivot-query';

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
