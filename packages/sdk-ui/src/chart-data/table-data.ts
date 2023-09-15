import {
  Column as DataTableColumn,
  DataTable,
  emptyTable,
  getColumnByName,
  getColumnsByName,
  selectColumns,
} from '../chart-data-processor/table-processor';
import { Category, TableDataOptionsInternal, Value } from '../chart-data-options/types';
import { Attribute, Sort } from '@sisense/sdk-data';
import { translateColumnToCategoryOrValue } from '../chart-data-options/utils';

const flatResults = (dimensions: string[], sourceTable: DataTable): DataTable => {
  if (emptyTable(sourceTable)) {
    return { rows: [], columns: [] };
  }
  // create sortable table from row column data
  const tableColumns = getColumnsByName(sourceTable, dimensions);
  // select columns from source table without any aggregation
  return selectColumns(sourceTable, tableColumns);
};

export const unifySortToDirection = (category: Category | Value): number => {
  const isAttribute = 'getSort' in category;
  const sort = isAttribute ? (category as Attribute).getSort() : category.sortType;
  switch (sort) {
    case 'sortAsc':
    case Sort.Ascending:
      return 1;
    case 'sortDesc':
    case Sort.Descending:
      return -1;
    default:
      return 0;
  }
};

export const syncDataTableWithDataOptionsSort = (
  chartDataOptions: TableDataOptionsInternal,
  dataTable: DataTable,
) => {
  const sortedColumn = chartDataOptions.columns.find((c) => unifySortToDirection(c) !== 0);

  if (sortedColumn) {
    const tableColumn = getColumnByName(dataTable, sortedColumn.name);
    if (tableColumn) {
      tableColumn.direction = unifySortToDirection(sortedColumn);
    }
  }

  return dataTable;
};

export const updateInnerDataOptionsSort = (
  dataOptions: TableDataOptionsInternal,
  sortColumn: DataTableColumn,
): TableDataOptionsInternal => {
  return {
    columns: dataOptions.columns.map((column) => {
      const isElementBased = 'getSort' in column;
      const isNewSortedColumn = column.name === sortColumn.name;
      const currentDirection = unifySortToDirection(column);

      if (isElementBased) {
        const newSort = currentDirection === 1 ? Sort.Descending : Sort.Ascending;

        return translateColumnToCategoryOrValue({
          ...(column as Category),
          column: (column as Attribute).sort(isNewSortedColumn ? newSort : Sort.None),
        });
      } else {
        const newSort = currentDirection === 1 ? 'sortDesc' : 'sortAsc';
        return translateColumnToCategoryOrValue({
          ...column,
          sortType: isNewSortedColumn ? newSort : 'sortNone',
          column: column,
        });
      }
    }),
  };
};

// Given table of data and options, table data
export const tableData = (
  chartDataOptions: TableDataOptionsInternal,
  dataTable: DataTable,
): DataTable => {
  const tableChartData: DataTable = flatResults(
    chartDataOptions.columns.map((c) => c.name),
    dataTable,
  );

  return syncDataTableWithDataOptionsSort(chartDataOptions, tableChartData);
};
