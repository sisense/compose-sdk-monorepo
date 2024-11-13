import {
  isChartWidgetProps,
  isPivotTableWidgetProps,
  isPluginWidgetProps,
  isTextWidgetProps,
} from '@/widget-by-id/utils';
import { CommonWidgetProps } from '@/props';
import { PivotTableWidget } from '@/widgets/pivot-table-widget';
import { ChartWidget } from '@/widgets/chart-widget';
import { TextWidget } from '@/widgets/text-widget';
import { PluginWidget } from '@/widgets/plugin-widget';
import { MenuProvider } from '@/common/components/menu/menu-provider';

/**
 * Facade component that renders a widget within a dashboard based on the widget type.
 *
 * @group Dashboards
 * @internal
 */
export const CommonWidget: React.FC<CommonWidgetProps> = (widgetProps) => {
  return (
    <MenuProvider onBeforeMenuOpen={widgetProps.onBeforeMenuOpen}>
      {isPluginWidgetProps(widgetProps) && <PluginWidget {...widgetProps} />}
      {isPivotTableWidgetProps(widgetProps) && <PivotTableWidget {...widgetProps} />}
      {isTextWidgetProps(widgetProps) && <TextWidget {...widgetProps} />}
      {isChartWidgetProps(widgetProps) && (
        <ChartWidget {...widgetProps} highlightSelectionDisabled={true} />
      )}
    </MenuProvider>
  );
};
