import { ReactNode } from 'react';

import { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';

import { TableDataOptions } from '@/domains/visualizations/core/chart-data-options/types';
import { TableWidgetStyleOptions } from '@/types';

/**
 * Props for the {@link TableWidget} component
 *
 * @internal
 */
export interface TableWidgetProps {
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
   * Configurations for how to interpret and present the data passed to the table
   *
   * @category Chart
   */
  dataOptions: TableDataOptions;

  /**
   * Style options for both the table and widget including the widget header
   *
   * @category Widget
   */
  styleOptions?: TableWidgetStyleOptions;

  /**
   * React nodes to be rendered at the top of component, before the table
   *
   * @category Widget
   */
  topSlot?: ReactNode;

  /**
   * React nodes to be rendered at the bottom of component, after the table
   *
   * @category Widget
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
}
