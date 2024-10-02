import {
  isPivotTableWidgetProps,
  isPluginWidgetProps,
  isTextWidgetProps,
} from '@/dashboard-widget/utils';
import { CommonWidgetProps } from '@/props';
import { PivotTableWidget } from '@/widgets/pivot-table-widget';
import { ChartWidget } from '@/widgets/chart-widget';
import { TextWidget } from '@/widgets/text-widget';
import { PluginWidget } from '@/widgets/plugin-widget';

/**
 * Facade component that renders a widget within a dashboard based on the widget type.
 *
 * @internal
 */
export const CommonWidget: React.FC<CommonWidgetProps> = (widgetProps) => {
  if (isPluginWidgetProps(widgetProps)) {
    return <PluginWidget {...widgetProps} />;
  } else if (isPivotTableWidgetProps(widgetProps)) {
    return <PivotTableWidget {...widgetProps} />;
  } else if (isTextWidgetProps(widgetProps)) {
    return <TextWidget {...widgetProps} />;
  } else {
    return <ChartWidget {...widgetProps} highlightSelectionDisabled={true} />;
  }
};
