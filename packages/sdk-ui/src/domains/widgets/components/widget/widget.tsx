import { CommonWidget } from '../common-widget';
import { WidgetProps } from './types';

/**
 * Facade component that renders a widget within a dashboard based on the widget type.
 *
 * @group Dashboards
 */
export const Widget: React.FC<WidgetProps> = (widgetProps) => {
  return <CommonWidget key={widgetProps.id} {...widgetProps} />;
};
