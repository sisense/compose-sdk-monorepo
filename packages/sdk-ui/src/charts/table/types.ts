import { TableDataOptionsInternal } from '../../chart-data-options/types';
import { Column, DataTable } from '../../chart-data-processor/table-processor';
import {
  TableColorOptions,
  TableDesignOptions,
} from '../../chart-options-processor/translations/design-options';
import { CompleteThemeSettings } from '../../types';

/**
 * Properties needed to setup Table
 *
 * @internal
 */
export type TableProps = {
  /**
   * Explicit Data, which is made up of an array of columns and a two-dimensional array of data cells.
   *
   */
  dataTable: DataTable;
  /**
   * Configurations for how to interpret and present the data passed to the chart
   *
   * @category Chart
   */
  dataOptions: TableDataOptionsInternal;
  /**
   * Configuration that defines functional style of the various chart elements
   *
   */
  designOptions?: TableDesignOptions;
  themeSettings: CompleteThemeSettings;
  /**
   * Callback that calls when sort of column triggered
   *
   */
  onSortUpdate: (column: Column) => void;
  /**
   * Define width of table
   *
   */
  width?: number;
  /**
   * Define height of table
   *
   */
  height?: number;
};

export type DataTableWrapperProps = {
  dataTable: DataTable;
  dataOptions: TableDataOptionsInternal;
  height: number;
  width: number;
  customStyles?: TableCustomStyles;
  themeSettings: CompleteThemeSettings;
  onSortUpdate: (column: Column) => void;
};

export type TableCustomStyles = {
  showFieldTypeIcon?: boolean;
  sortIcon?: 'caret' | 'standard';
  headerHeight?: number;
  rowHeight?: number;
  paddingVertical?: number;
  paddingHorizontal?: number;
  header?: {
    color?: TableColorOptions;
  };
  columns?: {
    alternatingColor?: TableColorOptions;
    width?: 'auto' | 'content';
  };
  rows?: {
    alternatingColor?: TableColorOptions;
  };
};

export type TableReducerState = {
  sortedDataTable: DataTable;
  sortedColumn: Column | undefined;
  sortColumns: Column[];
};

export type TableReducerBaseAction = { type: 'sortBy'; column: Column };

export type TableReducerResetAction = {
  type: 'reset';
  dataTable: DataTable;
  defaultSortColumn?: Column;
};

export type TableReducerAction = TableReducerBaseAction | TableReducerResetAction;

export type TableReducerStateWithItems = TableReducerState & { items: readonly any[] };

export type TableReducerActionWithItems =
  | TableReducerBaseAction
  | (TableReducerResetAction & { items: readonly any[] });
