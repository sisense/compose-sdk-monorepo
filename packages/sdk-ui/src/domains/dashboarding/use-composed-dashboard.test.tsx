import React, { act, useMemo } from 'react';

import { Attribute, Filter, filterFactory, Measure, measureFactory } from '@sisense/sdk-data';
import { render, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { mockToken, mockUrl, server } from '@/__mocks__/msw';
import { chartMocksManager } from '@/__test-helpers__/mock-chart-component';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { DashboardModule } from '@/domains/dashboarding/dashboard-module';
import { FilterTile } from '@/domains/filters/index.js';
import type { ChartWidgetProps } from '@/domains/widgets/components/chart-widget/types';
import { isTextWidgetProps } from '@/domains/widgets/components/text-widget/text-widget.js';
import type { WidgetProps } from '@/domains/widgets/components/widget/types';
import { Widget } from '@/domains/widgets/components/widget/widget';
import { WidgetHeaderMenuTargets } from '@/domains/widgets/shared/widget-header/widget-header-menu-targets';
import { MenuProvider } from '@/infra/contexts/menu-provider/menu-provider';
import { ModalProvider } from '@/infra/contexts/modal-provider/modal-provider.js';
import { SisenseContextProvider } from '@/infra/contexts/sisense-context/sisense-context-provider.js';
import { ThemeProvider } from '@/infra/contexts/theme-provider';
import { getDefaultThemeSettings } from '@/infra/contexts/theme-provider/default-theme-settings';
import { ModuleProvider } from '@/infra/modules';
import type { SisenseContextProviderProps } from '@/props';
import { CartesianChartDataOptions, DataPoint } from '@/types.js';

import { totalCostByAgeRangeJaqlResult } from './__mocks__/jaql-responce-mock.js';
import type { WidgetsPanelLayout } from './dashboard-model';
import {
  ComposableDashboardProps,
  ComposedDashboardResult,
  useComposedDashboard,
} from './use-composed-dashboard.js';

/**
 * Helper function to get property from widget props
 */
const getProperty = (widget: WidgetProps, key: keyof WidgetProps | keyof ChartWidgetProps) => {
  return isTextWidgetProps(widget)
    ? key === 'dataOptions'
      ? {}
      : []
    : // Dynamic property access across a widget-props union in a test helper; `any` mirrors the
      // previous (implicit-any) behavior so call sites can spread/index the result freely.
      (widget as any)[key];
};

const CombinedProvider = ({ children }: { children: React.ReactNode }) => (
  <ModuleProvider modules={[DashboardModule]}>
    <MenuProvider>
      <ModalProvider>{children}</ModalProvider>
    </MenuProvider>
  </ModuleProvider>
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
        breakBy: [],
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

  describe('returned dashboard config (tabbers wiring)', () => {
    it('omits `config` from the returned dashboard when none was provided', () => {
      const props: ComposableDashboardProps = { widgets: [widgetPropsMock] };
      const { result } = renderHook(() => useComposedDashboard(props), {
        wrapper: CombinedProvider,
      });

      // A dashboard that never had a config must not materialize an empty one.
      expect(result.current.dashboard.config).toBeUndefined();
    });

    it('surfaces the config (with its tabbers slice) on the returned dashboard from state', () => {
      const tabbers = { 'some-tabber': { tabs: [{ displayWidgetIds: ['widget-1'] }] } };
      const props: ComposableDashboardProps = { widgets: [widgetPropsMock], config: { tabbers } };
      const { result } = renderHook(() => useComposedDashboard(props), {
        wrapper: CombinedProvider,
      });

      // `config` comes from the internal (mutable-on-duplication) state, so a tabber's
      // show/hide mapping survives into the returned model.
      expect(result.current.dashboard.config?.tabbers).toEqual(tabbers);
    });
  });

  describe('edit-mode affordances require isEditing', () => {
    // `editMode.enabled` can now arrive as a permission-derived default, so it reaches consumers that
    // render widgets outside a `Dashboard` (e.g. `WidgetById`). Those consumers never set `isEditing`,
    // and this invariant is what keeps duplicate/rename from leaking into them.
    const editModeConfig = (isEditing?: boolean) => ({
      widgetsPanel: {
        editMode: {
          enabled: true,
          applyChangesAsBatch: { enabled: false },
          duplicateWidget: { enabled: true },
          renameWidget: { enabled: true },
          ...(isEditing === undefined ? {} : { isEditing }),
        },
      },
    });

    const composeWith = (config: ComposableDashboardProps['config']) =>
      renderHook(() => useComposedDashboard({ widgets: [widgetPropsMock], config }), {
        wrapper: CombinedProvider,
      }).result.current.dashboard.widgets[0];

    const menuItemIds = (widget: WidgetProps) =>
      (widget.config?.header?.menu?.items ?? []).map(({ id }) => id);

    const isTitleEditable = (widget: WidgetProps) => widget.config?.header?.title?.editing?.enabled;

    it('adds the duplicate and rename affordances while editing', () => {
      // Positive control: proves the assertions below observe the real affordances.
      const widget = composeWith(editModeConfig(true));

      expect(menuItemIds(widget)).toContain(WidgetHeaderMenuTargets.DuplicateWidget);
      expect(isTitleEditable(widget)).toBe(true);
    });

    it('adds neither affordance when isEditing is not set', () => {
      const widget = composeWith(editModeConfig());

      expect(menuItemIds(widget)).not.toContain(WidgetHeaderMenuTargets.DuplicateWidget);
      expect(isTitleEditable(widget)).toBeUndefined();
    });
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
              breakBy: [],
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
      const filterTiles = await result.findAllByTestId('csdk-filter-tile-container');
      const drilldownBreadcrumbs = await result.findAllByTestId('drilldown-breadcrumbs');

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
      expect(await result.findAllByTestId('csdk-filter-tile-container')).toHaveLength(2);

      // drilldown breadcrumbs should be still visible
      expect(await result.findAllByTestId('drilldown-breadcrumbs')).toHaveLength(1);
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
            widgetFilters: getProperty(dashboard.widgets[0], 'filters') as Filter[],
            dashboardFilters: dashboard.filters,
            widgetHighlights: getProperty(dashboard.widgets[0], 'highlights') as Filter[],
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

  describe('navigator scroll persistence integration', () => {
    const widgetWithNavigator: WidgetProps = {
      id: 'nav-widget',
      widgetType: 'chart',
      chartType: 'line',
      dataOptions: {
        category: [DM.Commerce.AgeRange],
        value: [measureFactory.sum(DM.Commerce.Cost)],
        breakBy: [],
      },
      filters: [],
      highlights: [],
      styleOptions: { navigator: { enabled: true } },
    };

    it('injects onScrollerChange into navigator when persistence is provided', () => {
      const persistence = {
        addWidget: vi.fn(),
        updateWidget: vi.fn().mockResolvedValue(undefined),
      };

      const { result } = renderHook(
        () => useComposedDashboard({ widgets: [widgetWithNavigator] }, { persistence }),
        { wrapper: CombinedProvider },
      );

      const widget = result.current.dashboard.widgets[0] as {
        styleOptions?: { navigator?: { onScrollerChange?: unknown } };
      };
      expect(widget.styleOptions?.navigator?.onScrollerChange).toBeTypeOf('function');
    });

    it('injects onScrollerChange even when persistence is not provided (optimistic apply only)', () => {
      const { result } = renderHook(
        () => useComposedDashboard({ widgets: [widgetWithNavigator] }),
        { wrapper: CombinedProvider },
      );

      const widget = result.current.dashboard.widgets[0] as {
        styleOptions?: { navigator?: { onScrollerChange?: unknown } };
      };
      expect(widget.styleOptions?.navigator?.onScrollerChange).toBeTypeOf('function');
    });

    it('gives each widget its own independent scroll handler', () => {
      const secondWidget: WidgetProps = {
        ...widgetWithNavigator,
        id: 'nav-widget-2',
      };
      const persistence = {
        addWidget: vi.fn(),
        updateWidget: vi.fn().mockResolvedValue(undefined),
      };

      const { result } = renderHook(
        () =>
          useComposedDashboard({ widgets: [widgetWithNavigator, secondWidget] }, { persistence }),
        { wrapper: CombinedProvider },
      );

      const [w1, w2] = result.current.dashboard.widgets as Array<{
        styleOptions?: { navigator?: { onScrollerChange?: unknown } };
      }>;
      expect(w1.styleOptions?.navigator?.onScrollerChange).toBeTypeOf('function');
      expect(w2.styleOptions?.navigator?.onScrollerChange).toBeTypeOf('function');
      expect(w1.styleOptions?.navigator?.onScrollerChange).not.toBe(
        w2.styleOptions?.navigator?.onScrollerChange,
      );
    });
  });

  describe('FilterWidget deletion removes the linked filter', () => {
    const layoutWith = (widgetIds: string[]): WidgetsPanelLayout => ({
      columns: [
        {
          widthPercentage: 100,
          rows: widgetIds.map((widgetId) => ({
            cells: [{ widthPercentage: 100, widgetId }],
          })),
        },
      ],
    });

    const makeFilterWidget = (id: string): WidgetProps =>
      ({
        id,
        widgetType: 'filter',
        attribute: DM.Commerce.Gender,
        filterType: 'members',
      } as unknown as WidgetProps);

    const getFilters = (r: { current: ComposedDashboardResult<ComposableDashboardProps> }) =>
      r.current.dashboard.filters as Filter[];

    it('drops the backing filter when the filter widget leaves the layout', async () => {
      const linkedFilter = filterFactory.members(DM.Commerce.Gender, ['Female']);
      const fw = makeFilterWidget('fw1');
      const chart = { ...widgetPropsMock, id: 'chart1' };

      const props = (layout: WidgetsPanelLayout): ComposableDashboardProps => ({
        widgets: [fw, chart],
        filters: [linkedFilter],
        widgetsOptions: { fw1: { filterWidgetOptions: { filterId: linkedFilter.config.guid } } },
        layoutOptions: { widgetsPanel: layout },
      });

      const { result, rerender } = renderHook(
        (p: ComposableDashboardProps) => useComposedDashboard(p),
        {
          wrapper: CombinedProvider,
          initialProps: props(layoutWith(['fw1', 'chart1'])),
        },
      );

      // On mount the filter is present (deletion effect must not fire on first render).
      expect(getFilters(result).some((f) => f.config.guid === linkedFilter.config.guid)).toBe(true);

      // Delete the filter widget: it leaves the layout but the widget object lingers
      // in the widgets array until the model syncs (mirrors the real delete path).
      rerender(props(layoutWith(['chart1'])));

      await waitFor(() => {
        expect(getFilters(result).some((f) => f.config.guid === linkedFilter.config.guid)).toBe(
          false,
        );
      });
      expect(result.current.filterWidgetLinkedIds).toEqual([]);
    });

    /**
     * The Fusion "Compose SDK compatible" contract, which is narrower than it looks: the host
     * bridge forwards `filters/updated` but DROPS `widget/dateLevelChanged`, so a level change
     * never reaches the widget's stored metadata — the host keeps pushing the dashboard back with
     * the widget at the level it was saved at. The committed level therefore has to be read from
     * the filter, which the host does round-trip; taking it from the widget attribute reverted a
     * Years commit to Quarters and re-published the year's member as a quarter.
     */
    it('keeps a committed level when the host echoes the widget back at the old one', async () => {
      const quartersFilter = filterFactory.members(DM.Commerce.Date.Quarters, [
        '2013-10-01T00:00:00',
      ]);
      const dateWidget = (attribute: Attribute): WidgetProps =>
        ({
          id: 'fw-date',
          widgetType: 'filter',
          attribute,
          filterType: 'members',
        } as unknown as WidgetProps);

      const props = (filters: Filter[]): ComposableDashboardProps => ({
        // The host's copy of the widget never leaves Quarters — its level event was dropped.
        widgets: [dateWidget(DM.Commerce.Date.Quarters)],
        filters,
        widgetsOptions: {
          'fw-date': { filterWidgetOptions: { filterId: quartersFilter.config.guid } },
        },
        layoutOptions: { widgetsPanel: layoutWith(['fw-date']) },
      });

      const { result, rerender } = renderHook(
        (p: ComposableDashboardProps) => useComposedDashboard(p),
        {
          wrapper: CombinedProvider,
          initialProps: props([quartersFilter]),
        },
      );

      const widgetOf = (r: typeof result) =>
        r.current.dashboard.widgets[0] as unknown as {
          attribute: Attribute;
          filter: Filter | null;
          onChange: (event: { type: string; payload: Record<string, unknown> }) => void;
        };

      // The widget commits Years + 2009, reporting the level first and the selection second.
      const yearsAttribute = DM.Commerce.Date.Years;
      const committed = filterFactory.members(yearsAttribute, ['2009-01-01T00:00:00']);
      act(() => {
        widgetOf(result).onChange({
          type: 'dateLevel/changed',
          payload: { attribute: yearsAttribute },
        });
      });
      act(() => {
        widgetOf(result).onChange({ type: 'filter/changed', payload: { filter: committed } });
      });

      await waitFor(() => {
        expect(getFilters(result)).toHaveLength(1);
      });
      expect(getFilters(result)[0].attribute).toEqual(yearsAttribute);

      // The host applies the filters and pushes its dashboard back — widget still at Quarters.
      rerender(props(getFilters(result)));

      await waitFor(() => {
        expect(getFilters(result)).toHaveLength(1);
      });
      expect(getFilters(result)[0].attribute).toEqual(yearsAttribute);
      // And the widget is still handed the filter it committed, not nothing.
      expect(widgetOf(result).filter?.attribute).toEqual(yearsAttribute);
    });

    it('keeps the filter when the widget stays in the layout (no false positive)', async () => {
      const linkedFilter = filterFactory.members(DM.Commerce.Gender, ['Female']);
      const fw = makeFilterWidget('fw1');

      const props = (layout: WidgetsPanelLayout): ComposableDashboardProps => ({
        widgets: [fw],
        filters: [linkedFilter],
        widgetsOptions: { fw1: { filterWidgetOptions: { filterId: linkedFilter.config.guid } } },
        layoutOptions: { widgetsPanel: layout },
      });

      const { result, rerender } = renderHook(
        (p: ComposableDashboardProps) => useComposedDashboard(p),
        {
          wrapper: CombinedProvider,
          initialProps: props(layoutWith(['fw1'])),
        },
      );

      // A layout re-emit that still contains the widget must not drop the filter.
      rerender(props(layoutWith(['fw1'])));

      await waitFor(() => {
        expect(result.current.dashboard.widgets.length).toBe(1);
      });
      expect(getFilters(result).some((f) => f.config.guid === linkedFilter.config.guid)).toBe(true);
    });
  });
});
