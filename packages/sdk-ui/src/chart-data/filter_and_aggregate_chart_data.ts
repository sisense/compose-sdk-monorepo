/* eslint-disable max-params */
import union from 'lodash/union';
import { Category, Value } from '../chart-data-options/types';
import { DataColumnNamesMapping } from '../chart-data-options/validate_data_options';
import { rownumColumnName } from '../chart-data-processor/table_creators';
import {
  DataTable,
  emptyTable,
  getColumnByName,
  getColumnsByName,
  groupBy,
  orderBy,
} from '../chart-data-processor/table_processor';

// when user supplies chart data, ensure only
// one measure value exists per row of unique attributes
export const filterAndAggregateChartData = (
  sourceTable: DataTable,
  attributes: Category[],
  measures: Value[],
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

  //TODO we have a ticket to implement filters when user supplies data
  // const filteredTable =
  // filters && locale ? filterBy(sourceTable, filters, locale) : sourceTable;
  const filteredTable = sourceTable;
  const measuresColumns = measures.map((value) => ({
    // uses original data column name
    column: dataColumnNamesMapping[value.name] ?? value.name,
    title: value.name,
    agg: value.aggregation ?? 'sum', // only simple aggregations
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
    throw new Error(`Unexpected data has no row num column`);
  }

  // put rows back into the original order
  return orderBy(aggregatedTable, [rownumColumn]);
};
