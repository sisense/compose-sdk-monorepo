import { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';

import { CustomWidgetEventProps, CustomWidgetStyleOptions, GenericDataOptions } from '@/types';

import { WidgetConfig } from '../widget/types';

/**
 * Props for the Custom Widget component
 */
export interface CustomWidgetProps extends CustomWidgetEventProps {
  /**
   * Custom widget type. This is typically the name/ID of the custom widget.
   *
   * @category Widget
   */
  customWidgetType: string;

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
  dataOptions: GenericDataOptions;

  /**
   * Style options for the custom widget.
   *
   * @category Widget
   */
  styleOptions?: CustomWidgetStyleOptions;

  /**
   * Widget configuration (e.g. header toolbar menu)
   *
   * @category Widget
   * @internal
   */
  config?: WidgetConfig;

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
   * Specific options for the custom widget.
   *
   * @category Widget
   */
  customOptions?: Record<string, any>;
}
