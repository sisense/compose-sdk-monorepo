import { Attribute, filterFactory, Measure, measureFactory } from '@sisense/sdk-data';
import { render, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import * as DM from '@/__test-helpers__/sample-ecommerce';

import { MenuProvider } from '@/common/components/menu/menu-provider.js';
import { isTextWidgetProps } from '@/widgets/text-widget.js';
import { mockToken, mockUrl, server } from '@/__mocks__/msw';
import { act, useMemo } from 'react';
import { chartMocksManager } from '@/__test-helpers__/mock-chart-component';
import type { ChartWidgetProps, SisenseContextProviderProps, WidgetProps } from '@/props';
import { useComposedDashboard } from './use-composed-dashboard.js';
import { SisenseContextProvider } from '@/sisense-context/sisense-context-provider';
import { Widget } from '@/widgets/widget';
import { FilterTile } from '@/filters';
import { totalCostByAgeRangeJaqlResult } from './__mocks__/jaql-responce-mock.js';
import { CartesianChartDataOptions, DataPoint } from '@/types.js';

/**
 * Helper function to get property from widget props
 */
const getProperty = (widget: WidgetProps, key: keyof WidgetProps | keyof ChartWidgetProps) => {
  return isTextWidgetProps(widget) ? (key === 'dataOptions' ? {} : []) : widget[key];
};

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

const mockHierarchiesApi = () => {
  server.use(http.get('*/api/elasticubes/hierarchies', () => HttpResponse.json([])));
};

describe('useComposedDashboard', () => {
  let widgetPropsMock: WidgetProps;
  beforeAll(() => {
    chartMocksManager.mockChartComponent();
  });
  afterAll(() => {
    chartMocksManager.unmockChartComponent();
  });
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
    mockHierarchiesApi();
    chartMocksManager.clearMocks();
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

  it('should add menu options from common filters to drilldown menu', async () => {
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
    const chartMocks = await result.findAllByTestId('ChartMock');
    expect(chartMocksManager.renderedCharts).toHaveLength(1);
    expect(chartMocks).toHaveLength(1);

    // prepare data point mock
    const firstChartProps = chartMocksManager.renderedCharts[0].props;
    const firstChartDataOptions: CartesianChartDataOptions =
      firstChartProps.dataOptions as CartesianChartDataOptions;
    const dataPoint: DataPoint = {
      value: 4736826.749279762,
      categoryValue: '45-54',
      categoryDisplayValue: '45-54',
      entries: {
        category: [
          {
            id: 'category.0',
            dataOption: firstChartDataOptions.category[0],
            attribute: firstChartDataOptions.category[0] as Attribute,
            value: '45-54',
            displayValue: '45-54',
          },
        ],
        value: [
          {
            id: 'value.0',
            dataOption: firstChartDataOptions.value[0],
            measure: firstChartDataOptions.value[0] as Measure,
            value: 4736826.749279762,
            displayValue: '4.74M',
          },
        ],
        breakBy: [],
      },
    };

    // imitate opening context menu on some data point on the chart
    act(() => {
      chartMocksManager.renderedCharts[0].emitDataPointContextMenuOpen(dataPoint, {
        clientX: 927,
        clientY: 433,
      } as PointerEvent);
    });

    const menu = await result.findByRole('menu');
    expect(menu).toBeInTheDocument();
    // drilldown menu should have 2 items
    expect(result.queryAllByRole('menuitem')).toHaveLength(2);
  });

  describe('drilldown and crossfiltering', () => {
    it('should keep existing drilldown selection if filter applied by clicking on the chart', async () => {
      const PseudoDashboard = () => {
        const widgetProps: WidgetProps = useMemo(
          () => ({
            id: 'widget-1',
            widgetType: 'chart',
            chartType: 'polar',
            dataOptions: {
              category: [DM.Category.Category],
              value: [measureFactory.sum(DM.Commerce.Cost)],
            },
            filters: [],
            highlights: [],
            drilldownOptions: {
              drilldownDimensions: [
                DM.Commerce.AgeRange,
                DM.Commerce.Gender,
                DM.Commerce.Condition,
              ],
              drilldownSelections: [
                {
                  points: [
                    {
                      categoryValue: 'Cell Phones',
                    },
                  ],
                  nextDimension: DM.Commerce.AgeRange,
                },
              ],
            },
          }),
          [],
        );

        const dashboardFilters = useMemo(
          () => [filterFactory.members(DM.Commerce.Gender, ['Male'])],
          [],
        );

        const { dashboard, setFilters } = useComposedDashboard({
          widgets: [widgetProps],
          filters: dashboardFilters,
        });

        return (
          <div>
            {dashboard.widgets.map((widget) => (
              <Widget key={widget.id} {...widget} />
            ))}

            {dashboard.filters.map((filter) => (
              <FilterTile
                key={filter.name}
                filter={filter}
                onChange={(newFilter_) => {
                  const newFilter = newFilter_!;
                  const newFilters = dashboard.filters
                    .filter((f) => f.config.guid !== newFilter.config.guid)
                    .concat(newFilter);
                  setFilters(newFilters);
                }}
              />
            ))}
          </div>
        );
      };

      const result = render(
        <SisenseContextProvider {...contextProviderProps}>
          <PseudoDashboard />
        </SisenseContextProvider>,
      );
      const chartMocks = await result.findAllByTestId('ChartMock');
      const filterTiles = await result.findAllByLabelText('member-filter-tile');
      const drilldownBreadcrumbs = await result.findAllByLabelText('drilldown-breadcrumbs');

      expect(filterTiles).toHaveLength(1);
      expect(drilldownBreadcrumbs).toHaveLength(1);
      expect(chartMocksManager.renderedCharts).toHaveLength(1);
      expect(chartMocks).toHaveLength(1);

      // prepare data point mock
      const firstChartProps = chartMocksManager.renderedCharts[0].props;
      const firstChartDataOptions: CartesianChartDataOptions =
        firstChartProps.dataOptions as CartesianChartDataOptions;
      const dataPoint: DataPoint = {
        value: 4736826.749279762,
        categoryValue: '45-54',
        categoryDisplayValue: '45-54',
        entries: {
          category: [
            {
              id: 'category.0',
              dataOption: firstChartDataOptions.category[0],
              attribute: firstChartDataOptions.category[0] as Attribute,
              value: '45-54',
              displayValue: '45-54',
            },
          ],
          value: [
            {
              id: 'value.0',
              dataOption: firstChartDataOptions.value[0],
              measure: firstChartDataOptions.value[0] as Measure,
              value: 4736826.749279762,
              displayValue: '4.74M',
            },
          ],
          breakBy: [],
        },
      };

      // imitate click on some data point on the chart
      act(() => {
        chartMocksManager.renderedCharts[0].emitDataPointClick(dataPoint);
      });

      // new filter tile should be added to the dashboard UI
      expect(await result.findAllByLabelText('member-filter-tile')).toHaveLength(2);

      // drilldown breadcrumbs should be still visible
      expect(await result.findAllByLabelText('drilldown-breadcrumbs')).toHaveLength(1);
    });
  });
});
