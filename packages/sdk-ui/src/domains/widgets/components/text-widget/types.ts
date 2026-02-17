import type { TextWidgetDataPointEventHandler } from '@/props';
import { TextWidgetStyleOptions } from '@/types';

import { WidgetConfig } from '../widget/types';

/**
 * Props for the `TextWidget` component.
 */
export interface TextWidgetProps {
  /**
   * Style options for the text widget.
   *
   * @category Widget
   */
  styleOptions: TextWidgetStyleOptions;

  /**
   * A callback that allows you to customize what happens when a text widget is clicked.
   * Since TextWidget doesn't have specific data points, this fires when clicking anywhere on the widget.
   *
   * @category Callbacks
   * @internal
   */
  onDataPointClick?: TextWidgetDataPointEventHandler;

  /**
   * Widget configuration (e.g. header toolbar menu)
   *
   * @category Widget
   * @internal
   */
  config?: WidgetConfig;
}
