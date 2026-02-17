import { ReactNode } from 'react';

import { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';

import type {
  CustomDataCellFormatter,
  CustomHeaderCellFormatter,
} from '@/domains/visualizations/components/pivot-table/formatters/types';
import { PivotTableDataOptions } from '@/domains/visualizations/core/chart-data-options/types';
import type { PivotTableDataPointEventHandler } from '@/props';
import { PivotTableDrilldownOptions, PivotTableWidgetStyleOptions } from '@/types';

import { WidgetConfig } from '../widget/types';

/**
 * Props for the {@link PivotTableWidget} component
 */
export interface PivotTableWidgetProps {
  /**
   * Data source the query is run against - e.g. `Sample ECommerce`
   *
   * If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.
   *
   * @category Data
   */
  dataSource?: DataSource;

  /**
   * Filters that will slice query results
   *
   * @category Data
   */
  filters?: Filter[] | FilterRelations;

  /**
   * Filters that will highlight query results
   *
   * @category Data
   */
  highlights?: Filter[];

  /**
   * Configurations for how to interpret and present the data passed to the table
   *
   * @category Chart
   */
  dataOptions: PivotTableDataOptions;

  /**
   * Style options for both the table and widget including the widget header
   *
   * @category Widget
   */
  styleOptions?: PivotTableWidgetStyleOptions;

  /**
   * Widget configuration (e.g. header toolbar menu)
   *
   * @category Widget
   * @internal
   */
  config?: WidgetConfig;

  /**
   * React nodes to be rendered at the top of component, before the table
   *
   * @category Widget
   * @internal
   */
  topSlot?: ReactNode;

  /**
   * React nodes to be rendered at the bottom of component, after the table
   *
   * @category Widget
   * @internal
   */
  bottomSlot?: ReactNode;

  /**
   * Title of the widget
   *
   * @category Widget
   */
  title?: string;

  /**
   *  Description of the widget
   *
   * @category Widget
   */
  description?: string;

  /**
   * Configuration for the pivot table drilldown
   *
   * @category Widget
   */
  drilldownOptions?: PivotTableDrilldownOptions;

  /**
   * Callback function that is called when the pivot table cell is clicked
   *
   * @category Callbacks
   */
  onDataPointClick?: PivotTableDataPointEventHandler;

  /**
   * Callback function that is called when the pivot table cell is right-clicked
   *
   * @category Callbacks
   */
  onDataPointContextMenu?: PivotTableDataPointEventHandler;

  /**
   * Applies custom styling and behavior to pivot table data cells.
   *
   * This formatter function returns formatting objects instead of mutating parameters,
   * following functional programming principles. Use this single callback to combine
   * multiple handlers and control the call sequence from outside the pivot.
   *
   * @example
   * ```typescript
   * const customDataFormatter: CustomDataCellFormatter = (cell, jaqlPanelItem, dataOption, id) => {
   *   if (cell.value > 1000) {
   *     return {
   *       style: { backgroundColor: 'lightgreen' },
   *       content: `${cell.value} (High)`
   *     };
   *   }
   * };
   * ```
   *
   * @internal
   */
  onDataCellFormat?: CustomDataCellFormatter;

  /**
   * Applies custom styling and behavior to pivot table row and column headers.
   *
   * This formatter function returns formatting objects instead of mutating parameters,
   * following functional programming principles. Use this single callback to combine
   * multiple handlers and control the call sequence from outside the pivot.
   *
   * @example
   * ```typescript
   * const customHeaderFormatter: CustomHeaderCellFormatter = (cell, jaqlPanelItem, dataOption, id) => {
   *   if (cell.content === 'Total') {
   *     return {
   *       style: { fontWeight: 'bold', color: 'blue' },
   *       className: 'total-header'
   *     };
   *   }
   * };
   * ```
   *
   * @internal
   */
  onHeaderCellFormat?: CustomHeaderCellFormatter;
  /** @internal */
  onChange?: (props: Partial<PivotTableWidgetProps>) => void;
}
