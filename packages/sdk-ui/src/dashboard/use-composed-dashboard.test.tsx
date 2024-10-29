import { filterFactory } from '@sisense/sdk-data';
import { renderHook } from '@testing-library/react';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import {
  CartesianChartDataOptions,
  ChartWidgetProps,
  WidgetProps,
  useComposedDashboard,
} from '../index.js';
import { MenuProvider } from '@/common/components/menu/menu-provider.js';
import { isTextWidgetProps } from '@/widgets/text-widget.js';

/**
 * Helper function to get property from widget props
 */
const getProperty = (widget: WidgetProps, key: keyof WidgetProps | keyof ChartWidgetProps) => {
  return isTextWidgetProps(widget) ? (key === 'dataOptions' ? {} : []) : widget[key];
};

describe('useComposedDashboard', () => {
  let widgetPropsMock: WidgetProps;
  beforeEach(() => {
    widgetPropsMock = {
      id: 'widget-1',
      widgetType: 'chart',
      chartType: 'column',
      dataOptions: {
        category: [DM.Commerce.AgeRange, DM.Commerce.Gender],
        value: [],
        breakBy: [],
      } as CartesianChartDataOptions,
      filters: [],
      highlights: [],
    };
  });

  it('should initialize with widgets and filters', () => {
    const filters = [filterFactory.members(DM.Commerce.AgeRange, ['0-18'])];
    const { result } = renderHook(
      () => useComposedDashboard({ widgets: [widgetPropsMock], filters }),
      {
        wrapper: MenuProvider,
      },
    );

    expect(result.current.dashboard.filters).toEqual(filters);

    const connectedWidget = result.current.dashboard.widgets[0];

    expect(getProperty(connectedWidget, 'highlights')).toEqual(filters);
    expect(getProperty(connectedWidget, 'filters')).toEqual(
      getProperty(widgetPropsMock, 'filters'),
    );
  });
});
