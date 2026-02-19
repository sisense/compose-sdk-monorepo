import {
  isChartWidgetProps,
  isCustomWidgetProps,
  isPivotTableWidgetProps,
  isTextWidgetProps,
} from '@/domains/widgets/components/widget-by-id/utils';
import { MenuProvider } from '@/infra/contexts/menu-provider/menu-provider';

import { ChartWidget } from '../chart-widget';
import { CustomWidget } from '../custom-widget';
import { PivotTableWidget } from '../pivot-table-widget';
import { TextWidget } from '../text-widget';
import { CommonWidgetProps } from './types';

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
