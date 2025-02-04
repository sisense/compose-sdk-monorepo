import { filterFactory, measureFactory } from '@sisense/sdk-data';
import { render, renderHook } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import {
  ChartWidgetProps,
  WidgetProps,
  useComposedDashboard,
  Widget,
  SisenseContextProvider,
  SisenseContextProviderProps,
} from '../index.js';
import { MenuProvider } from '@/common/components/menu/menu-provider.js';
import { isTextWidgetProps } from '@/widgets/text-widget.js';
import { totalCostByAgeRangeJaqlResult } from './__mocks__/jaql-responce-mock.js';

/**
 * Helper function to get property from widget props
 */
const getProperty = (widget: WidgetProps, key: keyof WidgetProps | keyof ChartWidgetProps) => {
  return isTextWidgetProps(widget) ? (key === 'dataOptions' ? {} : []) : widget[key];
};

import { mockToken, mockUrl, server } from '@/__mocks__/msw';

const contextProviderProps: SisenseContextProviderProps = {
  url: mockUrl,
  token: mockToken,
  defaultDataSource: DM.DataSource,
  appConfig: {
    queryCacheConfig: { enabled: false },
    trackingConfig: { enabled: false },
  },
};

const mockJaqlApi = () => {
  server.use(
    http.post('*/api/datasources/Sample%20ECommerce/jaql', () =>
      HttpResponse.json(totalCostByAgeRangeJaqlResult),
    ),
  );
};

describe('useComposedDashboard', () => {
  let widgetPropsMock: WidgetProps;
  beforeEach(() => {
    widgetPropsMock = {
      id: 'widget-1',
      widgetType: 'chart',
      chartType: 'polar',
      dataOptions: {
        category: [DM.Commerce.AgeRange],
        value: [measureFactory.sum(DM.Commerce.Cost)],
      },
      filters: [filterFactory.members(DM.Commerce.Gender, ['Female'])],
      highlights: [],
    };

    vi.clearAllMocks();
    mockJaqlApi();
  });

  it('should initialize with widgets and filters', () => {
    const filters = [filterFactory.members(DM.Commerce.AgeRange, ['35-44', '45-54', '55-64'])];
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

  it.skip('should add menu options from common filters to drilldown menu', async () => {
    const PseudoDashboard = () => {
      const { dashboard } = useComposedDashboard({
        widgets: [
          { ...widgetPropsMock, drilldownOptions: { drilldownPaths: [DM.Commerce.Gender] } },
        ],
        filters: [filterFactory.members(DM.Commerce.AgeRange, ['35-44'])],
      });

      return (
        <div>
          {dashboard.widgets.map((widget) => (
            <Widget key={widget.id} {...widget} />
          ))}
        </div>
      );
    };

    const result = render(
      <SisenseContextProvider {...contextProviderProps}>
        <PseudoDashboard />
      </SisenseContextProvider>,
    );
    const widget = await result.findByLabelText('chart-root');

    expect(widget).toBeInTheDocument();
    // open menu with right click on widget
    const chartPoints = widget.querySelectorAll('path.highcharts-point');
    // hover over the first point
    await userEvent.hover(chartPoints[0]);
    // open menu with right click on widget
    await userEvent.pointer({ keys: '[MouseRight]', target: chartPoints[0] });
    const menu = await result.findByRole('menu');
    expect(menu).toBeInTheDocument();
    // drilldown menu should have 2 items
    expect(result.queryAllByRole('menuitem')).toHaveLength(2);
  });
});
