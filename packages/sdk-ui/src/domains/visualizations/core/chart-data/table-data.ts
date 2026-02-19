import {
  Attribute,
  CalculatedMeasureColumn,
  Column,
  MeasureColumn,
  Sort,
  SortDirection,
} from '@sisense/sdk-data';
import { convertSortDirectionToSort } from '@sisense/sdk-data';

import { isMeasureColumn } from '@/domains/visualizations/core/chart-data-options/utils';

import {
  StyledColumn,
  StyledMeasureColumn,
  TableDataOptionsInternal,
} from '../chart-data-options/types';
import {
  DataTable,
  Column as DataTableColumn,
  emptyTable,
  getColumnByName,
  getColumnsByName,
  selectColumns,
} from '../chart-data-processor/table-processor';

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
    column: getSortedColumn(styledColumn.column, sort),
  };
};

/**
 * Returns the sorted column based on the sort type
 * If the column is not sortable, it returns the column as is
 */
function getSortedColumn(
  column: Column | MeasureColumn | CalculatedMeasureColumn,
  sortType: Sort,
): Column | MeasureColumn | CalculatedMeasureColumn {
  return isSortableColumn(column) ? sortColumn(column, sortType) : column;
}

/**
 * Sorts the column based on the sort type
 */
function sortColumn(column: SortableColumn, sortType: Sort): SortableColumn {
  const sortedColumn: SortableColumn = column.sort(sortType);
  if (isMeasureColumn(sortedColumn) && isMeasureColumn(column)) {
    sortedColumn.title = column.title; // keep the original title
  }
  return sortedColumn;
}

/**
 * Column that inherits sort function from Attribute
 */
type SortableColumn = (Column | MeasureColumn | CalculatedMeasureColumn) & {
  sort: Attribute['sort'];
};

/**
 * Type guard to check if the column is sortable
 */
function isSortableColumn(
  column: Column | MeasureColumn | CalculatedMeasureColumn,
): column is SortableColumn {
  return 'sort' in column && typeof (column as Attribute).sort === 'function';
}

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
