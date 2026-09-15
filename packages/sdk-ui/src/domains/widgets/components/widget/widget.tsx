import { CommonWidget } from '../common-widget';
import { WidgetProps } from './types';

/**
 * Facade component that renders a widget within a dashboard based on the widget type.
 *
 * @example
 * ```tsx
 * import { measureFactory } from '@sisense/sdk-data';
 * import { Widget, WidgetProps } from '@sisense/sdk-ui';
 * import * as DM from './sample-ecommerce';
 *
 * const widgetProps: WidgetProps = {
 *   id: 'widget-1',
 *   widgetType: 'chart',
 *   chartType: 'indicator',
 *   dataOptions: { value: [measureFactory.sum(DM.Commerce.Cost)] },
 * };
 *
 * const CodeExample = () => <Widget {...widgetProps} />;
 *
 * export default CodeExample;
 * ```
 *
 * @group Dashboards
 */
export const Widget: React.FC<WidgetProps> = (widgetProps) => {
  return <CommonWidget key={widgetProps.id} {...widgetProps} />;
};
