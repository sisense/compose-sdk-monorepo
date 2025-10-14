import { MenuProvider } from '@/common/components/menu/menu-provider';
import { CommonWidgetProps } from '@/props';
import {
  isChartWidgetProps,
  isCustomWidgetProps,
  isPivotTableWidgetProps,
  isTextWidgetProps,
} from '@/widget-by-id/utils';
import { ChartWidget } from '@/widgets/chart-widget';
import { CustomWidget } from '@/widgets/custom-widget';
import { PivotTableWidget } from '@/widgets/pivot-table-widget';
import { TextWidget } from '@/widgets/text-widget';

/**
 * Facade component that renders a widget within a dashboard based on the widget type.
 *
 * @group Dashboards
 * @internal
 */
export const CommonWidget: React.FC<CommonWidgetProps> = (widgetProps) => {
  return (
    <MenuProvider onBeforeMenuOpen={widgetProps.onBeforeMenuOpen}>
      {isCustomWidgetProps(widgetProps) && <CustomWidget {...widgetProps} />}
      {isPivotTableWidgetProps(widgetProps) && <PivotTableWidget {...widgetProps} />}
      {isTextWidgetProps(widgetProps) && <TextWidget {...widgetProps} />}
      {isChartWidgetProps(widgetProps) && (
        <ChartWidget {...widgetProps} highlightSelectionDisabled={true} />
      )}
    </MenuProvider>
  );
};
