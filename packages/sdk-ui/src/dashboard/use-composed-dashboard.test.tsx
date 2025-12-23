import React, { act, useMemo } from 'react';

import { Attribute, Filter, filterFactory, Measure, measureFactory } from '@sisense/sdk-data';
import { render, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { mockToken, mockUrl, server } from '@/__mocks__/msw';
import { chartMocksManager } from '@/__test-helpers__/mock-chart-component';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { MenuProvider } from '@/common/components/menu/menu-provider.js';
import { ModalProvider } from '@/common/components/modal/modal-provider.js';
import { FilterTile } from '@/filters';
import type { ChartWidgetProps, SisenseContextProviderProps, WidgetProps } from '@/props';
import { SisenseContextProvider } from '@/sisense-context/sisense-context-provider';
import { ThemeProvider } from '@/theme-provider';
import { getDefaultThemeSettings } from '@/theme-provider/default-theme-settings';
import { CartesianChartDataOptions, DataPoint } from '@/types.js';
import { isTextWidgetProps } from '@/widgets/text-widget.js';
import { Widget } from '@/widgets/widget';

import { totalCostByAgeRangeJaqlResult } from './__mocks__/jaql-responce-mock.js';
import { useComposedDashboard } from './use-composed-dashboard.js';

/**
 * Helper function to get property from widget props
 */
const getProperty = (widget: WidgetProps, key: keyof WidgetProps | keyof ChartWidgetProps) => {
  return isTextWidgetProps(widget) ? (key === 'dataOptions' ? {} : []) : widget[key];
};

const CombinedProvider = ({ children }: { children: React.ReactNode }) => (
  <MenuProvider>
    <ModalProvider>{children}</ModalProvider>
  </MenuProvider>
);

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
        wrapper: CombinedProvider,
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
            dataOption: firstChartDataOptions.category[0],
            attribute: firstChartDataOptions.category[0] as Attribute,
            value: '45-54',
            displayValue: '45-54',
          },
        ],
        value: [
          {
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
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clientX: 927,
        clientY: 433,
      } as unknown as PointerEvent);
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
              drilldownPaths: [DM.Commerce.AgeRange, DM.Commerce.Gender, DM.Commerce.Condition],
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
      expect(chartMocksManager.renderedCharts).toHaveLength(2);
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
              dataOption: firstChartDataOptions.category[0],
              attribute: firstChartDataOptions.category[0] as Attribute,
              value: '45-54',
              displayValue: '45-54',
            },
          ],
          value: [
            {
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

  describe('filter reference stability', () => {
    it('should not recreate filters when JTD-related props change (themeSettings)', async () => {
      // Use stable references for all props to isolate the theme change
      const stableInitialFilters = [filterFactory.members(DM.Commerce.AgeRange, ['35-44'])];

      const stableWidgetWithJtd = {
        ...widgetPropsMock,
        filters: [filterFactory.members(DM.Commerce.Gender, ['Female'])],
      } as WidgetProps;

      const stableWidgets = [stableWidgetWithJtd];

      const stableWidgetsOptions = {
        'widget-1': {
          jtdConfig: {
            enabled: true,
            targets: [{ id: 'test-dashboard', caption: 'Test Dashboard' }],
            interaction: { triggerMethod: 'rightclick' as const },
          },
        },
      };

      // Track widget and filter references across renders
      let capturedRefs: {
        widgetFilters: Filter[];
        dashboardFilters: Filter[];
        widgetHighlights: Filter[];
      } | null = null;

      const TestComponent = () => {
        const { dashboard } = useComposedDashboard({
          widgets: stableWidgets,
          filters: stableInitialFilters,
          widgetsOptions: stableWidgetsOptions,
        });

        // Capture filter references
        if (dashboard.widgets && dashboard.widgets.length > 0) {
          capturedRefs = {
            widgetFilters: getProperty(dashboard.widgets[0], 'filters'),
            dashboardFilters: dashboard.filters,
            widgetHighlights: getProperty(dashboard.widgets[0], 'highlights'),
          };
        }

        return <div data-testid="test-component">Test</div>;
      };

      // Use ThemeProvider to control themeSettings changes
      const initialTheme = getDefaultThemeSettings();
      let currentTheme = initialTheme;

      const ThemeWrapper = ({
        children,
        theme,
      }: {
        children: React.ReactNode;
        theme: typeof initialTheme;
      }) => (
        <ThemeProvider theme={theme} skipTracking>
          {children}
        </ThemeProvider>
      );

      const result = render(
        <SisenseContextProvider {...contextProviderProps}>
          <ThemeWrapper theme={currentTheme}>
            <CombinedProvider>
              <TestComponent />
            </CombinedProvider>
          </ThemeWrapper>
        </SisenseContextProvider>,
      );

      // Wait for initial render
      await waitFor(() => {
        expect(result.getByTestId('test-component')).toBeInTheDocument();
        expect(capturedRefs).not.toBeNull();
      });

      const initialRefs = capturedRefs!;

      // Change themeSettings (this affects connectToWidgetPropsJtd but NOT connectToWidgetProps)
      // The fix separates filter calculation (widgetsWithCommonFilters) from JTD application (widgetsWithFilterAndJtd)
      // So changing theme should only affect JTD handlers/styling, not filters
      currentTheme = {
        ...initialTheme,
        typography: {
          ...initialTheme.typography,
          hyperlinkColor: '#ff0000', // Change hyperlink color
        },
      };

      result.rerender(
        <SisenseContextProvider {...contextProviderProps}>
          <ThemeWrapper theme={currentTheme}>
            <CombinedProvider>
              <TestComponent />
            </CombinedProvider>
          </ThemeWrapper>
        </SisenseContextProvider>,
      );

      // Wait for rerender
      await waitFor(() => {
        expect(capturedRefs).not.toBeNull();
      });

      const afterThemeChangeRefs = capturedRefs!;

      // KEY ASSERTIONS:
      // Filters should maintain the SAME REFERENCE (not just equal content)
      // This proves that widgetsWithCommonFilters did not recalculate
      //
      // Note: If this test fails, it means something in the dependency chain is still changing.
      // The fix requires that widgetsOptions, widgets, and filters remain stable across renders.
      expect(afterThemeChangeRefs.widgetFilters).toBe(initialRefs.widgetFilters);
      expect(afterThemeChangeRefs.dashboardFilters).toBe(initialRefs.dashboardFilters);
      expect(afterThemeChangeRefs.widgetHighlights).toBe(initialRefs.widgetHighlights);
    });
  });
});
