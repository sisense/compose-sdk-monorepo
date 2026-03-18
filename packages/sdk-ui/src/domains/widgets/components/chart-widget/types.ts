import { ReactNode } from 'react';

import { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';

import type {
  ChartWidgetChangeEvent,
  ChartWidgetDrilldownSelectionsChangedEvent,
} from '@/domains/widgets/change-events';
import type { ChartEventProps } from '@/props';
import { ChartDataOptions, ChartType, ChartWidgetStyleOptions, DrilldownOptions } from '@/types';

import { WidgetConfig } from '../widget/types';

export type { ChartWidgetChangeEvent, ChartWidgetDrilldownSelectionsChangedEvent };

/**
 * Props for the {@link ChartWidget} component
 *
 */
export interface ChartWidgetProps extends ChartEventProps {
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
   * Highlight filters that will highlight results that pass filter criteria
   *
   * @category Data
   */
  highlights?: Filter[];

  /**
   * Default chart type of each series
   *
   * @category Chart
   */
  chartType: ChartType;

  /**
   * Configurations for how to interpret and present the data passed to the chart
   *
   * @category Chart
   */
  dataOptions: ChartDataOptions;

  /**
   * Style options for both the chart and widget including the widget header
   *
   * @category Widget
   */
  styleOptions?: ChartWidgetStyleOptions;

  /**
   * List of categories to allow drilldowns on
   *
   * @category Widget
   */
  drilldownOptions?: DrilldownOptions;

  /**
   * Widget configuration (e.g. header toolbar menu)
   *
   * @category Widget
   * @internal
   */
  config?: WidgetConfig;

  /**
   * React nodes to be rendered at the top of component, before the chart
   *
   * @category Widget
   * @internal
   */
  topSlot?: ReactNode;

  /**
   * React nodes to be rendered at the bottom of component, after the chart
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
   * Boolean flag whether selecting data points triggers highlight filter of the selected data
   *
   * Recommended to turn on when the Chart Widget component is enhanced with data drilldown by the Drilldown Widget component
   *
   * If not specified, the default value is `false`
   *
   * @category Widget
   */
  highlightSelectionDisabled?: boolean;

  /**
   * Callback to receive widget change events.
   *
   * Invoked when the widget state changes (e.g. drilldown selections).
   * See {@link ChartWidgetChangeEvent} for event types.
   *
   * @param event - The change event that occurred
   * @internal
   */
  onChange?: (event: ChartWidgetChangeEvent) => void;
}
