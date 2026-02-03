import { WidgetProps } from '@/props';

import { CommonWidget } from './common-widget';

/**
 * Facade component that renders a widget within a dashboard based on the widget type.
 *
 * @group Dashboards
 */
export const Widget: React.FC<WidgetProps> = (widgetProps) => {
  return <CommonWidget key={widgetProps.id} {...widgetProps} />;
};
