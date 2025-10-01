import type {
  JaqlPanel,
  JaqlRequest,
  PivotDataNode,
  PivotTreeNode,
} from '@ethings-os/sdk-pivot-client';
import { AnyColumn } from '@/chart-data-options/types';

/**
 * Formatting result that can be applied to a header cell
 */
export interface CellFormattingResult {
  /** Text content to display in the cell */
  content?: string;

  /** Inline styles to apply to the cell */
  style?: React.CSSProperties;
}

/**
 * Data cell formatter that returns formatting information instead of mutating parameters
 */
export type DataCellFormatter = (
  cell: PivotDataNode,
  rowItem: PivotTreeNode,
  columnItem: PivotTreeNode,
  jaqlPanelItem: JaqlPanel,
) => CellFormattingResult | void;

/**
 * Applies custom formatting to pivot table data cells.
 *
 * This function is called for each data cell in the pivot table and can return
 * formatting information to customize the cell's appearance and behavior.
 *
 * @param cell - The pivot data cell being formatted
 * @param jaqlPanelItem - JAQL panel metadata for the cell
 * @param dataOption - The data option configuration for this cell
 * @param id - Unique identifier for the data option
 * @returns Formatting result object or void to skip formatting
 */
export type CustomDataCellFormatter = (
  cell: PivotDataNode,
  jaqlPanelItem: JaqlPanel,
  dataOption: AnyColumn,
  id: string,
) => CellFormattingResult | void;

/**
 * Header cell formatter that returns formatting information instead of mutating parameters
 */
export type HeaderCellFormatter = (
  cell: PivotTreeNode,
  jaqlPanelItem: JaqlPanel,
  jaql: JaqlRequest,
) => CellFormattingResult | void;

/**
 * Applies custom formatting to pivot table header cells.
 *
 * This function is called for each row and column header cell in the pivot table
 * and can return formatting information to customize the header's appearance and behavior.
 *
 * @param cell - The pivot header cell being formatted
 * @param jaqlPanelItem - JAQL panel metadata for the cell (may be undefined for certain header types)
 * @param dataOption - The data option configuration for this cell (optional)
 * @param id - Unique identifier for the data option (optional)
 * @returns Formatting result object or void to skip formatting
 */
export type CustomHeaderCellFormatter = (
  cell: PivotTreeNode,
  jaqlPanelItem: JaqlPanel | undefined,
  dataOption?: AnyColumn,
  id?: string,
) => CellFormattingResult | void;
