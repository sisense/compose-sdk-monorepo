import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Filter, filterFactory } from '@sisense/sdk-data';
import {
  getJtdClickHandler,
  getJtdClickHandlerForMultiplePoints,
  handleDataPointClick,
  convertPivotToDataPoint,
  handlePivotDataPointClick,
  handleTextWidgetClick,
} from './jtd-handlers';
import { PivotTableDataPoint, DataPoint } from '@/types';
import { JtdConfig, JtdDrillTarget, JtdNavigateType } from '@/widget-by-id/types';
import { WidgetProps } from '@/props.js';
import {
  JtdCoreData,
  JtdContext,
  JtdActions,
  JtdClickHandlerData,
  JtdDataPointClickEvent,
} from './jtd-types';
import { SizeMeasurement } from '@/types';

// Mock dependencies
vi.mock('./jtd-filters', () => ({
  getFiltersFromDataPoint: vi.fn(),
  getFormulaContextFilters: vi.fn(),
  filterByAllowedDimensions: vi.fn(),
  handleFormulaDuplicateFilters: vi.fn(),
}));

vi.mock('@/dashboard/components/jtd-dashboard', () => ({
  JtdDashboard: vi.fn(({ children, ...props }) => (
    <div data-testid="jtd-dashboard" {...props}>
      {children}
    </div>
  )),
}));

// Import mocked functions
import * as jtdFilters from './jtd-filters';

describe('jtd-handlers', () => {
  const mockOpenModal = vi.fn(() => vi.fn()) as any; // Return a function
  const mockOpenMenu = vi.fn();

  const mockAttribute1 = {
    name: 'Category',
    type: 'text-attribute',
    expression: '[Category]',
    getSort: () => ({ direction: 'asc' }),
    sort: { direction: 'asc' },
    description: 'Category attribute',
    jaql: () => ({
      jaql: {
        title: 'Category',
        dim: '[Category]',
        datatype: 'text',
      },
    }),
  } as any;

  const mockAttribute2 = {
    name: 'Region',
    type: 'text-attribute',
    expression: '[Region]',
    getSort: () => ({ direction: 'asc' }),
    sort: { direction: 'asc' },
    description: 'Region attribute',
    jaql: () => ({
      jaql: {
        title: 'Region',
        dim: '[Region]',
        datatype: 'text',
      },
    }),
  } as any;

  const mockFilter1: Filter = filterFactory.members(mockAttribute1, ['Electronics']);
  const mockFilter2: Filter = filterFactory.members(mockAttribute2, ['North']);

  const mockJtdConfig: JtdConfig = {
    enabled: true,
    navigateType: JtdNavigateType.CLICK,
    drillTargets: [
      {
        id: 'target-dashboard-1',
        caption: 'Target Dashboard',
      },
    ],
    modalWindowWidth: 800,
    modalWindowHeight: 600,
    modalWindowMeasurement: SizeMeasurement.PIXEL,
    displayToolbarRow: true,
    displayFilterPane: true,
    includeDashFilterDims: ['Category'],
    includeWidgetFilterDims: ['Region'],
    mergeTargetDashboardFilters: false,
    showJtdIcon: true,
  };

  const mockWidgetProps: WidgetProps = {
    id: 'widget-1',
    widgetType: 'chart',
    chartType: 'column',
    dataOptions: {
      category: [{ name: 'Category', type: 'text-attribute' }],
      value: [{ name: 'Revenue', aggregation: 'sum' }],
    },
  } as any;

  const mockDataPoint: DataPoint = {
    value: 100,
    categoryValue: 'Electronics',
    categoryDisplayValue: 'Electronics',
  };

  const mockDrillTarget: JtdDrillTarget = {
    id: 'target-dashboard-1',
    caption: 'Target Dashboard',
  };

  const mockContext: JtdContext = {
    dashboardFilters: [mockFilter1],
    originalWidgetFilters: [mockFilter2],
  };

  const mockActions: JtdActions = {
    openModal: mockOpenModal,
    openMenu: mockOpenMenu,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    vi.mocked(jtdFilters.getFiltersFromDataPoint).mockReturnValue([mockFilter1]);
    vi.mocked(jtdFilters.getFormulaContextFilters).mockReturnValue([]);
    vi.mocked(jtdFilters.filterByAllowedDimensions).mockImplementation((filters) => filters);
  });

  describe('getJtdClickHandler', () => {
    it('should create a click handler with merged filters', () => {
      const data: JtdClickHandlerData = {
        jtdConfig: mockJtdConfig,
        widgetProps: mockWidgetProps,
        drillTarget: mockDrillTarget,
        point: mockDataPoint,
      };

      const handler = getJtdClickHandler(data, mockContext, mockActions);

      expect(typeof handler).toBe('function');
      expect(jtdFilters.getFiltersFromDataPoint).toHaveBeenCalledWith(mockDataPoint);
    });

    it('should handle case when no data point is provided', () => {
      const data: JtdClickHandlerData = {
        jtdConfig: mockJtdConfig,
        widgetProps: mockWidgetProps,
        drillTarget: mockDrillTarget,
      };

      const handler = getJtdClickHandler(data, mockContext, mockActions);

      expect(typeof handler).toBe('function');
      expect(jtdFilters.getFiltersFromDataPoint).not.toHaveBeenCalled();
    });

    it('should call openModal when handler is executed', () => {
      const data: JtdClickHandlerData = {
        jtdConfig: mockJtdConfig,
        widgetProps: mockWidgetProps,
        drillTarget: mockDrillTarget,
        point: mockDataPoint,
      };

      const handler = getJtdClickHandler(data, mockContext, mockActions);
      handler();

      expect(mockOpenModal).toHaveBeenCalledWith({
        title: 'Target Dashboard',
        width: 800,
        height: 600,
        measurement: 'px',
        content: expect.any(Object),
      });
    });

    it('should filter dashboard and widget filters based on config', () => {
      const data: JtdClickHandlerData = {
        jtdConfig: mockJtdConfig,
        widgetProps: mockWidgetProps,
        drillTarget: mockDrillTarget,
        point: mockDataPoint,
      };

      getJtdClickHandler(data, mockContext, mockActions);

      expect(jtdFilters.filterByAllowedDimensions).toHaveBeenCalledWith(
        mockContext.dashboardFilters,
        mockJtdConfig.includeDashFilterDims,
      );
      expect(jtdFilters.filterByAllowedDimensions).toHaveBeenCalledWith(
        mockContext.originalWidgetFilters,
        mockJtdConfig.includeWidgetFilterDims,
      );
    });
  });

  describe('getJtdClickHandlerForMultiplePoints', () => {
    it('should create a click handler for multiple data points', () => {
      const data: JtdClickHandlerData = {
        jtdConfig: mockJtdConfig,
        widgetProps: mockWidgetProps,
        points: [mockDataPoint, mockDataPoint],
        drillTarget: mockDrillTarget,
      };

      const handler = getJtdClickHandlerForMultiplePoints(data, mockContext, mockActions);

      expect(typeof handler).toBe('function');
    });

    it('should call openModal with merged filters from all points', () => {
      const points = [mockDataPoint, mockDataPoint];
      const data: JtdClickHandlerData = {
        jtdConfig: mockJtdConfig,
        widgetProps: mockWidgetProps,
        points,
        drillTarget: mockDrillTarget,
      };

      const handler = getJtdClickHandlerForMultiplePoints(data, mockContext, mockActions);
      handler();

      expect(jtdFilters.getFiltersFromDataPoint).toHaveBeenCalledTimes(points.length);
      expect(mockOpenModal).toHaveBeenCalledWith({
        title: 'Target Dashboard',
        width: 800,
        height: 600,
        measurement: SizeMeasurement.PIXEL,
        content: expect.any(Object),
      });
    });
  });

  describe('handleDataPointClick', () => {
    const mockEvent: JtdDataPointClickEvent = {
      nativeEvent: {} as PointerEvent,
      getJumpToDashboardMenuItem: vi.fn(),
    };

    it('should call the correct handler for single data point', () => {
      const data: JtdCoreData = {
        jtdConfig: mockJtdConfig,
        widgetProps: mockWidgetProps,
        point: mockDataPoint,
      };

      const result = handleDataPointClick(data, mockContext, mockActions, mockEvent);

      expect(typeof result).toBe('function');
    });

    it('should call the correct handler for multiple data points', () => {
      const data: JtdCoreData = {
        jtdConfig: mockJtdConfig,
        widgetProps: mockWidgetProps,
        points: [mockDataPoint, mockDataPoint],
      };

      const result = handleDataPointClick(data, mockContext, mockActions, mockEvent);

      expect(typeof result).toBe('function');
    });

    it('should throw error when no drill targets are available', () => {
      const data: JtdCoreData = {
        jtdConfig: { ...mockJtdConfig, drillTargets: [] },
        widgetProps: mockWidgetProps,
        point: mockDataPoint,
      };

      expect(() => {
        handleDataPointClick(data, mockContext, mockActions, mockEvent);
      }).toThrow('No drill targets available');
    });
  });

  describe('convertPivotToDataPoint', () => {
    it('should convert pivot data point to regular data point', () => {
      const pivotPoint: PivotTableDataPoint = {
        isDataCell: true,
        isCaptionCell: false,
        isTotalCell: false,
        entries: {
          rows: [
            {
              id: 'row1',
              dataOption: { name: 'Category' } as any,
              attribute: mockAttribute1,
              value: 'Electronics',
            },
            {
              id: 'row2',
              dataOption: { name: 'Product' } as any,
              attribute: mockAttribute1,
              value: 'Laptop',
            },
          ],
          columns: [
            {
              id: 'col1',
              dataOption: { name: 'Quarter' } as any,
              attribute: mockAttribute2,
              value: 'Q1',
            },
          ],
          values: [{ id: 'val1', dataOption: { name: 'Revenue' } as any, value: 1000 }],
        },
      };

      const result = convertPivotToDataPoint(pivotPoint);

      expect(result.entries).toBeDefined();
      expect(result.entries?.category).toHaveLength(3); // 2 rows + 1 column
      expect(result.entries?.value).toHaveLength(1);
      expect(result.entries?.breakBy).toEqual([]);
    });

    it('should handle pivot point with empty entries', () => {
      const pivotPoint: PivotTableDataPoint = {
        isDataCell: true,
        isCaptionCell: false,
        isTotalCell: false,
        entries: {
          rows: [],
          columns: [],
          values: [],
        },
      };

      const result = convertPivotToDataPoint(pivotPoint);

      expect(result.entries?.category).toEqual([]);
      expect(result.entries?.value).toEqual([]);
      expect(result.entries?.breakBy).toEqual([]);
    });
  });

  describe('handlePivotDataPointClick', () => {
    it('should convert pivot point and handle click', () => {
      const pivotPoint: PivotTableDataPoint = {
        isDataCell: true,
        isCaptionCell: false,
        isTotalCell: false,
        entries: {
          rows: [
            {
              id: 'row1',
              dataOption: { name: 'Category' } as any,
              attribute: mockAttribute1,
              value: 'Electronics',
            },
          ],
          columns: [
            {
              id: 'col1',
              dataOption: { name: 'Quarter' } as any,
              attribute: mockAttribute2,
              value: 'Q1',
            },
          ],
          values: [{ id: 'val1', dataOption: { name: 'Revenue' } as any, value: 150 }],
        },
      };

      const data = {
        jtdConfig: mockJtdConfig,
        widgetProps: mockWidgetProps,
        point: pivotPoint,
      };

      const result = handlePivotDataPointClick(data, mockContext, mockActions);

      expect(typeof result).toBe('function');
      expect(jtdFilters.getFiltersFromDataPoint).toHaveBeenCalled();
    });
  });

  describe('handleTextWidgetClick', () => {
    it('should create click handler for text widget', () => {
      const result = handleTextWidgetClick(
        mockJtdConfig,
        mockWidgetProps,
        mockContext.dashboardFilters,
        mockContext.originalWidgetFilters,
        mockOpenModal,
      );

      expect(typeof result).toBe('function');
    });

    it('should call openModal when text widget handler is executed', async () => {
      const result = handleTextWidgetClick(
        mockJtdConfig,
        mockWidgetProps,
        mockContext.dashboardFilters,
        mockContext.originalWidgetFilters,
        mockOpenModal,
      );

      // Since the function returns a Promise or executes a click handler directly
      if (result instanceof Promise) {
        await result;
      }

      expect(mockOpenModal).toHaveBeenCalledWith({
        title: 'Target Dashboard',
        width: 800,
        height: 600,
        measurement: SizeMeasurement.PIXEL,
        content: expect.any(Object),
      });
    });

    it('should throw error when no drill targets available for text widget', () => {
      expect(() => {
        handleTextWidgetClick(
          { ...mockJtdConfig, drillTargets: [] },
          mockWidgetProps,
          mockContext.dashboardFilters,
          mockContext.originalWidgetFilters,
          mockOpenModal,
        );
      }).toThrow('No drill targets available');
    });
  });
});
