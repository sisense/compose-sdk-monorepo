/* eslint-disable max-params */
import { CalculatedMeasureColumn, Column, MeasureColumn } from '@ethings-os/sdk-data';
import union from 'lodash-es/union';
import { DataColumnNamesMapping } from '../chart-data-options/validate-data-options';
import { rownumColumnName } from '../chart-data-processor/table-creators';
import {
  DataTable,
  emptyTable,
  getColumnByName,
  getColumnsByName,
  groupBy,
  orderBy,
} from '../chart-data-processor/table-processor';
import { TranslatableError } from '@/translation/translatable-error';

// when user supplies chart data, ensure only
// one measure value exists per row of unique attributes
export const filterAndAggregateChartData = (
  sourceTable: DataTable,
  attributes: Column[],
  measures: (MeasureColumn | CalculatedMeasureColumn)[],
  dataColumnNamesMapping: DataColumnNamesMapping = {},
  //filters?: IFilter,
  //locale?: Locale,
): DataTable => {
  if (emptyTable(sourceTable)) {
    return { rows: [], columns: [] };
  }

  const uniqueColumnsForGroupBy = union(
    getColumnsByName(
      sourceTable,
      attributes.map((d) => d.name),
    ),
  );

  //TODO implement filters when user supplies data
  const filteredTable = sourceTable;
  const measuresColumns = measures.map((value) => ({
    // uses original data column name
    column: dataColumnNamesMapping[value.name] ?? value.name,
    title: value.name,
    agg: (value as MeasureColumn).aggregation ?? 'sum', // only simple aggregations
  }));

  // add min value of row num, will be used to preserve original order
  const measuresWithRownum = [
    ...measuresColumns,
    { column: rownumColumnName, title: rownumColumnName, agg: 'min' },
  ];

  const aggregatedTable = groupBy(filteredTable, uniqueColumnsForGroupBy, measuresWithRownum);

  const rownumColumn = getColumnByName(aggregatedTable, rownumColumnName);
  if (!rownumColumn) {
    // this should not happen, we add a row num when creating DataTable
    throw new TranslatableError('errors.noRowNumColumn');
  }

  // put rows back into the original order
  return orderBy(aggregatedTable, [rownumColumn]);
};
