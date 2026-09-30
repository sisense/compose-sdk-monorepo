import { useCallback, useMemo, useState } from 'react';

import type { DataSource, Filter, FilterRelations, Measure } from '@sisense/sdk-data';
import { getDateMeasureAggregation } from '@sisense/sdk-data';
import { type JaqlRequest } from '@sisense/sdk-pivot-query-client';
import { isMeasureSentAsDatetime } from '@sisense/sdk-query-client';
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

// Warned combinations, once per module load.
const reportedTotalsCalculations = new Set<string>();

/**
 * Warns that a totals calculation on a date measure is ignored, at most once per measure name,
 * aggregation and calculation, once per module load.
 *
 * @param measure - The date measure the calculation was set on.
 * @param aggregation - The min or max the measure is totalled with, or undefined when its formula
 * names none.
 * @param totalsCalculation - The calculation being dropped.
 */
const warnTotalsCalculationIgnored = (
  measure: Measure,
  aggregation: string | undefined,
  totalsCalculation: string,
): void => {
  // the aggregation is part of the identity because the notice names it, and two measures may
  // share a name while differing only in how they aggregate
  const key = JSON.stringify([measure.name, aggregation, totalsCalculation]);
  if (reportedTotalsCalculations.has(key)) {
    return;
  }
  reportedTotalsCalculations.add(key);
  console.warn(
    `The totals calculation "${totalsCalculation}" is ignored, because a date measure is only ` +
      `totalled with its own "${aggregation}" aggregation.`,
  );
};

/**
 * Translates one value data option into the pivot query's value descriptor.
 *
 * `getPivotMeasure` runs on every render of every pivot table, and the data options are usually an
 * inline literal, which is why the totals notice is deduplicated rather than emitted each time.
 *
 * @param dataOption - The value data option, already normalized.
 * @returns The measure plus the data bars and range colour request the query should carry.
 * `totalsCalculation` is passed through as given; the payload builder replaces it on a date measure.
 */
const getPivotMeasure = (dataOption: StyledMeasureColumn) => {
  const measure = translateColumnToMeasure(dataOption);
  // the same question the payload builder asks, so a granularity it still sends as a number keeps
  // its data bars, its range colour and the caller's totals calculation
  const isDate = isMeasureSentAsDatetime(measure);

  const { totalsCalculation } = dataOption;
  // a formula keeps its min or max in the expression, not in an `aggregation` field
  const dateAggregation = getDateMeasureAggregation(measure);
  if (isDate && dateAggregation && totalsCalculation && totalsCalculation !== dateAggregation) {
    warnTotalsCalculationIgnored(measure, dateAggregation, totalsCalculation);
  }

  return {
    measure,
    totalsCalculation,
    dataBars: !isDate && (dataOption.dataBars || false),
    shouldRequestMinMax: !isDate && (dataOption.color as RangeDataColorOptions)?.type === 'range',
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
