import { TextWidgetDataPointEventHandler } from './data-point';

/**
 * Event props for Text widget
 */
export interface TextWidgetEventProps {
  /**
   * {@inheritDoc @sisense/sdk-ui!TextWidgetProps.onDataPointClick}
   *
   * @category Callbacks
   * @internal
   */
  dataPointClick?: TextWidgetDataPointEventHandler;
}
