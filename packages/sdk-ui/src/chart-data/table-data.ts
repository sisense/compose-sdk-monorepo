import {
  Column as DataTableColumn,
  DataTable,
  emptyTable,
  getColumnByName,
  getColumnsByName,
  selectColumns,
} from '../chart-data-processor/table-processor';
import {
  StyledColumn,
  StyledMeasureColumn,
  TableDataOptionsInternal,
} from '../chart-data-options/types';
import { Attribute, Sort } from '@sisense/sdk-data';

const flatResults = (dimensions: string[], sourceTable: DataTable): DataTable => {
  if (emptyTable(sourceTable)) {
    return { rows: [], columns: [] };
  }
  // create sortable table from row column data
  const tableColumns = getColumnsByName(sourceTable, dimensions);
  // select columns from source table without any aggregation
  return selectColumns(sourceTable, tableColumns);
};

export const unifySortToDirection = ({
  column,
  sortType,
}: StyledColumn | StyledMeasureColumn): number => {
  const isAttribute = 'getSort' in column;
  const sort = isAttribute ? (column as Attribute).getSort() : sortType;
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
    const tableColumn = getColumnByName(dataTable, sortedColumn.column.name);
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
    columns: dataOptions.columns.map((dataOption) => {
      const isNewSortedColumn = dataOption.column.name === sortColumn.name;
      const currentDirection = unifySortToDirection(dataOption);
      const newSortType = currentDirection === 1 ? 'sortDesc' : 'sortAsc';
      const newSortDirection = currentDirection === 1 ? Sort.Descending : Sort.Ascending;

      return {
        ...dataOption,
        sortType: isNewSortedColumn ? newSortType : 'sortNone',
        column:
          'sort' in dataOption.column
            ? (dataOption.column as Attribute).sort(
                isNewSortedColumn ? newSortDirection : Sort.None,
              )
            : dataOption.column,
      };
    }),
  };
};

// Given table of data and options, table data
export const tableData = (
  chartDataOptions: TableDataOptionsInternal,
  dataTable: DataTable,
): DataTable => {
  const tableChartData: DataTable = flatResults(
    chartDataOptions.columns.map(({ column: { name } }) => name),
    dataTable,
  );

  return syncDataTableWithDataOptionsSort(chartDataOptions, tableChartData);
};
