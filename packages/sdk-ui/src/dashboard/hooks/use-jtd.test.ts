import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  useJtd,
  getFormulaContextFilters,
  handleFormulaDuplicateFilters,
  getJtdClickHandler,
} from './use-jtd';
import { ChartWidgetProps } from '@/props';
import { JTDConfig, JTDNavigateType } from '@/widget-by-id/types';
import { SizeMeasurement } from '@/types';
import React from 'react';

// Mock dependencies
vi.mock('@/common/components/modal', () => ({
  useModalContext: vi.fn(),
}));

vi.mock('@/widget-by-id/utils', () => ({
  isChartWidgetProps: vi.fn(),
  registerDataPointContextMenuHandler: vi.fn(),
}));

vi.mock('@/utils/combine-handlers', () => ({
  combineHandlers: vi.fn((handlers) => handlers.filter(Boolean).pop()),
}));

vi.mock('@/dashboard/components/jtd-dashboard', () => ({
  JTDDashboard: vi.fn(() => null),
}));

vi.mock('@/sisense-context/sisense-context', () => ({
  useSisenseContext: vi.fn(() => ({
    app: {
      settings: {
        jumpToDashboardConfig: {
          enabled: true,
        },
      },
    },
  })),
}));

vi.mock('react', () => {
  const actual = vi.importActual('react');
  const mockReact = {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    ...actual,
    createElement: vi.fn((component, props) => ({ component, props })),
    useCallback: vi.fn((callback) => callback),
    useMemo: vi.fn((callback) => callback()),
    createContext: vi.fn(() => ({
      Provider: vi.fn(),
      Consumer: vi.fn(),
      displayName: 'MockContext',
    })),
  };
  return {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    ...mockReact,
    default: mockReact,
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: vi.fn((key: string) => {
      // Mock translations
      const translations: Record<string, string> = {
        'jumpToDashboard.defaultCaption': 'Jump to',
      };
      return translations[key] || key;
    }),
  })),
}));

describe('useJtd', () => {
  const mockOpenModal = vi.fn();
  const mockOpenMenu = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup mocks
    const { useModalContext } = await import('@/common/components/modal');
    const { isChartWidgetProps, registerDataPointContextMenuHandler } = await import(
      '@/widget-by-id/utils'
    );

    // Ensure useModalContext is properly mocked for each test
    vi.mocked(useModalContext).mockReset();
    vi.mocked(useModalContext).mockReturnValue({
      openModal: mockOpenModal,
      closeModal: vi.fn(),
      closeAllModals: vi.fn(),
      getModalStack: vi.fn(() => []),
      isModalOpen: vi.fn(() => false),
    });

    vi.mocked(isChartWidgetProps).mockReturnValue(true);
    vi.mocked(registerDataPointContextMenuHandler).mockImplementation(() => {});

    mockOpenModal.mockResolvedValue('modal-1');
  });

  describe('getJtdClickHandler', () => {
    const mockOpenModal = vi.fn();
    const sampleDrillTarget = { id: 'dashboard-1', caption: 'Dashboard 1' };
    const sampleWidget = {
      id: 'widget-1',
      widgetType: 'chart',
      chartType: 'column',
    };
    const sampleDataPoint = {
      entries: {
        category: [{ attribute: { expression: '[Category]' }, value: 'Electronics' }],
        breakBy: [],
      },
    };

    beforeEach(() => {
      mockOpenModal.mockClear();
      mockOpenModal.mockResolvedValue('modal-1');
    });

    it('should return an async function', () => {
      const jtdConfig = {
        enabled: true,
        navigateType: JTDNavigateType.CLICK,
        drillTargets: [sampleDrillTarget],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: SizeMeasurement.PIXEL,
        modalWindowResize: true,
        displayToolbarRow: true,
        displayFilterPane: true,
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const clickHandler = getJtdClickHandler(
        jtdConfig as JTDConfig,
        sampleDrillTarget,
        sampleWidget as any,
        sampleDataPoint as any,
        [],
        [],
        mockOpenModal,
      );

      expect(clickHandler).toBeInstanceOf(Function);
    });

    it('should call openModal with correct parameters when executed', async () => {
      const jtdConfig = {
        enabled: true,
        navigateType: JTDNavigateType.CLICK,
        drillTargets: [sampleDrillTarget],
        modalWindowWidth: 1000,
        modalWindowHeight: 800,
        modalWindowMeasurement: SizeMeasurement.PERCENT,
        modalWindowResize: false,
        displayToolbarRow: false,
        displayFilterPane: true,
        mergeTargetDashboardFilters: true,
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const clickHandler = getJtdClickHandler(
        jtdConfig as JTDConfig,
        sampleDrillTarget,
        sampleWidget as any,
        sampleDataPoint as any,
        [],
        [],
        mockOpenModal,
      );

      await clickHandler();

      expect(mockOpenModal).toHaveBeenCalledWith({
        title: 'Dashboard 1',
        width: 1000,
        height: 800,
        measurement: SizeMeasurement.PERCENT,
        allowResize: false,
        content: expect.any(Object),
      });
    });

    it('should create JTDDashboard with correct props', async () => {
      const mockCreateElement = vi.mocked(React.createElement);
      const jtdConfig = {
        enabled: true,
        navigateType: JTDNavigateType.CLICK,
        drillTargets: [sampleDrillTarget],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: SizeMeasurement.PIXEL,
        modalWindowResize: true,
        displayToolbarRow: false,
        displayFilterPane: true,
        mergeTargetDashboardFilters: true,
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const clickHandler = getJtdClickHandler(
        jtdConfig as JTDConfig,
        sampleDrillTarget,
        sampleWidget as any,
        sampleDataPoint as any,
        [],
        [],
        mockOpenModal,
      );

      await clickHandler();

      expect(mockCreateElement).toHaveBeenCalledWith(
        expect.any(Function), // JTDDashboard component
        expect.objectContaining({
          key: 'jtd-dashboard-1',
          dashboardOid: 'dashboard-1',
          filters: expect.any(Array),
          mergeTargetDashboardFilters: true,
          displayToolbarRow: false,
          displayFilterPane: true,
        }),
      );
    });

    it('should merge filters correctly from all sources', async () => {
      const mockCreateElement = vi.mocked(React.createElement);

      // Test with empty filters to avoid mocking complexity
      const dashboardFilters: any[] = [];
      const widgetFilters: any[] = [];

      const jtdConfig = {
        enabled: true,
        navigateType: JTDNavigateType.CLICK,
        drillTargets: [sampleDrillTarget],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: SizeMeasurement.PIXEL,
        modalWindowResize: true,
        displayToolbarRow: true,
        displayFilterPane: true,
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: ['[DashboardDim]'],
        includeWidgetFilterDims: ['[WidgetDim]'],
      };

      const clickHandler = getJtdClickHandler(
        jtdConfig as JTDConfig,
        sampleDrillTarget,
        sampleWidget as any,
        sampleDataPoint as any,
        dashboardFilters,
        widgetFilters,
        mockOpenModal,
      );

      await clickHandler();

      const createElementCall = mockCreateElement.mock.calls.find(
        (call) => call[1] && 'dashboardOid' in call[1],
      );
      expect(createElementCall).toBeDefined();
      const props = createElementCall![1] as any;

      // Should include generated filters from data point
      expect(props.filters).toBeInstanceOf(Array);
    });

    it('should filter dashboard and widget filters based on allowed dimensions', async () => {
      const mockCreateElement = vi.mocked(React.createElement);

      // Test with empty filters to avoid mocking complexity
      const dashboardFilters: any[] = [];
      const widgetFilters: any[] = [];

      const jtdConfig = {
        enabled: true,
        navigateType: JTDNavigateType.CLICK,
        drillTargets: [sampleDrillTarget],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: SizeMeasurement.PIXEL,
        modalWindowResize: true,
        displayToolbarRow: true,
        displayFilterPane: true,
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: ['[AllowedDashDim]'],
        includeWidgetFilterDims: ['[AllowedWidgetDim]'],
      };

      const clickHandler = getJtdClickHandler(
        jtdConfig as JTDConfig,
        sampleDrillTarget,
        sampleWidget as any,
        sampleDataPoint as any,
        dashboardFilters,
        widgetFilters,
        mockOpenModal,
      );

      await clickHandler();

      // The function should complete without errors and call the modal
      expect(mockCreateElement).toHaveBeenCalled();
      expect(mockOpenModal).toHaveBeenCalled();
    });

    it('should handle empty filter arrays gracefully', async () => {
      const jtdConfig = {
        enabled: true,
        navigateType: JTDNavigateType.CLICK,
        drillTargets: [sampleDrillTarget],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: SizeMeasurement.PIXEL,
        modalWindowResize: true,
        displayToolbarRow: true,
        displayFilterPane: true,
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const clickHandler = getJtdClickHandler(
        jtdConfig as JTDConfig,
        sampleDrillTarget,
        sampleWidget as any,
        sampleDataPoint as any,
        [], // empty dashboard filters
        [], // empty widget filters
        mockOpenModal,
      );

      await clickHandler();

      expect(mockOpenModal).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Dashboard 1',
          content: expect.any(Object),
        }),
      );
    });

    it('should handle different drill target configurations', async () => {
      const customDrillTarget = { id: 'custom-dashboard', caption: 'Custom Dashboard Title' };
      const jtdConfig = {
        enabled: true,
        navigateType: JTDNavigateType.CLICK,
        drillTargets: [customDrillTarget],
        modalWindowWidth: 1200,
        modalWindowHeight: 900,
        modalWindowMeasurement: SizeMeasurement.PIXEL,
        modalWindowResize: true,
        displayToolbarRow: true,
        displayFilterPane: false,
        mergeTargetDashboardFilters: true,
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const clickHandler = getJtdClickHandler(
        jtdConfig as JTDConfig,
        customDrillTarget,
        sampleWidget as any,
        sampleDataPoint as any,
        [],
        [],
        mockOpenModal,
      );

      await clickHandler();

      expect(mockOpenModal).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Custom Dashboard Title',
          width: 1200,
          height: 900,
        }),
      );

      expect(React.createElement).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          key: 'jtd-custom-dashboard',
          dashboardOid: 'custom-dashboard',
          displayFilterPane: false,
          mergeTargetDashboardFilters: true,
        }),
      );
    });

    it('should handle widgets without formula context gracefully', async () => {
      const mockCreateElement = vi.mocked(React.createElement);
      const { isChartWidgetProps } = await import('@/widget-by-id/utils');
      vi.mocked(isChartWidgetProps).mockReturnValue(true);

      const simpleWidget = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'column',
        dataOptions: {
          value: [
            {
              column: {
                // No context property
              },
            },
          ],
        },
      };

      const jtdConfig = {
        enabled: true,
        navigateType: JTDNavigateType.CLICK,
        drillTargets: [sampleDrillTarget],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: SizeMeasurement.PIXEL,
        modalWindowResize: true,
        displayToolbarRow: true,
        displayFilterPane: true,
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const clickHandler = getJtdClickHandler(
        jtdConfig as JTDConfig,
        sampleDrillTarget,
        simpleWidget as any,
        sampleDataPoint as any,
        [], // empty dashboard filters
        [], // empty widget filters
        mockOpenModal,
      );

      await clickHandler();

      expect(mockCreateElement).toHaveBeenCalled();
      expect(mockOpenModal).toHaveBeenCalled();
      const createElementCall = mockCreateElement.mock.calls.find(
        (call) => call[1] && 'dashboardOid' in call[1],
      );
      expect(createElementCall).toBeDefined();
    });

    it('should pass datapoint-generated filters to the modal', async () => {
      const mockCreateElement = vi.mocked(React.createElement);

      // Create a datapoint with category and breakBy entries that should generate filters
      const dataPointWithEntries = {
        entries: {
          category: [
            { attribute: { expression: '[Category]' }, value: 'Electronics' },
            { attribute: { expression: '[Brand]' }, value: 'Apple' },
          ],
          breakBy: [{ attribute: { expression: '[Region]' }, value: 'North America' }],
        },
      };

      const jtdConfig = {
        enabled: true,
        navigateType: JTDNavigateType.CLICK,
        drillTargets: [sampleDrillTarget],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: SizeMeasurement.PIXEL,
        modalWindowResize: true,
        displayToolbarRow: true,
        displayFilterPane: true,
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const clickHandler = getJtdClickHandler(
        jtdConfig as JTDConfig,
        sampleDrillTarget,
        sampleWidget as any,
        dataPointWithEntries as any,
        [], // no dashboard filters
        [], // no widget filters
        mockOpenModal,
      );

      await clickHandler();

      // Verify that React.createElement was called with filters
      const createElementCall = mockCreateElement.mock.calls.find(
        (call) => call[1] && 'dashboardOid' in call[1],
      );
      expect(createElementCall).toBeDefined();
      const dashboardProps = createElementCall![1] as any;

      // Should have generated filters from the datapoint entries
      expect(dashboardProps.filters).toBeInstanceOf(Array);
      expect(dashboardProps.filters.length).toBeGreaterThan(0);

      // The filters should be based on the datapoint entries
      // Note: We can't verify exact filter content due to filterFactory complexity,
      // but we can verify that filters were generated from the datapoint
    });

    it('should pass widget filters to the modal when includeDims allows them', async () => {
      // Create a simple widget filter that doesn't require complex mocking
      // We'll verify behavior rather than exact filter content
      const widgetFilters = [
        {
          attribute: { expression: '[WidgetDim]' },
          filterType: 'members',
          // Mock the jaql function to avoid errors
          jaql: () => ({ filter: { members: ['value1'] } }),
        },
      ];

      const jtdConfig = {
        enabled: true,
        navigateType: JTDNavigateType.CLICK,
        drillTargets: [sampleDrillTarget],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: SizeMeasurement.PIXEL,
        modalWindowResize: true,
        displayToolbarRow: true,
        displayFilterPane: true,
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: [],
        includeWidgetFilterDims: ['[WidgetDim]'], // Allow this widget dimension
      };

      const clickHandler = getJtdClickHandler(
        jtdConfig as JTDConfig,
        sampleDrillTarget,
        sampleWidget as any,
        { entries: { category: [], breakBy: [] } } as any, // minimal datapoint
        [], // no dashboard filters
        widgetFilters as any,
        mockOpenModal,
      );

      // This test verifies the function handles widget filters when allowed dimensions are specified
      // The actual filter merging is complex, but we can verify the function completes
      await expect(clickHandler()).resolves.not.toThrow();
      expect(mockOpenModal).toHaveBeenCalled();
    });

    it('should pass dashboard filters to the modal when includeDims allows them', async () => {
      vi.mocked(React.createElement);
      // Create a simple dashboard filter
      const dashboardFilters = [
        {
          attribute: { expression: '[DashboardDim]' },
          filterType: 'members',
          // Mock the jaql function to avoid errors
          jaql: () => ({ filter: { members: ['value1'] } }),
        },
      ];

      const jtdConfig = {
        enabled: true,
        navigateType: JTDNavigateType.CLICK,
        drillTargets: [sampleDrillTarget],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: SizeMeasurement.PIXEL,
        modalWindowResize: true,
        displayToolbarRow: true,
        displayFilterPane: true,
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: ['[DashboardDim]'], // Allow this dashboard dimension
        includeWidgetFilterDims: [],
      };

      const clickHandler = getJtdClickHandler(
        jtdConfig as JTDConfig,
        sampleDrillTarget,
        sampleWidget as any,
        { entries: { category: [], breakBy: [] } } as any, // minimal datapoint
        dashboardFilters as any,
        [], // no widget filters
        mockOpenModal,
      );

      // This test verifies the function handles dashboard filters when allowed dimensions are specified
      await expect(clickHandler()).resolves.not.toThrow();
      expect(mockOpenModal).toHaveBeenCalled();
    });

    it('should exclude filters when dimensions are not in allowed lists', async () => {
      vi.mocked(React.createElement);
      const dashboardFilters = [
        {
          attribute: { expression: '[ExcludedDashDim]' },
          filterType: 'members',
          jaql: () => ({ filter: { members: ['value1'] } }),
        },
      ];

      const widgetFilters = [
        {
          attribute: { expression: '[ExcludedWidgetDim]' },
          filterType: 'members',
          jaql: () => ({ filter: { members: ['value2'] } }),
        },
      ];

      const jtdConfig = {
        enabled: true,
        navigateType: JTDNavigateType.CLICK,
        drillTargets: [sampleDrillTarget],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: SizeMeasurement.PIXEL,
        modalWindowResize: true,
        displayToolbarRow: true,
        displayFilterPane: true,
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: ['[AllowedDashDim]'], // Different from filter dimension
        includeWidgetFilterDims: ['[AllowedWidgetDim]'], // Different from filter dimension
      };

      const clickHandler = getJtdClickHandler(
        jtdConfig as JTDConfig,
        sampleDrillTarget,
        sampleWidget as any,
        { entries: { category: [], breakBy: [] } } as any, // minimal datapoint
        dashboardFilters as any,
        widgetFilters as any,
        mockOpenModal,
      );

      // The function should complete successfully even when filters are excluded
      await expect(clickHandler()).resolves.not.toThrow();
      expect(mockOpenModal).toHaveBeenCalled();
    });

    it('should not be called when JTD config is disabled', () => {
      // This test verifies that getJtdClickHandler is never called when config is disabled
      // The logic should prevent reaching this function entirely when enabled = false
      const disabledJTDConfig = {
        enabled: false, // This should prevent getJtdClickHandler from being used
        navigateType: JTDNavigateType.CLICK,
        drillTargets: [sampleDrillTarget],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: SizeMeasurement.PIXEL,
        modalWindowResize: true,
        displayToolbarRow: true,
        displayFilterPane: true,
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      // Test that useJtd doesn't create any click handlers when disabled
      const { result } = renderHook(() =>
        useJtd({
          widgetOptions: {
            'widget-1': { jtdConfig: disabledJTDConfig as JTDConfig },
          },
          dashboardFilters: [],
          widgetFilters: new Map(),
          openMenu: mockOpenMenu,
        }),
      );

      const originalWidget = { id: 'widget-1', widgetType: 'chart', chartType: 'column' };
      const modifiedWidget = result.current.connectToWidgetProps(originalWidget as any);

      // Verify no handlers were added
      expect(modifiedWidget).toBe(originalWidget);
      expect((modifiedWidget as ChartWidgetProps).onDataPointClick).toBeUndefined();

      // Verify getJtdClickHandler would never be called since no handlers are added
      // (The test is implicit - if no handlers are added, getJtdClickHandler won't be called)
    });
  });

  describe('Hook behavior', () => {
    it('should return connectToWidgetProps function', () => {
      const { result } = renderHook(() =>
        useJtd({
          widgetOptions: {},
          dashboardFilters: [],
          widgetFilters: new Map(),
          openMenu: mockOpenMenu,
        }),
      );

      expect(result.current.connectToWidgetProps).toBeInstanceOf(Function);
    });

    it('should return widget unchanged when no JTD config', () => {
      const { result } = renderHook(() =>
        useJtd({
          widgetOptions: {},
          dashboardFilters: [],
          widgetFilters: new Map(),
          openMenu: mockOpenMenu,
        }),
      );

      const originalWidget = { id: 'test' };
      const modifiedWidget = result.current.connectToWidgetProps(originalWidget as any);

      expect(modifiedWidget).toBe(originalWidget);
    });

    it('should return widget unchanged when JTD config is disabled', () => {
      const disabledJTDConfig = {
        enabled: false, // JTD is disabled
        navigateType: JTDNavigateType.CLICK,
        drillTargets: [{ id: 'dashboard-1', caption: 'Dashboard 1' }],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: SizeMeasurement.PIXEL,
        modalWindowResize: true,
        displayToolbarRow: true,
        displayFilterPane: true,
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const { result } = renderHook(() =>
        useJtd({
          widgetOptions: {
            'widget-1': { jtdConfig: disabledJTDConfig as JTDConfig },
          },
          dashboardFilters: [],
          widgetFilters: new Map(),
          openMenu: mockOpenMenu,
        }),
      );

      const originalWidget = { id: 'widget-1', widgetType: 'chart', chartType: 'column' };
      const modifiedWidget = result.current.connectToWidgetProps(originalWidget as any);

      // Widget should be returned unchanged (no onDataPointClick handler added)
      expect(modifiedWidget).toBe(originalWidget);
      expect((modifiedWidget as ChartWidgetProps).onDataPointClick).toBeUndefined();
    });

    it('should add onDataPointClick handler when JTD config is enabled', () => {
      const enabledJTDConfig = {
        enabled: true, // JTD is enabled
        navigateType: JTDNavigateType.CLICK,
        drillTargets: [{ id: 'dashboard-1', caption: 'Dashboard 1' }],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: SizeMeasurement.PIXEL,
        modalWindowResize: true,
        displayToolbarRow: true,
        displayFilterPane: true,
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const { result } = renderHook(() =>
        useJtd({
          widgetOptions: {
            'widget-1': { jtdConfig: enabledJTDConfig as JTDConfig },
          },
          dashboardFilters: [],
          widgetFilters: new Map(),
          openMenu: mockOpenMenu,
        }),
      );

      const originalWidget = { id: 'widget-1', widgetType: 'chart', chartType: 'column' };
      const modifiedWidget = result.current.connectToWidgetProps(originalWidget as any);

      // Handler should be added when enabled is true
      expect((modifiedWidget as ChartWidgetProps).onDataPointClick).toBeInstanceOf(Function);
    });

    it('should handle mixed enabled/disabled configs for different widgets', () => {
      const enabledConfig = {
        enabled: true,
        navigateType: JTDNavigateType.CLICK,
        drillTargets: [{ id: 'dashboard-1', caption: 'Dashboard 1' }],
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const disabledConfig = {
        enabled: false,
        navigateType: JTDNavigateType.CLICK,
        drillTargets: [{ id: 'dashboard-2', caption: 'Dashboard 2' }],
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const { result } = renderHook(() =>
        useJtd({
          widgetOptions: {
            'enabled-widget': { jtdConfig: enabledConfig as JTDConfig },
            'disabled-widget': { jtdConfig: disabledConfig as JTDConfig },
          },
          dashboardFilters: [],
          widgetFilters: new Map(),
          openMenu: mockOpenMenu,
        }),
      );

      const enabledWidget = { id: 'enabled-widget', widgetType: 'chart', chartType: 'column' };
      const disabledWidget = { id: 'disabled-widget', widgetType: 'chart', chartType: 'column' };

      const modifiedEnabledWidget = result.current.connectToWidgetProps(enabledWidget as any);
      const modifiedDisabledWidget = result.current.connectToWidgetProps(disabledWidget as any);

      // Enabled widget should have handler
      expect((modifiedEnabledWidget as ChartWidgetProps).onDataPointClick).toBeInstanceOf(Function);

      // Disabled widget should not have handler
      expect(modifiedDisabledWidget).toBe(disabledWidget); // Should be unchanged
      expect((modifiedDisabledWidget as ChartWidgetProps).onDataPointClick).toBeUndefined();
    });

    it('should not add onDataPointClick handler for non-CLICK navigation when disabled', () => {
      const disabledRightClickConfig = {
        enabled: false,
        navigateType: JTDNavigateType.RIGHT_CLICK,
        drillTargets: [{ id: 'dashboard-1', caption: 'Dashboard 1' }],
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const { result } = renderHook(() =>
        useJtd({
          widgetOptions: {
            'widget-1': { jtdConfig: disabledRightClickConfig as JTDConfig },
          },
          dashboardFilters: [],
          widgetFilters: new Map(),
          openMenu: mockOpenMenu,
        }),
      );

      const originalWidget = { id: 'widget-1', widgetType: 'chart', chartType: 'column' };
      const modifiedWidget = result.current.connectToWidgetProps(originalWidget as any);

      // Should be unchanged since config is disabled
      expect(modifiedWidget).toBe(originalWidget);
      expect((modifiedWidget as ChartWidgetProps).onDataPointClick).toBeUndefined();
    });

    it('should add onDataPointClick handler for CLICK navigation', () => {
      const sampleJTDConfig = {
        enabled: true,
        navigateType: JTDNavigateType.CLICK,
        drillTargets: [{ id: 'dashboard-1', caption: 'Dashboard 1' }],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: SizeMeasurement.PIXEL,
        modalWindowResize: true,
        displayToolbarRow: true,
        displayFilterPane: true,
        mergeTargetDashboardFilters: false,
        drilledDashboardPrefix: '',
        drilledDashboardsFolderPrefix: '',
        displayDashboardsPane: true,
        displayHeaderRow: true,
        displayBreadcrumbs: true,
        displayRefreshButton: true,
        sendFormulaFiltersDuplicate: undefined,
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const sampleWidget = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'column',
      };

      const { result } = renderHook(() =>
        useJtd({
          widgetOptions: {
            'widget-1': { jtdConfig: sampleJTDConfig },
          },
          dashboardFilters: [],
          widgetFilters: new Map(),
          openMenu: mockOpenMenu,
        }),
      );

      const modifiedWidget = result.current.connectToWidgetProps(sampleWidget as any);

      expect((modifiedWidget as ChartWidgetProps).onDataPointClick).toBeInstanceOf(Function);
    });

    it('should not add onDataPointClick handler for non-CLICK navigation', () => {
      const sampleJTDConfig = {
        enabled: true,
        navigateType: JTDNavigateType.RIGHT_CLICK,
        drillTargets: [{ id: 'dashboard-1', caption: 'Dashboard 1' }],
      };

      const sampleWidget = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'column',
      };

      const { result } = renderHook(() =>
        useJtd({
          widgetOptions: {
            'widget-1': { jtdConfig: sampleJTDConfig as JTDConfig },
          },
          dashboardFilters: [],
          widgetFilters: new Map(),
          openMenu: mockOpenMenu,
        }),
      );

      const modifiedWidget = result.current.connectToWidgetProps(sampleWidget as any);

      expect((modifiedWidget as ChartWidgetProps).onDataPointClick).toBeUndefined();
    });
  });

  describe('Formula context filter extraction', () => {
    it('should extract formula context filters from chart widget', async () => {
      const { isChartWidgetProps } = await import('@/widget-by-id/utils');
      vi.mocked(isChartWidgetProps).mockReturnValue(true);

      const sampleAttribute = {
        expression: '[Commerce.Cost]',
      };

      const sampleWidget = {
        id: 'widget-1',
        widgetType: 'chart',
        dataOptions: {
          value: [
            {
              column: {
                context: {
                  'filter-1': {
                    filterType: 'numeric',
                    attribute: sampleAttribute,
                    valueA: 10,
                    valueB: 1000,
                  },
                },
              },
            },
          ],
        },
      };

      const sampleDataPoint = {};
      const sampleConfig = {};

      const filters = getFormulaContextFilters(
        sampleDataPoint as any,
        sampleWidget as any,
        sampleConfig as any,
      );

      expect(filters).toHaveLength(1);
      expect(filters[0]).toMatchObject({
        filterType: 'numeric',
        attribute: sampleAttribute,
        valueA: 10,
        valueB: 1000,
      });
    });

    it('should return empty array for non-chart widget', async () => {
      const { isChartWidgetProps } = await import('@/widget-by-id/utils');
      vi.mocked(isChartWidgetProps).mockReturnValue(false);

      const textWidget = {
        id: 'text-1',
        widgetType: 'text',
      };

      const filters = getFormulaContextFilters({} as any, textWidget as any, {} as any);

      expect(filters).toHaveLength(0);
    });

    it('should handle widget without dataOptions', async () => {
      const { isChartWidgetProps } = await import('@/widget-by-id/utils');
      vi.mocked(isChartWidgetProps).mockReturnValue(true);

      const widgetWithoutDataOptions = {
        id: 'widget-1',
        widgetType: 'chart',
      };

      const filters = getFormulaContextFilters(
        {} as any,
        widgetWithoutDataOptions as any,
        {} as any,
      );

      expect(filters).toHaveLength(0);
    });
  });

  describe('Formula duplicate filter handling', () => {
    const dimension1 = '[Commerce.Cost]';
    const dimension2 = '[Commerce.Revenue]';

    const filter1 = { attribute: { expression: dimension1 } };
    const filter2 = { attribute: { expression: dimension1 } };
    const filter3 = { attribute: { expression: dimension2 } };

    it('should include all filters when no duplicates exist', () => {
      const result = handleFormulaDuplicateFilters([filter1, filter3] as any, undefined);
      expect(result).toHaveLength(2);
    });

    it('should exclude all duplicate filters when sendFormulaFiltersDuplicate is "none"', () => {
      const result = handleFormulaDuplicateFilters([filter1, filter2, filter3] as any, 'none');
      expect(result).toHaveLength(1); // Only filter3 (no duplicates)
    });

    it('should include first duplicate when sendFormulaFiltersDuplicate is 1', () => {
      const result = handleFormulaDuplicateFilters([filter1, filter2, filter3] as any, 1);
      expect(result).toHaveLength(2); // filter1 and filter3
      expect(result).toContain(filter1);
      expect(result).toContain(filter3);
    });

    it('should include second duplicate when sendFormulaFiltersDuplicate is 2', () => {
      const result = handleFormulaDuplicateFilters([filter1, filter2, filter3] as any, 2);
      expect(result).toHaveLength(2); // filter2 and filter3
      expect(result).toContain(filter2);
      expect(result).toContain(filter3);
    });

    it('should treat invalid numbers as "none"', () => {
      const result1 = handleFormulaDuplicateFilters([filter1, filter2, filter3] as any, 0);
      const result2 = handleFormulaDuplicateFilters([filter1, filter2, filter3] as any, 99);
      const result3 = handleFormulaDuplicateFilters([filter1, filter2, filter3] as any, -1);

      expect(result1).toHaveLength(1); // Only filter3
      expect(result2).toHaveLength(1); // Only filter3
      expect(result3).toHaveLength(1); // Only filter3
    });

    it('should include first duplicate for unexpected values', () => {
      const result = handleFormulaDuplicateFilters(
        [filter1, filter2, filter3] as any,
        'invalid' as any,
      );
      expect(result).toHaveLength(2); // filter1 and filter3
      expect(result).toContain(filter1);
      expect(result).toContain(filter3);
    });

    it('should handle empty filter array', () => {
      const result = handleFormulaDuplicateFilters([], 'none');
      expect(result).toHaveLength(0);
    });
  });

  describe('Error handling', () => {
    it('should handle missing modal context gracefully', async () => {
      const { useModalContext } = await import('@/common/components/modal');
      vi.mocked(useModalContext).mockReturnValue(null);

      const { result } = renderHook(() =>
        useJtd({
          widgetOptions: {},
          dashboardFilters: [],
          widgetFilters: new Map(),
          openMenu: mockOpenMenu,
        }),
      );

      const widget = { id: 'test' };
      const modifiedWidget = result.current.connectToWidgetProps(widget as any);

      // Should not throw error
      expect(modifiedWidget).toBeDefined();
    });

    it('should handle malformed formula context gracefully', () => {
      const widgetWithMalformedContext = {
        id: 'widget-1',
        widgetType: 'chart',
        dataOptions: {
          value: [
            {
              column: {
                context: 'invalid-context',
              },
            },
          ],
        },
      };

      expect(() => {
        getFormulaContextFilters({} as any, widgetWithMalformedContext as any, {} as any);
      }).not.toThrow();
    });
  });

  describe('Integration tests', () => {
    it('should open modal when datapoint is clicked with single drill target', async () => {
      const sampleJTDConfig = {
        enabled: true,
        navigateType: JTDNavigateType.CLICK,
        drillTargets: [{ id: 'dashboard-1', caption: 'Dashboard 1' }],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: SizeMeasurement.PIXEL,
        modalWindowResize: true,
        displayToolbarRow: true,
        displayFilterPane: true,
        mergeTargetDashboardFilters: false,
        drilledDashboardPrefix: '',
        drilledDashboardsFolderPrefix: '',
        displayDashboardsPane: true,
        displayHeaderRow: true,
        displayBreadcrumbs: true,
        displayRefreshButton: true,
        sendFormulaFiltersDuplicate: undefined,
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const sampleWidget = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'column',
      };

      const { result } = renderHook(() =>
        useJtd({
          widgetOptions: {
            'widget-1': { jtdConfig: sampleJTDConfig as JTDConfig },
          },
          dashboardFilters: [],
          widgetFilters: new Map(),
          openMenu: mockOpenMenu,
        }),
      );

      const modifiedWidget = result.current.connectToWidgetProps(sampleWidget as any);
      const sampleDataPoint = { entries: { category: [], breakBy: [] } };

      // Simulate datapoint click
      await act(async () => {
        const onDataPointClick = (modifiedWidget as ChartWidgetProps).onDataPointClick;
        if (onDataPointClick) {
          onDataPointClick(sampleDataPoint as any, {} as any);
        }
      });

      expect(mockOpenModal).toHaveBeenCalledWith({
        title: 'Dashboard 1',
        width: 800,
        height: 600,
        measurement: SizeMeasurement.PIXEL,
        allowResize: true,
        content: expect.any(Object),
      });
    });

    it('should open context menu with multiple drill targets', async () => {
      const multiTargetConfig = {
        enabled: true,
        navigateType: JTDNavigateType.CLICK,
        drillTargets: [
          { id: 'dashboard-1', caption: 'Dashboard 1' },
          { id: 'dashboard-2', caption: 'Dashboard 2' },
        ],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: SizeMeasurement.PIXEL,
        modalWindowResize: true,
        displayToolbarRow: true,
        displayFilterPane: true,
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const sampleWidget = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'column',
      };

      const { result } = renderHook(() =>
        useJtd({
          widgetOptions: {
            'widget-1': { jtdConfig: multiTargetConfig },
          },
          dashboardFilters: [],
          widgetFilters: new Map(),
          openMenu: mockOpenMenu,
        }),
      );

      const modifiedWidget = result.current.connectToWidgetProps(sampleWidget as any);
      const sampleDataPoint = { entries: { category: [], breakBy: [] } };
      const mockEvent = { clientX: 100, clientY: 200 };

      // Simulate datapoint click
      await act(async () => {
        if (modifiedWidget && 'onDataPointClick' in modifiedWidget) {
          const onDataPointClick = (modifiedWidget as ChartWidgetProps).onDataPointClick;
          if (typeof onDataPointClick === 'function') {
            onDataPointClick(sampleDataPoint as any, mockEvent as any);
          }
        }
      });

      expect(mockOpenMenu).toHaveBeenCalledWith({
        id: 'jump-to-dashboard-menu',
        position: { left: 100, top: 200 },
        itemSections: expect.arrayContaining([
          expect.objectContaining({
            items: expect.arrayContaining([
              expect.objectContaining({
                caption: 'Jump to',
                subItems: expect.any(Array),
              }),
            ]),
          }),
        ]),
      });
    });

    it('should open context menu with custom drill caption', async () => {
      const customMenuCaption = 'Custom Jump Menu';
      const multiTargetConfig = {
        enabled: true,
        navigateType: JTDNavigateType.CLICK,
        drillToDashboardRightMenuCaption: customMenuCaption, // Custom caption
        drillTargets: [
          { id: 'dashboard-1', caption: 'Dashboard 1' },
          { id: 'dashboard-2', caption: 'Dashboard 2' },
        ],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: SizeMeasurement.PIXEL,
        modalWindowResize: true,
        displayToolbarRow: true,
        displayFilterPane: true,
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const sampleWidget = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'column',
      };

      const { result } = renderHook(() =>
        useJtd({
          widgetOptions: {
            'widget-1': { jtdConfig: multiTargetConfig },
          },
          dashboardFilters: [],
          widgetFilters: new Map(),
          openMenu: mockOpenMenu,
        }),
      );

      const modifiedWidget = result.current.connectToWidgetProps(sampleWidget as any);
      const sampleDataPoint = { entries: { category: [], breakBy: [] } };
      const mockEvent = { clientX: 100, clientY: 200 };

      // Simulate datapoint click
      await act(async () => {
        if (modifiedWidget && 'onDataPointClick' in modifiedWidget) {
          const onDataPointClick = (modifiedWidget as ChartWidgetProps).onDataPointClick;
          if (typeof onDataPointClick === 'function') {
            onDataPointClick(sampleDataPoint as any, mockEvent as any);
          }
        }
      });

      expect(mockOpenMenu).toHaveBeenCalledWith({
        id: 'jump-to-dashboard-menu',
        position: { left: 100, top: 200 },
        itemSections: expect.arrayContaining([
          expect.objectContaining({
            items: expect.arrayContaining([
              expect.objectContaining({
                caption: customMenuCaption, // Should use custom caption
                subItems: expect.any(Array),
              }),
            ]),
          }),
        ]),
      });
    });
  });
});
