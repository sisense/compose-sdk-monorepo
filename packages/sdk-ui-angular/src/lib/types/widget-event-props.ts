import { TextWidgetDataPointEventHandler } from './data-point';

/**
 * Event props for Text widget
 */
export interface TextWidgetEventProps {
  /**
   * {@inheritDoc @ethings-os/sdk-ui!TextWidgetProps.onDataPointClick}
   *
   * @category Callbacks
   * @internal
   */
  dataPointClick?: TextWidgetDataPointEventHandler;
}
