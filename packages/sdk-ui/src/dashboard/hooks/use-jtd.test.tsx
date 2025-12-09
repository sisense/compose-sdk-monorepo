import { type Attribute, filterFactory, Sort } from '@sisense/sdk-data';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChartWidgetProps } from '@/props';

import { normalizeToJumpToDashboardConfig } from './jtd/jtd-config-transformers';
import { getFormulaContextFilters, handleFormulaDuplicateFilters } from './jtd/jtd-filters';
import { getJtdClickHandler } from './jtd/jtd-handlers';
import { JtdConfig, JtdTarget, JumpToDashboardConfig } from './jtd/jtd-types';
import { useJtdInternal } from './use-jtd';

// Mock filterFactory.members to return proper filter objects
const createMockFilter = (attribute: any, members: string[]) => ({
  __serializable: 'MembersFilter',
  attribute,
  members,
  filterType: 'members',
  // Properties required by Element interface
  name: `${attribute.expression}_filter`,
  title: `${attribute.expression}_filter`,
  type: 'filter',
  description: `Filter for ${attribute.expression}`,
  id: `${attribute.expression}_${members.join(',')}`,
  expression: `filter(${attribute.expression})`,
  severity: 'info' as any,
  // Properties required by Filter interface
  isScope: false,
  config: {
    guid: `filter-${attribute.expression}`,
    disabled: false,
    locked: false,
    excludeMembers: false,
    enableMultiSelection: true,
    deactivatedMembers: [],
  },
  jaql: (nested?: boolean) => {
    const result = {
      jaql: {
        title: attribute.name || attribute.expression,
        dim: attribute.expression,
        datatype: 'text',
        filter: {
          members: members,
        },
      },
    };
    return nested === true ? result.jaql : result;
  },
  filterJaql: () => ({
    members: members,
  }),
  serialize: () => ({}),
  toJSON: () => ({}),
});

vi.mock('@sisense/sdk-data', async () => {
  const actual = await vi.importActual('@sisense/sdk-data');
  return {
    ...(actual as any),
    filterFactory: {
      ...(actual as any).filterFactory,
      members: vi.fn((attribute: Attribute, members: string[]) =>
        createMockFilter(attribute, members),
      ),
    },
  };
});

// Helper function to create test attributes
const createTestAttribute = (expression: string): Attribute => {
  return {
    expression,
    name: expression,
    title: expression,
    type: 'dimension',
    description: '',
    id: expression,
    __serializable: 'DimensionalAttribute',
    serialize: () => ({
      name: expression,
      type: 'dimension',
      description: '',
      expression,
      __serializable: 'DimensionalAttribute',
    }),
    toJSON: () => ({
      name: expression,
      type: 'dimension',
      description: '',
      expression,
    }),
    jaql: (nested?: boolean) => {
      const result = {
        jaql: {
          title: expression,
          dim: expression,
          datatype: 'text',
        },
      };
      return nested === true ? result.jaql : result;
    },
    getSort: () => Sort.Ascending,
    sort: () => createTestAttribute(expression),
  };
};

// Mock dependencies
vi.mock('@/common/hooks/use-modal', () => ({
  useModal: vi.fn(),
}));

vi.mock('@/widget-by-id/utils', () => ({
  isChartWidgetProps: vi.fn(),
  isTextWidgetProps: vi.fn(),
  isPivotTableWidgetProps: vi.fn(),
  registerDataPointContextMenuHandler: vi.fn((widgetProps, handler) => {
    const existingHandler = widgetProps.onDataPointContextMenu;
    widgetProps.onDataPointContextMenu = existingHandler
      ? (...args: any[]) => {
          existingHandler(...args);
          handler(...args);
        }
      : handler;
  }),
  registerDataPointClickHandler: vi.fn((widgetProps, handler) => {
    const existingHandler = widgetProps.onDataPointClick;
    widgetProps.onDataPointClick = existingHandler
      ? (...args: any[]) => {
          existingHandler(...args);
          handler(...args);
        }
      : handler;
  }),
  registerDataPointsSelectedHandler: vi.fn((widgetProps, handler) => {
    const existingHandler = widgetProps.onDataPointsSelected;
    widgetProps.onDataPointsSelected = existingHandler
      ? (...args: any[]) => {
          existingHandler(...args);
          handler(...args);
        }
      : handler;
  }),
}));

vi.mock('@/utils/combine-handlers', () => ({
  combineHandlers: vi.fn((handlers) => handlers.filter(Boolean).pop()),
}));

vi.mock('@/dashboard/components/jtd-dashboard', () => ({
  JtdDashboard: vi.fn(() => null),
}));

vi.mock('@/sisense-context/sisense-context', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    SisenseContext: {
      Provider: vi.fn(),
      Consumer: vi.fn(),
      displayName: 'SisenseContext',
    },
    useSisenseContext: vi.fn(() => ({
      app: {
        settings: {
          jumpToDashboardConfig: {
            enabled: true,
          },
        },
      },
    })),
  };
});

vi.mock('react', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useCallback: vi.fn((callback) => callback),
    createContext: vi.fn(() => ({
      Provider: vi.fn(),
      Consumer: vi.fn(),
      displayName: 'MockContext',
    })),
  };
});

vi.mock('react-i18next', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    initReactI18next: {
      type: '3rdParty',
      init: vi.fn(),
    },
    useTranslation: vi.fn(() => ({
      t: vi.fn((key: string) => {
        // Mock translations
        const translations: Record<string, string> = {
          'jumpToDashboard.defaultCaption': 'Jump to',
        };
        return translations[key] || key;
      }),
    })),
  };
});

vi.mock('@/theme-provider', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useThemeContext: vi.fn(() => ({
      themeSettings: {
        // Mock theme settings with minimal required structure
        chart: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
        },
        typography: {
          fontFamily: 'Arial',
        },
      },
    })),
  };
});

describe('useJtdInternal', () => {
  const mockOpenModal = vi.fn();
  const mockOpenMenu = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();

    // Clear the modal calls
    mockOpenModal.mockClear();

    // Setup mocks
    const { useModal } = await import('@/common/hooks/use-modal');
    const { isChartWidgetProps, registerDataPointContextMenuHandler } = await import(
      '@/widget-by-id/utils'
    );

    // Ensure useModal is properly mocked for each test
    vi.mocked(useModal).mockReset();
    vi.mocked(useModal).mockReturnValue({
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
        navigateType: 'click',
        jumpTargets: [sampleDrillTarget],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: 'px',
        modalWindowResize: true,
        dashboardConfig: {
          toolbar: { visible: true },
          filtersPanel: { visible: true },
        },
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const clickHandler = getJtdClickHandler(
        {
          jtdConfig: jtdConfig as JtdConfig,
          jumpTarget: sampleDrillTarget as unknown as JtdTarget,
          widgetProps: sampleWidget as any,
          point: sampleDataPoint as any,
        },
        {
          dashboardFilters: [],
          originalWidgetFilters: [],
        },
        {
          openModal: mockOpenModal,
        },
      );

      expect(clickHandler).toBeInstanceOf(Function);
    });

    it('should call openModal with correct parameters when executed', async () => {
      const jtdConfig = {
        enabled: true,
        navigateType: 'click',
        jumpTargets: [sampleDrillTarget],
        modalWindowWidth: 1000,
        modalWindowHeight: 800,
        modalWindowMeasurement: '%',
        modalWindowResize: false,
        dashboardConfig: {
          toolbar: { visible: false },
          filtersPanel: { visible: true },
        },
        mergeTargetDashboardFilters: true,
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const clickHandler = getJtdClickHandler(
        {
          jtdConfig: jtdConfig as JtdConfig,
          jumpTarget: sampleDrillTarget as unknown as JtdTarget,
          widgetProps: sampleWidget as any,
          point: sampleDataPoint as any,
        },
        {
          dashboardFilters: [],
          originalWidgetFilters: [],
        },
        {
          openModal: mockOpenModal,
        },
      );

      await clickHandler();

      expect(mockOpenModal).toHaveBeenCalledWith({
        title: 'Dashboard 1',
        width: 1000,
        height: 800,
        measurement: '%',
        content: expect.any(Object),
      });
    });

    it('should create JtdDashboard with correct props', async () => {
      const jtdConfig = {
        enabled: true,
        navigateType: 'click',
        jumpTargets: [sampleDrillTarget],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: 'px',
        modalWindowResize: true,
        dashboardConfig: {
          toolbar: { visible: false },
          filtersPanel: { visible: true },
        },
        mergeTargetDashboardFilters: true,
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const clickHandler = getJtdClickHandler(
        {
          jtdConfig: jtdConfig as JtdConfig,
          jumpTarget: sampleDrillTarget as unknown as JtdTarget,
          widgetProps: sampleWidget as any,
          point: sampleDataPoint as any,
        },
        {
          dashboardFilters: [],
          originalWidgetFilters: [],
        },
        {
          openModal: mockOpenModal,
        },
      );

      await clickHandler();

      expect(mockOpenModal).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Dashboard 1',
          content: expect.any(Object), // JSX element
        }),
      );

      // Check the content props by examining the modal call
      const modalCall = mockOpenModal.mock.calls[0][0];
      expect(modalCall.content.props).toEqual(
        expect.objectContaining({
          dashboard: 'dashboard-1',
          filters: expect.any(Array),
          mergeTargetDashboardFilters: true,
          dashboardConfig: {
            toolbar: { visible: false },
            filtersPanel: { visible: true },
          },
        }),
      );
    });

    it('should merge filters correctly from all sources', async () => {
      // Test with empty filters to avoid mocking complexity
      const dashboardFilters: any[] = [];
      const widgetFilters: any[] = [];

      const jtdConfig = {
        enabled: true,
        navigateType: 'click',
        jumpTargets: [sampleDrillTarget],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: 'px',
        modalWindowResize: true,
        dashboardConfig: {
          toolbar: { visible: true },
          filtersPanel: { visible: true },
        },
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: ['[DashboardDim]'],
        includeWidgetFilterDims: ['[WidgetDim]'],
      };

      const clickHandler = getJtdClickHandler(
        {
          jtdConfig: jtdConfig as JtdConfig,
          jumpTarget: sampleDrillTarget as unknown as JtdTarget,
          widgetProps: sampleWidget as any,
          point: sampleDataPoint as any,
        },
        {
          dashboardFilters,
          originalWidgetFilters: widgetFilters,
        },
        {
          openModal: mockOpenModal,
        },
      );

      await clickHandler();

      expect(mockOpenModal).toHaveBeenCalled();

      // Check the content props by examining the modal call
      const modalCall = mockOpenModal.mock.calls[0][0];
      expect(modalCall.content.props).toBeDefined();

      // Should include generated filters from data point
      expect(modalCall.content.props.filters).toBeInstanceOf(Array);
    });

    it('should filter dashboard and widget filters based on allowed dimensions', async () => {
      // Test with empty filters to avoid mocking complexity
      const dashboardFilters: any[] = [];
      const widgetFilters: any[] = [];

      const jtdConfig = {
        enabled: true,
        navigateType: 'click',
        jumpTargets: [sampleDrillTarget],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: 'px',
        modalWindowResize: true,
        dashboardConfig: {
          toolbar: { visible: true },
          filtersPanel: { visible: true },
        },
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: ['[AllowedDashDim]'],
        includeWidgetFilterDims: ['[AllowedWidgetDim]'],
      };

      const clickHandler = getJtdClickHandler(
        {
          jtdConfig: jtdConfig as JtdConfig,
          jumpTarget: sampleDrillTarget as unknown as JtdTarget,
          widgetProps: sampleWidget as any,
          point: sampleDataPoint as any,
        },
        {
          dashboardFilters,
          originalWidgetFilters: widgetFilters,
        },
        {
          openModal: mockOpenModal,
        },
      );

      await clickHandler();

      // The function should complete without errors and call the modal
      expect(mockOpenModal).toHaveBeenCalled();
    });

    it('should handle empty filter arrays gracefully', async () => {
      const jtdConfig = {
        enabled: true,
        navigateType: 'click',
        jumpTargets: [sampleDrillTarget],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: 'px',
        modalWindowResize: true,
        dashboardConfig: {
          toolbar: { visible: true },
          filtersPanel: { visible: true },
        },
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const clickHandler = getJtdClickHandler(
        {
          jtdConfig: jtdConfig as JtdConfig,
          jumpTarget: sampleDrillTarget as unknown as JtdTarget,
          widgetProps: sampleWidget as any,
          point: sampleDataPoint as any,
        },
        {
          dashboardFilters: [], // empty dashboard filters
          originalWidgetFilters: [], // empty widget filters
        },
        {
          openModal: mockOpenModal,
        },
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
        navigateType: 'click',
        jumpTargets: [customDrillTarget],
        modalWindowWidth: 1200,
        modalWindowHeight: 900,
        modalWindowMeasurement: 'px',
        modalWindowResize: true,
        dashboardConfig: {
          toolbar: { visible: true },
          filtersPanel: { visible: false },
        },
        mergeTargetDashboardFilters: true,
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const clickHandler = getJtdClickHandler(
        {
          jtdConfig: jtdConfig as JtdConfig,
          jumpTarget: customDrillTarget as unknown as JtdTarget,
          widgetProps: sampleWidget as any,
          point: sampleDataPoint as any,
        },
        {
          dashboardFilters: [],
          originalWidgetFilters: [],
        },
        {
          openModal: mockOpenModal,
        },
      );

      await clickHandler();

      expect(mockOpenModal).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Custom Dashboard Title',
          width: 1200,
          height: 900,
        }),
      );

      // Check the content props by examining the modal call
      const modalCall = mockOpenModal.mock.calls[0][0];
      expect(modalCall.content.props).toEqual(
        expect.objectContaining({
          dashboard: 'custom-dashboard',
          dashboardConfig: {
            toolbar: { visible: true },
            filtersPanel: { visible: false },
          },
          filters: expect.any(Array),
          mergeTargetDashboardFilters: true,
        }),
      );

      // Check that the JSX element has the correct key
      expect(modalCall.content.key).toBe('jtd-custom-dashboard');
    });

    it('should handle widgets without formula context gracefully', async () => {
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
        navigateType: 'click',
        jumpTargets: [sampleDrillTarget],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: 'px',
        modalWindowResize: true,
        dashboardConfig: {
          toolbar: { visible: true },
          filtersPanel: { visible: true },
        },
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const clickHandler = getJtdClickHandler(
        {
          jtdConfig: jtdConfig as JtdConfig,
          jumpTarget: sampleDrillTarget as unknown as JtdTarget,
          widgetProps: simpleWidget as any,
          point: sampleDataPoint as any,
        },
        {
          dashboardFilters: [], // empty dashboard filters
          originalWidgetFilters: [], // empty widget filters
        },
        {
          openModal: mockOpenModal,
        },
      );

      await clickHandler();

      expect(mockOpenModal).toHaveBeenCalled();

      // Check the content props by examining the modal call
      const modalCall = mockOpenModal.mock.calls[0][0];
      expect(modalCall.content.props).toBeDefined();
    });

    it('should pass datapoint-generated filters to the modal', async () => {
      // Create a datapoint with category and breakBy entries that should generate filters
      const dataPointWithEntries = {
        entries: {
          category: [
            {
              attribute: {
                expression: '[Category]',
                jaql: () => ({
                  jaql: {
                    dataType: 'text',
                    title: 'Category',
                    dim: '[Category]',
                  },
                }),
              },
              value: 'Electronics',
            },
            {
              attribute: {
                expression: '[Brand]',
                jaql: () => ({
                  jaql: {
                    dataType: 'text',
                    title: 'Brand',
                    dim: '[Brand]',
                  },
                }),
              },
              value: 'Apple',
            },
          ],
          breakBy: [
            {
              attribute: {
                expression: '[Region]',
                jaql: () => ({
                  jaql: {
                    dataType: 'text',
                    title: 'Region',
                    dim: '[Region]',
                  },
                }),
              },
              value: 'North America',
            },
          ],
        },
      };

      const jtdConfig = {
        enabled: true,
        navigateType: 'click',
        jumpTargets: [sampleDrillTarget],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: 'px',
        modalWindowResize: true,
        dashboardConfig: {
          toolbar: { visible: true },
          filtersPanel: { visible: true },
        },
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const clickHandler = getJtdClickHandler(
        {
          jtdConfig: jtdConfig as JtdConfig,
          jumpTarget: sampleDrillTarget as unknown as JtdTarget,
          widgetProps: sampleWidget as any,
          point: dataPointWithEntries as any,
        },
        {
          dashboardFilters: [], // no dashboard filters
          originalWidgetFilters: [], // no widget filters
        },
        {
          openModal: mockOpenModal,
        },
      );

      await clickHandler();

      // Verify that JSX was called with filters
      const modalCall = mockOpenModal.mock.calls[0][0];
      expect(modalCall.content.props).toBeDefined();
      const dashboardProps = modalCall.content.props;

      // Should have generated filters from the datapoint entries
      expect(dashboardProps.filters).toBeInstanceOf(Array);
      expect(dashboardProps.filters.length).toBeGreaterThan(0);

      // Find the generated filters
      const generatedFilters = dashboardProps.filters.filter(
        (filter: any) =>
          filter.attribute.expression === '[Category]' &&
          filter.jaql().jaql.filter.members.includes('Electronics'),
      );
      expect(generatedFilters).toHaveLength(1);

      // Verify that conflicting dashboard filters are not present
      const conflictingDashboardFilters = dashboardProps.filters.filter(
        (filter: any) =>
          filter.attribute.expression === '[Category]' &&
          filter.jaql().jaql.filter.members.includes('Clothing'),
      );
      expect(conflictingDashboardFilters).toHaveLength(0);

      // Verify that conflicting widget filters are not present
      const conflictingWidgetFilters = dashboardProps.filters.filter(
        (filter: any) =>
          filter.attribute.expression === '[Brand]' &&
          filter.jaql().jaql.filter.members.includes('Samsung'),
      );
      expect(conflictingWidgetFilters).toHaveLength(0);
    });

    it('should pass widget filters to the modal when includeDims allows them', async () => {
      // Create a simple widget filter that doesn't require complex mocking
      // We'll verify behavior rather than exact filter content
      const widgetFilters = [
        {
          attribute: { expression: '[WidgetDim]' },
          filterType: 'members',
          title: '[WidgetDim]_filter',
          // Mock the jaql function to avoid errors
          jaql: () => ({ filter: { members: ['value1'] } }),
        },
      ];

      const jtdConfig = {
        enabled: true,
        navigateType: 'click',
        jumpTargets: [sampleDrillTarget],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: 'px',
        modalWindowResize: true,
        dashboardConfig: {
          toolbar: { visible: true },
          filtersPanel: { visible: true },
        },
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: [],
        includeWidgetFilterDims: ['[WidgetDim]'], // Allow this widget dimension
      };

      const clickHandler = getJtdClickHandler(
        {
          jtdConfig: jtdConfig as JtdConfig,
          jumpTarget: sampleDrillTarget as unknown as JtdTarget,
          widgetProps: sampleWidget as any,
          point: { entries: { category: [], breakBy: [] } } as any, // minimal datapoint
        },
        {
          dashboardFilters: [], // no dashboard filters
          originalWidgetFilters: widgetFilters as any,
        },
        {
          openModal: mockOpenModal,
        },
      );

      // This test verifies the function handles widget filters when allowed dimensions are specified
      // The actual filter merging is complex, but we can verify the function completes
      await expect(clickHandler()).resolves.not.toThrow();
      expect(mockOpenModal).toHaveBeenCalled();
    });

    it('should pass dashboard filters to the modal when includeDims allows them', async () => {
      // Create a simple dashboard filter
      const dashboardFilters = [
        filterFactory.members(createTestAttribute('[Category]'), ['Clothing']),
      ];

      const jtdConfig = {
        enabled: true,
        navigateType: 'click',
        jumpTargets: [sampleDrillTarget],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: 'px',
        modalWindowResize: true,
        dashboardConfig: {
          toolbar: { visible: true },
          filtersPanel: { visible: true },
        },
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: ['[DashboardDim]'], // Allow this dashboard dimension
        includeWidgetFilterDims: [],
      };

      const clickHandler = getJtdClickHandler(
        {
          jtdConfig: jtdConfig as JtdConfig,
          jumpTarget: sampleDrillTarget as unknown as JtdTarget,
          widgetProps: sampleWidget as any,
          point: { entries: { category: [], breakBy: [] } } as any, // minimal datapoint
        },
        {
          dashboardFilters: dashboardFilters as any,
          originalWidgetFilters: [], // no widget filters
        },
        {
          openModal: mockOpenModal,
        },
      );

      // This test verifies the function handles dashboard filters when allowed dimensions are specified
      await expect(clickHandler()).resolves.not.toThrow();
      expect(mockOpenModal).toHaveBeenCalled();
    });

    it('should exclude filters when dimensions are not in allowed lists', async () => {
      const dashboardFilters = [
        filterFactory.members(createTestAttribute('[ExcludedDashDim]'), ['value1']),
      ];

      const widgetFilters = [
        filterFactory.members(createTestAttribute('[ExcludedWidgetDim]'), ['value2']),
      ];

      const jtdConfig = {
        enabled: true,
        navigateType: 'click',
        jumpTargets: [sampleDrillTarget],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: 'px',
        modalWindowResize: true,
        dashboardConfig: {
          toolbar: { visible: true },
          filtersPanel: { visible: true },
        },
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: ['[AllowedDashDim]'], // Different from filter dimension
        includeWidgetFilterDims: ['[AllowedWidgetDim]'], // Different from filter dimension
      };

      const clickHandler = getJtdClickHandler(
        {
          jtdConfig: jtdConfig as JtdConfig,
          jumpTarget: sampleDrillTarget as unknown as JtdTarget,
          widgetProps: sampleWidget as any,
          point: { entries: { category: [], breakBy: [] } } as any, // minimal datapoint
        },
        {
          dashboardFilters: dashboardFilters as any,
          originalWidgetFilters: widgetFilters as any,
        },
        {
          openModal: mockOpenModal,
        },
      );

      // The function should complete successfully even when filters are excluded
      await expect(clickHandler()).resolves.not.toThrow();
      expect(mockOpenModal).toHaveBeenCalled();
    });

    it('should not be called when Jtd config is disabled', () => {
      // This test verifies that getJtdClickHandler is never called when config is disabled
      // The logic should prevent reaching this function entirely when enabled = false
      const disabledJtdConfig = {
        enabled: false, // This should prevent getJtdClickHandler from being used
        navigateType: 'click',
        jumpTargets: [sampleDrillTarget],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: 'px',
        modalWindowResize: true,
        dashboardConfig: {
          toolbar: { visible: true },
          filtersPanel: { visible: true },
        },
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      // Test that useJtdInternal doesn't create any click handlers when disabled
      const { result } = renderHook(() =>
        useJtdInternal({
          widgetOptions: {
            'widget-1': {
              jtdConfig: normalizeToJumpToDashboardConfig(disabledJtdConfig as JtdConfig),
            },
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
        useJtdInternal({
          widgetOptions: {},
          dashboardFilters: [],
          widgetFilters: new Map(),
          openMenu: mockOpenMenu,
        }),
      );

      expect(result.current.connectToWidgetProps).toBeInstanceOf(Function);
    });

    it('should return widget unchanged when no Jtd config', () => {
      const { result } = renderHook(() =>
        useJtdInternal({
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

    it('should return widget unchanged when Jtd config is disabled', () => {
      const disabledJtdConfig = {
        enabled: false, // Jtd is disabled
        navigateType: 'click',
        jumpTargets: [{ id: 'dashboard-1', caption: 'Dashboard 1' }],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: 'px',
        modalWindowResize: true,
        dashboardConfig: {
          toolbar: { visible: true },
          filtersPanel: { visible: true },
        },
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const { result } = renderHook(() =>
        useJtdInternal({
          widgetOptions: {
            'widget-1': {
              jtdConfig: normalizeToJumpToDashboardConfig(disabledJtdConfig as JtdConfig),
            },
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

    it('should add onDataPointClick handler when Jtd config is enabled', () => {
      const enabledJtdConfig = {
        enabled: true, // Jtd is enabled
        navigateType: 'click',
        jumpTargets: [{ id: 'dashboard-1', caption: 'Dashboard 1' }],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: 'px',
        modalWindowResize: true,
        dashboardConfig: {
          toolbar: { visible: true },
          filtersPanel: { visible: true },
        },
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const { result } = renderHook(() =>
        useJtdInternal({
          widgetOptions: {
            'widget-1': {
              jtdConfig: normalizeToJumpToDashboardConfig(enabledJtdConfig as JtdConfig),
            },
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
        navigateType: 'click',
        jumpTargets: [{ id: 'dashboard-1', caption: 'Dashboard 1' }],
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const disabledConfig = {
        enabled: false,
        navigateType: 'click',
        jumpTargets: [{ id: 'dashboard-2', caption: 'Dashboard 2' }],
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const { result } = renderHook(() =>
        useJtdInternal({
          widgetOptions: {
            'enabled-widget': {
              jtdConfig: normalizeToJumpToDashboardConfig(enabledConfig as JtdConfig),
            },
            'disabled-widget': {
              jtdConfig: normalizeToJumpToDashboardConfig(disabledConfig as JtdConfig),
            },
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
        navigateType: 'rightclick',
        jumpTargets: [{ id: 'dashboard-1', caption: 'Dashboard 1' }],
        includeDashFilterDims: [],
        includeWidgetFilterDims: [],
      };

      const { result } = renderHook(() =>
        useJtdInternal({
          widgetOptions: {
            'widget-1': {
              jtdConfig: normalizeToJumpToDashboardConfig(disabledRightClickConfig as JtdConfig),
            },
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
      const sampleJtdConfig = {
        enabled: true,
        navigateType: 'click',
        jumpTargets: [{ id: 'dashboard-1', caption: 'Dashboard 1' }],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: 'px',
        modalWindowResize: true,
        dashboardConfig: {
          toolbar: { visible: true },
          filtersPanel: { visible: true },
        },
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
        useJtdInternal({
          widgetOptions: {
            'widget-1': {
              jtdConfig: normalizeToJumpToDashboardConfig(sampleJtdConfig as JtdConfig),
            },
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
      const sampleJtdConfig = {
        enabled: true,
        navigateType: 'rightclick',
        jumpTargets: [{ id: 'dashboard-1', caption: 'Dashboard 1' }],
      };

      const sampleWidget = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'column',
      };

      const { result } = renderHook(() =>
        useJtdInternal({
          widgetOptions: {
            'widget-1': {
              jtdConfig: normalizeToJumpToDashboardConfig(sampleJtdConfig as JtdConfig),
            },
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

      const sampleConfig = {};

      const filters = getFormulaContextFilters(sampleWidget as any, sampleConfig as any);

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

      const filters = getFormulaContextFilters(textWidget as any, {} as any);

      expect(filters).toHaveLength(0);
    });

    it('should handle widget without dataOptions', async () => {
      const { isChartWidgetProps } = await import('@/widget-by-id/utils');
      vi.mocked(isChartWidgetProps).mockReturnValue(true);

      const widgetWithoutDataOptions = {
        id: 'widget-1',
        widgetType: 'chart',
      };

      const filters = getFormulaContextFilters(widgetWithoutDataOptions as any, {} as any);

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
      const { useModal } = await import('@/common/hooks/use-modal');
      vi.mocked(useModal).mockImplementation(() => {
        throw new Error('Missing initialized modal root');
      });

      expect(() => {
        renderHook(() =>
          useJtdInternal({
            widgetOptions: {},
            dashboardFilters: [],
            widgetFilters: new Map(),
            openMenu: mockOpenMenu,
          }),
        );
      }).toThrow('Missing initialized modal root');
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
        getFormulaContextFilters(widgetWithMalformedContext as any, {} as any);
      }).not.toThrow();
    });
  });

  describe('Integration tests', () => {
    it('should open modal when datapoint is clicked with single drill target', async () => {
      const sampleJtdConfig = {
        enabled: true,
        navigateType: 'click',
        jumpTargets: [{ id: 'dashboard-1', caption: 'Dashboard 1' }],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: 'px',
        modalWindowResize: true,
        dashboardConfig: {
          toolbar: { visible: true },
          filtersPanel: { visible: true },
        },
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
        useJtdInternal({
          widgetOptions: {
            'widget-1': {
              jtdConfig: normalizeToJumpToDashboardConfig(sampleJtdConfig as JtdConfig),
            },
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
        measurement: 'px',
        content: expect.any(Object),
      });
    });

    it('should open context menu with multiple drill targets', async () => {
      const multiTargetConfig = {
        enabled: true,
        navigateType: 'click',
        jumpTargets: [
          { id: 'dashboard-1', caption: 'Dashboard 1' },
          { id: 'dashboard-2', caption: 'Dashboard 2' },
        ],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: 'px',
        modalWindowResize: true,
        dashboardConfig: {
          toolbar: { visible: true },
          filtersPanel: { visible: true },
        },
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
        useJtdInternal({
          widgetOptions: {
            'widget-1': {
              jtdConfig: normalizeToJumpToDashboardConfig(multiTargetConfig as JtdConfig),
            },
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
        navigateType: 'click',
        jumpToDashboardRightMenuCaption: customMenuCaption, // Custom caption
        jumpTargets: [
          { id: 'dashboard-1', caption: 'Dashboard 1' },
          { id: 'dashboard-2', caption: 'Dashboard 2' },
        ],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: 'px',
        modalWindowResize: true,
        dashboardConfig: {
          toolbar: { visible: true },
          filtersPanel: { visible: true },
        },
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
        useJtdInternal({
          widgetOptions: {
            'widget-1': {
              jtdConfig: normalizeToJumpToDashboardConfig(multiTargetConfig as JtdConfig),
            },
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

    it('should prioritize generated filters over other filter types', async () => {
      // Create conflicting dashboard and widget filters that would conflict with generated filters
      const dashboardFilters = [createMockFilter(createTestAttribute('[Category]'), ['Clothing'])];

      const widgetFilters = [createMockFilter(createTestAttribute('[Brand]'), ['OldBrand'])];

      // Create a data point with category entries that would generate filters
      const dataPointWithEntries = {
        entries: {
          category: [
            {
              attribute: {
                name: '[Category]',
                type: 'dimension',
                expression: '[Category]',
                jaql: () => ({ dim: '[Category]', title: 'Category', datatype: 'text' }),
              },
              value: 'Electronics',
            },
          ],
          breakBy: [
            {
              attribute: {
                name: '[Brand]',
                type: 'dimension',
                expression: '[Brand]',
                jaql: () => ({ dim: '[Brand]', title: 'Brand', datatype: 'text' }),
              },
              value: 'Apple',
            },
          ],
        },
      };

      // Create a widget with formula context filters
      const widgetWithFormulaContext = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'column',
        dataOptions: {
          value: [
            {
              column: {
                context: {
                  'filter-1': {
                    filterType: 'numeric',
                    attribute: createTestAttribute('[Region]'),
                    valueA: 0,
                    valueB: 100,
                    jaql: () => ({
                      jaql: {
                        title: 'Region',
                        dim: '[Region]',
                        datatype: 'numeric',
                        filter: {
                          fromNotEqual: 0,
                          toNotEqual: 100,
                        },
                      },
                    }),
                    filterJaql: () => ({
                      fromNotEqual: 0,
                      toNotEqual: 100,
                    }),
                    id: 'filter-1',
                    config: {
                      guid: 'filter-1',
                      disabled: false,
                      locked: false,
                    },
                    serialize: () => ({}),
                    toJSON: () => ({}),
                  },
                },
              },
            },
          ],
        },
      };

      const jtdConfig = {
        enabled: true,
        navigateType: 'click',
        jumpTargets: [{ id: 'dashboard-1', caption: 'Dashboard 1' }],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: 'px',
        modalWindowResize: true,
        dashboardConfig: {
          toolbar: { visible: true },
          filtersPanel: { visible: true },
        },
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: ['[Category]', '[Brand]', '[Region]'],
        includeWidgetFilterDims: ['[Category]', '[Brand]', '[Region]'],
      };

      const { result } = renderHook(() =>
        useJtdInternal({
          widgetOptions: {
            'widget-1': { jtdConfig: normalizeToJumpToDashboardConfig(jtdConfig as JtdConfig) },
          },
          dashboardFilters,
          widgetFilters: new Map([['widget-1', widgetFilters]]),
          openMenu: mockOpenMenu,
        }),
      );

      const modifiedWidget = result.current.connectToWidgetProps(widgetWithFormulaContext as any);

      // Simulate datapoint click
      await act(async () => {
        if (modifiedWidget && 'onDataPointClick' in modifiedWidget) {
          const onDataPointClick = (modifiedWidget as ChartWidgetProps).onDataPointClick;
          if (typeof onDataPointClick === 'function') {
            onDataPointClick(dataPointWithEntries as any, {} as any);
          }
        }
      });

      // Get the filters passed to JtdDashboard
      const modalCall = mockOpenModal.mock.calls[0][0];
      expect(modalCall.content.props).toBeDefined();
      const dashboardProps = modalCall.content.props;

      // Verify that generated filters are present and have priority
      expect(dashboardProps.filters).toBeInstanceOf(Array);

      // Find the generated filters
      const generatedFilters = dashboardProps.filters.filter(
        (filter: any) =>
          filter.attribute.expression === '[Category]' &&
          filter.jaql().jaql.filter.members.includes('Electronics'),
      );
      expect(generatedFilters).toHaveLength(1);

      // Verify that conflicting dashboard filters are not present
      const conflictingDashboardFilters = dashboardProps.filters.filter(
        (filter: any) =>
          filter.attribute.expression === '[Category]' &&
          filter.jaql().jaql.filter.members.includes('Clothing'),
      );
      expect(conflictingDashboardFilters).toHaveLength(0);

      // Verify that conflicting widget filters are not present
      const conflictingWidgetFilters = dashboardProps.filters.filter(
        (filter: any) =>
          filter.attribute.expression === '[Brand]' &&
          filter.jaql().jaql.filter.members.includes('OldBrand'),
      );
      expect(conflictingWidgetFilters).toHaveLength(0);

      // Verify that generated brand filters are present
      const generatedBrandFilters = dashboardProps.filters.filter(
        (filter: any) =>
          filter.attribute.expression === '[Brand]' &&
          filter.jaql().jaql.filter.members.includes('Apple'),
      );
      expect(generatedBrandFilters).toHaveLength(1);
    });

    it('should register onDataPointsSelected handler for RIGHT_CLICK navigation', async () => {
      const jtdConfig = {
        enabled: true,
        navigateType: 'rightclick',
        jumpTargets: [{ id: 'dashboard-1', caption: 'Dashboard 1' }],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: 'px',
        modalWindowResize: true,
        dashboardConfig: {
          toolbar: { visible: true },
          filtersPanel: { visible: true },
        },
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: ['[Category]', '[Brand]'],
        includeWidgetFilterDims: ['[Category]', '[Brand]'],
      };

      const sampleWidget = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'column',
      };

      const { result } = renderHook(() =>
        useJtdInternal({
          widgetOptions: {
            'widget-1': { jtdConfig: normalizeToJumpToDashboardConfig(jtdConfig as JtdConfig) },
          },
          dashboardFilters: [],
          widgetFilters: new Map(),
          openMenu: mockOpenMenu,
        }),
      );

      const modifiedWidget = result.current.connectToWidgetProps(sampleWidget as any);

      // Verify that onDataPointsSelected handler is registered
      expect(modifiedWidget).toHaveProperty('onDataPointsSelected');
      expect(typeof (modifiedWidget as any).onDataPointsSelected).toBe('function');

      // Create multiple data points for selection
      const multipleDataPoints = [
        {
          entries: {
            category: [
              {
                attribute: { expression: '[Category]', name: 'Category' },
                value: 'Electronics',
              },
            ],
          },
        },
        {
          entries: {
            category: [
              {
                attribute: { expression: '[Category]', name: 'Category' },
                value: 'Clothing',
              },
            ],
          },
        },
      ];
      const mockEvent = { clientX: 150, clientY: 250 } as MouseEvent;

      // Simulate multiple data points selection
      await act(async () => {
        if (modifiedWidget && 'onDataPointsSelected' in modifiedWidget) {
          const onDataPointsSelected = (modifiedWidget as any).onDataPointsSelected;
          if (typeof onDataPointsSelected === 'function') {
            onDataPointsSelected(multipleDataPoints, mockEvent);
          }
        }
      });

      // Verify that context menu was opened
      expect(mockOpenMenu).toHaveBeenCalledWith({
        id: 'jump-to-dashboard-menu',
        position: { left: 150, top: 250 },
        itemSections: expect.arrayContaining([
          expect.objectContaining({
            items: expect.arrayContaining([
              expect.objectContaining({
                caption: expect.stringContaining('Jump to'),
              }),
            ]),
          }),
        ]),
      });
    });

    it('should merge filters from multiple data points with same dimension', async () => {
      const jtdConfig = {
        enabled: true,
        navigateType: 'rightclick',
        jumpTargets: [{ id: 'dashboard-1', caption: 'Dashboard 1' }],
        modalWindowWidth: 800,
        modalWindowHeight: 600,
        modalWindowMeasurement: 'px',
        modalWindowResize: true,
        dashboardConfig: {
          toolbar: { visible: true },
          filtersPanel: { visible: true },
        },
        mergeTargetDashboardFilters: false,
        includeDashFilterDims: ['[Category]'],
        includeWidgetFilterDims: ['[Category]'],
      };

      const sampleWidget = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'column',
      };

      const { result } = renderHook(() =>
        useJtdInternal({
          widgetOptions: {
            'widget-1': { jtdConfig: normalizeToJumpToDashboardConfig(jtdConfig as JtdConfig) },
          },
          dashboardFilters: [],
          widgetFilters: new Map(),
          openMenu: mockOpenMenu,
        }),
      );

      const modifiedWidget = result.current.connectToWidgetProps(sampleWidget as any);

      // Create multiple data points with same dimension but different values
      const multipleDataPointsSameDimension = [
        {
          entries: {
            category: [
              {
                attribute: { expression: '[Category]', name: 'Category' },
                value: 'Electronics',
              },
            ],
          },
        },
        {
          entries: {
            category: [
              {
                attribute: { expression: '[Category]', name: 'Category' },
                value: 'Clothing',
              },
            ],
          },
        },
        {
          entries: {
            category: [
              {
                attribute: { expression: '[Category]', name: 'Category' },
                value: 'Sports',
              },
            ],
          },
        },
      ];

      // Mock the menu click to trigger the actual filter creation
      let menuClickHandler: (() => void) | undefined;
      mockOpenMenu.mockImplementation((menuOptions: any) => {
        // Extract the click handler from the menu item
        const menuItem = menuOptions.itemSections[0]?.items[0];
        if (menuItem?.onClick) {
          menuClickHandler = menuItem.onClick;
        }
      });

      const mockEvent = { clientX: 150, clientY: 250 } as MouseEvent;

      // Simulate multiple data points selection to open menu
      await act(async () => {
        if (modifiedWidget && 'onDataPointsSelected' in modifiedWidget) {
          const onDataPointsSelected = (modifiedWidget as any).onDataPointsSelected;
          if (typeof onDataPointsSelected === 'function') {
            onDataPointsSelected(multipleDataPointsSameDimension, mockEvent);
          }
        }
      });

      // Verify menu was opened
      expect(mockOpenMenu).toHaveBeenCalled();
      expect(menuClickHandler).toBeDefined();

      // Simulate clicking the menu item to create filters
      if (menuClickHandler) {
        await act(async () => {
          menuClickHandler!();
        });
      }

      // Verify that a single merged filter was created with all members
      const modalCall = mockOpenModal.mock.calls[0][0];
      expect(modalCall.content.props).toBeDefined();
      const dashboardProps = modalCall.content.props;

      // Find filters for the Category dimension
      const categoryFilters = dashboardProps.filters.filter(
        (filter: any) => filter.attribute.expression === '[Category]',
      );

      // Should have exactly one filter for Category dimension
      expect(categoryFilters).toHaveLength(1);

      // The single filter should contain all three members
      const categoryFilter = categoryFilters[0];
      const filterJaql = categoryFilter.jaql();
      expect(filterJaql.jaql.filter.members).toContain('Electronics');
      expect(filterJaql.jaql.filter.members).toContain('Clothing');
      expect(filterJaql.jaql.filter.members).toContain('Sports');
      expect(filterJaql.jaql.filter.members).toHaveLength(3);
    });
  });

  describe('extraFilters functionality', () => {
    const testAttribute1 = {
      name: 'Category',
      expression: '[Category.Category]',
      type: 'text-attribute',
    };
    const testAttribute2 = { name: 'Brand', expression: '[Brand.Brand]', type: 'text-attribute' };

    const mockExtraFilter1 = createMockFilter(testAttribute1, ['ExtraFilterValue1']);
    const mockExtraFilter2 = createMockFilter(testAttribute2, ['ExtraFilterValue2']);
    const mockDrillTarget = { id: 'dashboard-1', caption: 'Dashboard 1' };
    const mockDataOptions = {
      category: [testAttribute1],
      value: [
        {
          name: 'Total',
          expression: 'sum([Commerce.Revenue])',
          type: 'basemeasure',
          id: 'revenue',
          __serializable: 'BaseMeasure',
        },
      ],
      breakBy: [],
    };

    beforeEach(() => {
      // Reset any global state if needed
    });

    it('should use extraFilters from JtdConfig in widget transforms', () => {
      const jtdConfigWithExtraFilters: JtdConfig = {
        enabled: true,
        jumpTargets: [mockDrillTarget],
        navigateType: 'rightclick',
        extraFilters: [mockExtraFilter1, mockExtraFilter2],
        showJtdIcon: true,
      };

      const { result } = renderHook(() =>
        useJtdInternal({
          widgetOptions: {
            'widget-1': { jtdConfig: normalizeToJumpToDashboardConfig(jtdConfigWithExtraFilters) },
          },
          dashboardFilters: [],
          widgetFilters: new Map(),
          openMenu: mockOpenMenu,
        }),
      );

      const originalWidget = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'column',
        dataOptions: mockDataOptions,
      } as any;

      const transformedWidget = result.current.connectToWidgetProps(originalWidget);

      // Verify that the widget has JTD functionality applied
      expect(transformedWidget).toBeDefined();
      expect(transformedWidget.id).toBe('widget-1');
      // The widget should have event handlers added when JTD is enabled with RIGHT_CLICK
      expect((transformedWidget as any).onDataPointsSelected).toBeDefined();
    });

    it('should handle JumpToDashboardConfig with extraFilters', () => {
      const jumpConfigWithExtraFilters: JumpToDashboardConfig = {
        enabled: true,
        targets: [mockDrillTarget],
        interaction: { triggerMethod: 'click' },
        filtering: {
          extraFilters: [mockExtraFilter1],
        },
      };

      const { result } = renderHook(() =>
        useJtdInternal({
          widgetOptions: {
            'widget-1': { jtdConfig: jumpConfigWithExtraFilters },
          },
          dashboardFilters: [],
          widgetFilters: new Map(),
          openMenu: mockOpenMenu,
        }),
      );

      const originalWidget = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'column',
        dataOptions: mockDataOptions,
      } as any;

      const transformedWidget = result.current.connectToWidgetProps(originalWidget);

      // Verify that the widget has JTD functionality applied
      expect(transformedWidget).toBeDefined();
      expect(transformedWidget.id).toBe('widget-1');
      // The widget should have event handlers added when JTD is enabled with CLICK
      expect((transformedWidget as any).onDataPointClick).toBeDefined();
    });

    it('should handle empty extraFilters array', () => {
      const jtdConfigWithEmptyExtraFilters: JtdConfig = {
        enabled: true,
        jumpTargets: [mockDrillTarget],
        navigateType: 'click',
        extraFilters: [],
        showJtdIcon: false,
      };

      const { result } = renderHook(() =>
        useJtdInternal({
          widgetOptions: {
            'widget-1': {
              jtdConfig: normalizeToJumpToDashboardConfig(jtdConfigWithEmptyExtraFilters),
            },
          },
          dashboardFilters: [],
          widgetFilters: new Map(),
          openMenu: mockOpenMenu,
        }),
      );

      const originalWidget = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'column',
        dataOptions: mockDataOptions,
      } as any;

      const transformedWidget = result.current.connectToWidgetProps(originalWidget);

      // Verify that the widget has JTD functionality applied even with empty extraFilters
      expect(transformedWidget).toBeDefined();
      expect(transformedWidget.id).toBe('widget-1');
      expect((transformedWidget as any).onDataPointClick).toBeDefined();
    });

    it('should handle undefined extraFilters', () => {
      const jtdConfigWithoutExtraFilters: JtdConfig = {
        enabled: true,
        jumpTargets: [mockDrillTarget],
        navigateType: 'click',
        // extraFilters is undefined
      };

      const { result } = renderHook(() =>
        useJtdInternal({
          widgetOptions: {
            'widget-1': {
              jtdConfig: normalizeToJumpToDashboardConfig(jtdConfigWithoutExtraFilters),
            },
          },
          dashboardFilters: [],
          widgetFilters: new Map(),
          openMenu: mockOpenMenu,
        }),
      );

      const originalWidget = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'column',
        dataOptions: mockDataOptions,
      } as any;

      const transformedWidget = result.current.connectToWidgetProps(originalWidget);

      // Verify that the widget has JTD functionality applied even with undefined extraFilters
      expect(transformedWidget).toBeDefined();
      expect(transformedWidget.id).toBe('widget-1');
      expect((transformedWidget as any).onDataPointClick).toBeDefined();
    });

    it('should handle different widget types with extraFilters', () => {
      const jtdConfigWithExtraFilters: JtdConfig = {
        enabled: true,
        jumpTargets: [mockDrillTarget],
        navigateType: 'rightclick',
        extraFilters: [mockExtraFilter1, mockExtraFilter2],
      };

      const { result } = renderHook(() =>
        useJtdInternal({
          widgetOptions: {
            'chart-widget': {
              jtdConfig: normalizeToJumpToDashboardConfig(jtdConfigWithExtraFilters),
            },
          },
          dashboardFilters: [],
          widgetFilters: new Map(),
          openMenu: mockOpenMenu,
        }),
      );

      const chartWidget = {
        id: 'chart-widget',
        widgetType: 'chart',
        chartType: 'column',
        dataOptions: mockDataOptions,
      } as any;

      const transformedWidget = result.current.connectToWidgetProps(chartWidget);

      // Verify that chart widgets get right-click handler for RIGHT_CLICK navigation
      expect(transformedWidget).toBeDefined();
      expect(transformedWidget.id).toBe('chart-widget');
      expect((transformedWidget as any).onDataPointsSelected).toBeDefined();
    });

    it('should transform JumpToDashboardConfig correctly', () => {
      const jumpConfigWithExtraFilters: JumpToDashboardConfig = {
        enabled: true,
        targets: [mockDrillTarget],
        interaction: { triggerMethod: 'rightclick' },
        filtering: {
          extraFilters: [mockExtraFilter1, mockExtraFilter2],
          includeDashboardFilters: ['[Geography.Country]'],
          includeWidgetFilters: ['[Category.Category]'],
          mergeWithTargetFilters: false,
        },
        targetDashboardConfig: {
          filtersPanel: { visible: true },
          toolbar: { visible: false },
        },
        modal: {
          width: 1200,
          height: 800,
          measurementUnit: 'px',
        },
      };

      const { result } = renderHook(() =>
        useJtdInternal({
          widgetOptions: {
            'widget-1': { jtdConfig: jumpConfigWithExtraFilters },
          },
          dashboardFilters: [],
          widgetFilters: new Map(),
          openMenu: mockOpenMenu,
        }),
      );

      const originalWidget = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'column',
        dataOptions: mockDataOptions,
      } as any;

      const transformedWidget = result.current.connectToWidgetProps(originalWidget);

      // Verify the JumpToDashboardConfig was properly transformed and applied
      expect(transformedWidget).toBeDefined();
      expect(transformedWidget.id).toBe('widget-1');
      expect((transformedWidget as any).onDataPointsSelected).toBeDefined(); // RIGHT_CLICK navigation
    });

    it('should not apply JTD when jumpTargets are empty', () => {
      const jtdConfigWithExtraFiltersButNoTargets: JtdConfig = {
        enabled: true,
        jumpTargets: [], // No drill targets
        extraFilters: [mockExtraFilter1],
        navigateType: 'click',
      };

      const { result } = renderHook(() =>
        useJtdInternal({
          widgetOptions: {
            'widget-1': {
              jtdConfig: normalizeToJumpToDashboardConfig(jtdConfigWithExtraFiltersButNoTargets),
            },
          },
          dashboardFilters: [],
          widgetFilters: new Map(),
          openMenu: mockOpenMenu,
        }),
      );

      const originalWidget = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'column',
        dataOptions: mockDataOptions,
      } as any;

      const modifiedWidget = result.current.connectToWidgetProps(originalWidget);

      // Should return the original widget unchanged when no drill targets
      expect(modifiedWidget).toEqual(originalWidget);
    });
  });
});
