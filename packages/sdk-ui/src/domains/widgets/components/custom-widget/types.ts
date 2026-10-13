import { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';

import type { CustomWidgetChangeEvent } from '@/domains/widgets/change-events';
import { CustomWidgetEventProps, CustomWidgetStyleOptions, GenericDataOptions } from '@/types';

import { CustomWidgetConfig } from '../widget/widget-config';

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
   * Configuration of the widget
   *
   * @category Widget
   */
  config?: CustomWidgetConfig;

  /**
   * Title of the widget
   *
   * @category Widget
   */
  title?: string;

  /**
   * Widget identifier
   *
   * Used to identify the widget when exporting its data (for example, the "Download as Excel" action).
   *
   * @category Widget
   */
  id?: string;

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

  /**
   * Callback for widget change events, the same channel as the other widget types.
   *
   * Emits `title/changed` from the header's inline title editor, and
   * `visualizationState/changed` wrapping each state update the plugin visualization
   * pushes through `CustomVisualizationProps.onChange`. The plugin itself never sees
   * this callback — it gets an adapter that keeps its `VisualizationStateUpdate` API.
   *
   * @category Widget
   * @internal
   */
  onChange?: (event: CustomWidgetChangeEvent) => void;
}
