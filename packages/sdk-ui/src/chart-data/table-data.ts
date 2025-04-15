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
import { Attribute, Sort, SortDirection } from '@sisense/sdk-data';
import { convertSortDirectionToSort } from '@sisense/sdk-data';

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

/**
 * Updates the sort type of a styled column for table
 * This is needed because sorting for Table is done at the JAQL level (backend)
 * while sorting for other charts is done on the client side in CSDK. I am working on a fix for this
 *
 * @param styledColumn - The styled column to update
 * @returns The updated styled column
 * @internal
 */
export const updateStyledColumnSortForTable = (
  styledColumn: StyledColumn | StyledMeasureColumn,
): StyledColumn | StyledMeasureColumn => {
  if (!('sortType' in styledColumn)) {
    return styledColumn;
  }

  const sortDirection = styledColumn.sortType as SortDirection;
  const sort = convertSortDirectionToSort(sortDirection);

  return {
    ...styledColumn,
    sortType: sortDirection,
    column:
      'sort' in styledColumn.column
        ? (styledColumn.column as Attribute).sort(sort)
        : styledColumn.column,
  };
};

export const updateInnerDataOptionsSort = (
  dataOptions: TableDataOptionsInternal,
  sortColumn: DataTableColumn,
): TableDataOptionsInternal => {
  return {
    columns: dataOptions.columns.map((styledColumn) => {
      const isNewSortedColumn = styledColumn.column.name === sortColumn.name;

      const currentDirection = unifySortToDirection(styledColumn);
      const newSortType = !isNewSortedColumn
        ? 'sortNone'
        : currentDirection === 1
        ? 'sortDesc'
        : 'sortAsc';
      styledColumn.sortType = newSortType;

      return updateStyledColumnSortForTable(styledColumn);
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
