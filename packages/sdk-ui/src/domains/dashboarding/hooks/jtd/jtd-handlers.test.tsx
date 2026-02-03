import React from 'react';

import { Filter, filterFactory } from '@sisense/sdk-data';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WidgetProps } from '@/props.js';
import { DataPoint, PivotTableDataPoint } from '@/types';

import * as jtdFilters from './jtd-filters.js';
import {
  convertPivotToDataPoint,
  getJtdClickHandler,
  getJtdClickHandlerForMultiplePoints,
  handleDataPointClick,
  handlePivotDataPointClick,
  handleTextWidgetClick,
} from './jtd-handlers.js';
import { JtdConfig, JtdTarget } from './jtd-types.js';
import {
  JtdActions,
  JtdClickHandlerData,
  JtdContext,
  JtdCoreData,
  JtdDataPointClickEvent,
} from './jtd-types.js';

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
    navigateType: 'click',
    jumpTargets: [
      {
        id: 'target-dashboard-1',
        caption: 'Target Dashboard',
      },
    ],
    modalWindowWidth: 800,
    modalWindowHeight: 600,
    modalWindowMeasurement: 'px',
    dashboardConfig: {
      toolbar: { visible: true },
      filtersPanel: { visible: true },
    },
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

  const mockJumpTarget: JtdTarget = {
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
        jumpTarget: mockJumpTarget,
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
        jumpTarget: mockJumpTarget,
      };

      const handler = getJtdClickHandler(data, mockContext, mockActions);

      expect(typeof handler).toBe('function');
      expect(jtdFilters.getFiltersFromDataPoint).not.toHaveBeenCalled();
    });

    it('should call openModal when handler is executed', () => {
      const data: JtdClickHandlerData = {
        jtdConfig: mockJtdConfig,
        widgetProps: mockWidgetProps,
        jumpTarget: mockJumpTarget,
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
        jumpTarget: mockJumpTarget,
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
        jumpTarget: mockJumpTarget,
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
        jumpTarget: mockJumpTarget,
      };

      const handler = getJtdClickHandlerForMultiplePoints(data, mockContext, mockActions);
      handler();

      expect(jtdFilters.getFiltersFromDataPoint).toHaveBeenCalledTimes(points.length);
      expect(mockOpenModal).toHaveBeenCalledWith({
        title: 'Target Dashboard',
        width: 800,
        height: 600,
        measurement: 'px',
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
        jtdConfig: { ...mockJtdConfig, jumpTargets: [] },
        widgetProps: mockWidgetProps,
        point: mockDataPoint,
      };

      expect(() => {
        handleDataPointClick(data, mockContext, mockActions, mockEvent);
      }).toThrow('jumpToDashboard.noJumpTargets');
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
              dataOption: { name: 'Category' } as any,
              attribute: mockAttribute1,
              value: 'Electronics',
            },
            {
              dataOption: { name: 'Product' } as any,
              attribute: mockAttribute1,
              value: 'Laptop',
            },
          ],
          columns: [
            {
              dataOption: { name: 'Quarter' } as any,
              attribute: mockAttribute2,
              value: 'Q1',
            },
          ],
          values: [{ dataOption: { name: 'Revenue' } as any, value: 1000 }],
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
    it('should not handle click when no dimension-specific targets match', () => {
      const pivotPoint: PivotTableDataPoint = {
        isDataCell: true,
        isCaptionCell: false,
        isTotalCell: false,
        entries: {
          rows: [
            {
              dataOption: { name: 'Category' } as any,
              attribute: mockAttribute1,
              value: 'Electronics',
            },
          ],
          columns: [
            {
              dataOption: { name: 'Quarter' } as any,
              attribute: mockAttribute2,
              value: 'Q1',
            },
          ],
          values: [{ dataOption: { name: 'Revenue' } as any, value: 150 }],
        },
      };

      const data = {
        jtdConfig: mockJtdConfig, // Has targets without pivotDimensions (no longer treated as fallback)
        widgetProps: mockWidgetProps,
        point: pivotPoint,
      };

      const result = handlePivotDataPointClick(data, mockContext, mockActions);

      // After removing fallback logic, should return undefined when no targets with pivotDimensions match
      expect(result).toBeUndefined();
      expect(jtdFilters.getFiltersFromDataPoint).not.toHaveBeenCalled();
    });

    it('should not drill when dimension is unsupported by pivot targets', () => {
      const pivotPoint: PivotTableDataPoint = {
        isDataCell: false,
        isCaptionCell: true,
        isTotalCell: false,
        entries: {
          rows: [
            {
              dataOption: { name: 'Unsupported' } as any,
              attribute: mockAttribute1,
              value: 'Some Value',
            },
          ],
          columns: [],
          values: [],
        },
      };

      // Create a JTD config with dimension-specific pivot targets
      const jtdConfigWithPivotTargets: JtdConfig = {
        ...mockJtdConfig,
        jumpTargets: [
          {
            id: 'target1',
            caption: 'Target 1',
            pivotDimensions: ['rows.0', 'columns.0'],
          },
          {
            id: 'target2',
            caption: 'Target 2',
            pivotDimensions: ['rows.0', 'columns.0'],
          },
        ],
      };

      const data = {
        jtdConfig: jtdConfigWithPivotTargets,
        widgetProps: mockWidgetProps,
        point: pivotPoint,
      };

      const result = handlePivotDataPointClick(data, mockContext, mockActions);

      // Should return undefined (no action) when dimension is not supported
      expect(result).toBeUndefined();
      expect(jtdFilters.getFiltersFromDataPoint).not.toHaveBeenCalled();
    });

    it('should not handle click when no dimension-specific targets are configured', () => {
      const pivotPoint: PivotTableDataPoint = {
        isDataCell: true,
        isCaptionCell: false,
        isTotalCell: false,
        entries: {
          rows: [
            {
              dataOption: { name: 'Any Dimension' } as any,
              attribute: mockAttribute1,
              value: 'Some Value',
            },
          ],
          columns: [],
          values: [],
        },
      };

      // Create a JTD config with non-pivot targets (no pivotDimensions)
      const jtdConfigWithoutPivotTargets: JtdConfig = {
        ...mockJtdConfig,
        jumpTargets: [
          {
            id: 'target1',
            caption: 'Target 1',
            // No pivotDimensions property = no longer treated as actionable
          },
          {
            id: 'target2',
            caption: 'Target 2',
          },
        ],
      };

      const data = {
        jtdConfig: jtdConfigWithoutPivotTargets,
        widgetProps: mockWidgetProps,
        point: pivotPoint,
      };

      const result = handlePivotDataPointClick(data, mockContext, mockActions);

      // After removing fallback logic, should return undefined when no targets with pivotDimensions exist
      expect(result).toBeUndefined();
      expect(jtdFilters.getFiltersFromDataPoint).not.toHaveBeenCalled();
    });

    it('should handle values cells with rows only (no columns)', () => {
      const pivotPoint: PivotTableDataPoint = {
        isDataCell: true,
        isCaptionCell: false,
        isTotalCell: false,
        entries: {
          rows: [
            {
              dataOption: { name: 'Category' } as any,
              attribute: mockAttribute1,
              value: 'Electronics',
            },
          ],
          columns: [], // No columns
          values: [
            {
              dataOption: { name: 'Revenue' } as any,
              value: 1500,
            },
            {
              dataOption: { name: 'Profit' } as any,
              value: 300,
            },
          ],
        },
      };

      // Create a JTD config with value-specific targets
      // Note: The dimension ID is generated from array position (values.length - 1)
      // With 2 values entries, the deepest is at position 1, so the ID is 'values.1'
      const jtdConfigWithValueTargets: JtdConfig = {
        ...mockJtdConfig,
        jumpTargets: [
          {
            id: 'value-target-1',
            caption: 'Revenue Target',
            pivotDimensions: ['values.1'],
          },
          {
            id: 'value-target-2',
            caption: 'Profit Target',
            pivotDimensions: ['values.1'], // This should match the deepest value
          },
        ],
      };

      const data = {
        jtdConfig: jtdConfigWithValueTargets,
        widgetProps: mockWidgetProps,
        point: pivotPoint,
      };

      const result = handlePivotDataPointClick(data, mockContext, mockActions);

      // Should return a function and select the target matching the deepest value dimension
      expect(typeof result).toBe('function');
      expect(jtdFilters.getFiltersFromDataPoint).toHaveBeenCalled();
    });

    it('should not allow clicks on column headers', () => {
      const pivotPoint: PivotTableDataPoint = {
        isDataCell: false,
        isCaptionCell: true, // This is a header cell
        isTotalCell: false,
        entries: {
          rows: [],
          columns: [
            {
              dataOption: { name: 'Year' } as any,
              attribute: mockAttribute1,
              value: '2023',
            },
            {
              dataOption: { name: 'Quarter' } as any,
              attribute: mockAttribute2,
              value: 'Q1',
            },
          ],
          values: [], // No values = column header click
        },
      };

      // Create a JTD config with column-specific targets
      const jtdConfigWithColumnTargets: JtdConfig = {
        ...mockJtdConfig,
        jumpTargets: [
          {
            id: 'year-target',
            caption: 'Year Target',
            pivotDimensions: ['columns.0'],
          },
          {
            id: 'quarter-target',
            caption: 'Quarter Target',
            pivotDimensions: ['columns.1'], // This should match the deepest column
          },
        ],
      };

      const data = {
        jtdConfig: jtdConfigWithColumnTargets,
        widgetProps: mockWidgetProps,
        point: pivotPoint,
      };

      const result = handlePivotDataPointClick(data, mockContext, mockActions);

      // Should return undefined (not clickable) for header cells
      expect(result).toBeUndefined();
      expect(jtdFilters.getFiltersFromDataPoint).not.toHaveBeenCalled();
    });

    it('should prioritize values over columns when both exist', () => {
      const pivotPoint: PivotTableDataPoint = {
        isDataCell: true,
        isCaptionCell: false,
        isTotalCell: false,
        entries: {
          rows: [
            {
              dataOption: { name: 'Category' } as any,
              attribute: mockAttribute1,
              value: 'Electronics',
            },
          ],
          columns: [
            {
              dataOption: { name: 'Year' } as any,
              attribute: mockAttribute1,
              value: '2023',
            },
          ],
          values: [
            {
              dataOption: { name: 'Revenue' } as any,
              value: 1000,
            },
          ],
        },
      };

      // Create targets for both column and value dimensions
      const jtdConfigWithMixedTargets: JtdConfig = {
        ...mockJtdConfig,
        jumpTargets: [
          {
            id: 'year-target',
            caption: 'Year Target',
            pivotDimensions: ['columns.0'],
          },
          {
            id: 'revenue-target',
            caption: 'Revenue Target',
            pivotDimensions: ['values.0'], // Values should take priority
          },
        ],
      };

      const data = {
        jtdConfig: jtdConfigWithMixedTargets,
        widgetProps: mockWidgetProps,
        point: pivotPoint,
      };

      const result = handlePivotDataPointClick(data, mockContext, mockActions);

      // Should prioritize values dimension over column dimension
      expect(typeof result).toBe('function');
      expect(jtdFilters.getFiltersFromDataPoint).toHaveBeenCalled();
    });

    it('should not allow clicks on single column headers', () => {
      const pivotPoint: PivotTableDataPoint = {
        isDataCell: false,
        isCaptionCell: true, // This is a header cell
        isTotalCell: false,
        entries: {
          rows: [],
          columns: [
            {
              dataOption: { name: 'Year' } as any,
              attribute: mockAttribute1,
              value: '2023',
            },
          ],
          values: [],
        },
      };

      const jtdConfigWithSingleColumn: JtdConfig = {
        ...mockJtdConfig,
        jumpTargets: [
          {
            id: 'year-target',
            caption: 'Year Target',
            pivotDimensions: ['columns.0'],
          },
        ],
      };

      const data = {
        jtdConfig: jtdConfigWithSingleColumn,
        widgetProps: mockWidgetProps,
        point: pivotPoint,
      };

      const result = handlePivotDataPointClick(data, mockContext, mockActions);

      // Should return undefined (not clickable) for header cells
      expect(result).toBeUndefined();
      expect(jtdFilters.getFiltersFromDataPoint).not.toHaveBeenCalled();
    });

    it('should handle single value dimension correctly', () => {
      const pivotPoint: PivotTableDataPoint = {
        isDataCell: true,
        isCaptionCell: false,
        isTotalCell: false,
        entries: {
          rows: [
            {
              dataOption: { name: 'Category' } as any,
              attribute: mockAttribute1,
              value: 'Electronics',
            },
          ],
          columns: [],
          values: [
            {
              dataOption: { name: 'Revenue' } as any,
              value: 1500,
            },
          ],
        },
      };

      const jtdConfigWithSingleValue: JtdConfig = {
        ...mockJtdConfig,
        jumpTargets: [
          {
            id: 'revenue-target',
            caption: 'Revenue Target',
            pivotDimensions: ['values.0'],
          },
        ],
      };

      const data = {
        jtdConfig: jtdConfigWithSingleValue,
        widgetProps: mockWidgetProps,
        point: pivotPoint,
      };

      const result = handlePivotDataPointClick(data, mockContext, mockActions);

      expect(typeof result).toBe('function');
      expect(jtdFilters.getFiltersFromDataPoint).toHaveBeenCalled();
    });

    it('should not allow clicks on three-level column hierarchy headers', () => {
      const pivotPoint: PivotTableDataPoint = {
        isDataCell: false,
        isCaptionCell: true, // This is a header cell
        isTotalCell: false,
        entries: {
          rows: [],
          columns: [
            {
              dataOption: { name: 'Year' } as any,
              attribute: mockAttribute1,
              value: '2023',
            },
            {
              dataOption: { name: 'Quarter' } as any,
              attribute: mockAttribute2,
              value: 'Q1',
            },
            {
              dataOption: { name: 'Month' } as any,
              attribute: mockAttribute1,
              value: 'January',
            },
          ],
          values: [],
        },
      };

      const jtdConfigWithThreeLevels: JtdConfig = {
        ...mockJtdConfig,
        jumpTargets: [
          {
            id: 'year-target',
            caption: 'Year Target',
            pivotDimensions: ['columns.0'],
          },
          {
            id: 'quarter-target',
            caption: 'Quarter Target',
            pivotDimensions: ['columns.0'],
          },
          {
            id: 'month-target',
            caption: 'Month Target',
            pivotDimensions: ['columns.2'], // Deepest level should be selected
          },
        ],
      };

      const data = {
        jtdConfig: jtdConfigWithThreeLevels,
        widgetProps: mockWidgetProps,
        point: pivotPoint,
      };

      const result = handlePivotDataPointClick(data, mockContext, mockActions);

      // Should return undefined (not clickable) for header cells
      expect(result).toBeUndefined();
      expect(jtdFilters.getFiltersFromDataPoint).not.toHaveBeenCalled();
    });

    it('should handle multiple values selecting deepest one', () => {
      const pivotPoint: PivotTableDataPoint = {
        isDataCell: true,
        isCaptionCell: false,
        isTotalCell: false,
        entries: {
          rows: [
            {
              dataOption: { name: 'Category' } as any,
              attribute: mockAttribute1,
              value: 'Electronics',
            },
          ],
          columns: [],
          values: [
            {
              dataOption: { name: 'Revenue' } as any,
              value: 1000,
            },
            {
              dataOption: { name: 'Profit' } as any,
              value: 200,
            },
            {
              dataOption: { name: 'Margin' } as any,
              value: 0.2,
            },
          ],
        },
      };

      const jtdConfigWithMultipleValues: JtdConfig = {
        ...mockJtdConfig,
        jumpTargets: [
          {
            id: 'revenue-target',
            caption: 'Revenue Target',
            pivotDimensions: ['values.0'],
          },
          {
            id: 'profit-target',
            caption: 'Profit Target',
            pivotDimensions: ['values.0'],
          },
          {
            id: 'margin-target',
            caption: 'Margin Target',
            pivotDimensions: ['values.2'], // Deepest value should be selected
          },
        ],
      };

      const data = {
        jtdConfig: jtdConfigWithMultipleValues,
        widgetProps: mockWidgetProps,
        point: pivotPoint,
      };

      const result = handlePivotDataPointClick(data, mockContext, mockActions);

      // Should select the deepest (margin) value dimension
      expect(typeof result).toBe('function');
      expect(jtdFilters.getFiltersFromDataPoint).toHaveBeenCalled();
    });

    it('should handle empty entries gracefully', () => {
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

      const data = {
        jtdConfig: mockJtdConfig,
        widgetProps: mockWidgetProps,
        point: pivotPoint,
      };

      const result = handlePivotDataPointClick(data, mockContext, mockActions);

      // Should return undefined when no matching targets are found for empty entries
      expect(result).toBeUndefined();
      // getFiltersFromDataPoint should not be called since no jump is performed
      expect(jtdFilters.getFiltersFromDataPoint).not.toHaveBeenCalled();
    });

    it('should handle missing entries object', () => {
      const pivotPoint: PivotTableDataPoint = {
        isDataCell: true,
        isCaptionCell: false,
        isTotalCell: false,
        entries: undefined as any,
      };

      const data = {
        jtdConfig: mockJtdConfig,
        widgetProps: mockWidgetProps,
        point: pivotPoint,
      };

      const result = handlePivotDataPointClick(data, mockContext, mockActions);

      // Should return undefined when no matching targets are found for missing entries
      expect(result).toBeUndefined();
      // getFiltersFromDataPoint should not be called since no jump is performed
      expect(jtdFilters.getFiltersFromDataPoint).not.toHaveBeenCalled();
    });

    it('should throw error when no drill targets are configured', () => {
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

      const jtdConfigWithoutTargets: JtdConfig = {
        ...mockJtdConfig,
        jumpTargets: [], // Empty array
      };

      const data = {
        jtdConfig: jtdConfigWithoutTargets,
        widgetProps: mockWidgetProps,
        point: pivotPoint,
      };

      expect(() => {
        handlePivotDataPointClick(data, mockContext, mockActions);
      }).toThrow('jumpToDashboard.noJumpTargets');
    });

    it('should not drill for totals/blank-context when dimension-specific targets exist', () => {
      const pivotPoint: PivotTableDataPoint = {
        isDataCell: false,
        isCaptionCell: false,
        isTotalCell: true, // Total cell - no specific dimension
        entries: {
          rows: [],
          columns: [],
          values: [], // No dimension identified
        },
      };

      // Configure dimension-specific targets
      const jtdConfigWithPivotTargets: JtdConfig = {
        ...mockJtdConfig,
        jumpTargets: [
          {
            id: 'category-target',
            caption: 'Category Target',
            pivotDimensions: ['rows.0'],
          },
          {
            id: 'year-target',
            caption: 'Year Target',
            pivotDimensions: ['columns.0'],
          },
        ],
      };

      const data = {
        jtdConfig: jtdConfigWithPivotTargets,
        widgetProps: mockWidgetProps,
        point: pivotPoint,
      };

      const result = handlePivotDataPointClick(data, mockContext, mockActions);

      // Should return undefined (no drilling) when dimension-specific targets exist but no dimension identified
      expect(result).toBeUndefined();
      expect(jtdFilters.getFiltersFromDataPoint).not.toHaveBeenCalled();
    });

    it('should use first target for totals when no dimension-specific targets exist', () => {
      const pivotPoint: PivotTableDataPoint = {
        isDataCell: false,
        isCaptionCell: false,
        isTotalCell: true, // Total cell - no specific dimension
        entries: {
          rows: [],
          columns: [],
          values: [], // No dimension identified
        },
      };

      // Configure non-dimension-specific targets
      const jtdConfigWithoutPivotTargets: JtdConfig = {
        ...mockJtdConfig,
        jumpTargets: [
          {
            id: 'general-target-1',
            caption: 'General Target 1',
            // No pivotDimensions = not dimension-specific
          },
          {
            id: 'general-target-2',
            caption: 'General Target 2',
            // No pivotDimensions = not dimension-specific
          },
        ],
      };

      const data = {
        jtdConfig: jtdConfigWithoutPivotTargets,
        widgetProps: mockWidgetProps,
        point: pivotPoint,
      };

      const result = handlePivotDataPointClick(data, mockContext, mockActions);

      // Should return undefined (no action) for total cells - totals are not clickable
      expect(result).toBeUndefined();
      expect(jtdFilters.getFiltersFromDataPoint).not.toHaveBeenCalled();
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
        measurement: 'px',
        content: expect.any(Object),
      });
    });

    it('should throw error when no drill targets available for text widget', () => {
      expect(() => {
        handleTextWidgetClick(
          { ...mockJtdConfig, jumpTargets: [] },
          mockWidgetProps,
          mockContext.dashboardFilters,
          mockContext.originalWidgetFilters,
          mockOpenModal,
        );
      }).toThrow('jumpToDashboard.noJumpTargets');
    });
  });

  describe('extraFilters functionality', () => {
    const mockExtraFilter1 = {
      __serializable: 'MembersFilter',
      attribute: mockAttribute1,
      members: ['ExtraFilter1'],
      filterType: 'members',
      name: 'ExtraFilter1',
      type: 'filter',
      id: 'extra1',
      jaql: () => ({
        jaql: {
          title: mockAttribute1.name,
          dim: mockAttribute1.expression,
          datatype: 'text',
          filter: { members: ['ExtraFilter1'] },
        },
      }),
    } as any;

    const mockExtraFilter2 = {
      __serializable: 'MembersFilter',
      attribute: mockAttribute2,
      members: ['ExtraFilter2'],
      filterType: 'members',
      name: 'ExtraFilter2',
      type: 'filter',
      id: 'extra2',
      jaql: () => ({
        jaql: {
          title: mockAttribute2.name,
          dim: mockAttribute2.expression,
          datatype: 'text',
          filter: { members: ['ExtraFilter2'] },
        },
      }),
    } as any;

    const mockGeneratedFilter = {
      __serializable: 'MembersFilter',
      attribute: mockAttribute1,
      members: ['Generated'],
      filterType: 'members',
      name: 'Generated',
      type: 'filter',
      id: 'generated',
      jaql: () => ({
        jaql: {
          title: mockAttribute1.name,
          dim: mockAttribute1.expression,
          datatype: 'text',
          filter: { members: ['Generated'] },
        },
      }),
    } as any;

    const mockDashboardFilter = {
      __serializable: 'MembersFilter',
      attribute: mockAttribute1,
      members: ['Dashboard'],
      filterType: 'members',
      name: 'Dashboard',
      type: 'filter',
      id: 'dashboard',
      jaql: () => ({
        jaql: {
          title: mockAttribute1.name,
          dim: mockAttribute1.expression,
          datatype: 'text',
          filter: { members: ['Dashboard'] },
        },
      }),
    } as any;

    const mockFormulaFilter = {
      __serializable: 'MembersFilter',
      attribute: mockAttribute1,
      members: ['Formula'],
      filterType: 'members',
      name: 'Formula',
      type: 'filter',
      id: 'formula',
      jaql: () => ({
        jaql: {
          title: mockAttribute1.name,
          dim: mockAttribute1.expression,
          datatype: 'text',
          filter: { members: ['Formula'] },
        },
      }),
    } as any;

    beforeEach(() => {
      // Setup mocks to return specific filters
      (jtdFilters.getFiltersFromDataPoint as any).mockReturnValue([mockGeneratedFilter]);
      (jtdFilters.getFormulaContextFilters as any).mockReturnValue([mockFormulaFilter]);
      (jtdFilters.filterByAllowedDimensions as any).mockImplementation(
        (filters: Filter[]) => filters,
      );
      (jtdFilters.handleFormulaDuplicateFilters as any).mockImplementation(
        (filters: Filter[]) => filters,
      );
    });

    describe('getJtdClickHandler with extraFilters', () => {
      it('should merge extraFilters with highest priority', () => {
        const contextWithExtraFilters: JtdContext = {
          ...mockContext,
          dashboardFilters: [mockDashboardFilter],
          extraFilters: [mockExtraFilter1, mockExtraFilter2],
        };

        const data: JtdClickHandlerData = {
          jtdConfig: mockJtdConfig,
          jumpTarget: mockJtdConfig.jumpTargets[0],
          widgetProps: mockWidgetProps,
          point: mockDataPoint,
        };

        const handler = getJtdClickHandler(data, contextWithExtraFilters, mockActions);

        expect(typeof handler).toBe('function');

        // Call the handler to trigger modal opening
        handler();

        // Verify that openModal was called (which means filters were processed)
        expect(mockOpenModal).toHaveBeenCalled();

        // The mergeFilters function should be called with extraFilters last (highest priority)
        // We can't directly test the merge order, but we can verify that all filter types are considered
        expect(jtdFilters.getFiltersFromDataPoint).toHaveBeenCalledWith(mockDataPoint);
        expect(jtdFilters.getFormulaContextFilters).toHaveBeenCalledWith(
          mockWidgetProps,
          mockJtdConfig,
        );
        expect(jtdFilters.filterByAllowedDimensions).toHaveBeenCalled();
      });

      it('should handle empty extraFilters array', () => {
        const contextWithEmptyExtraFilters: JtdContext = {
          ...mockContext,
          extraFilters: [],
        };

        const data: JtdClickHandlerData = {
          jtdConfig: mockJtdConfig,
          jumpTarget: mockJtdConfig.jumpTargets[0],
          widgetProps: mockWidgetProps,
          point: mockDataPoint,
        };

        const handler = getJtdClickHandler(data, contextWithEmptyExtraFilters, mockActions);

        expect(typeof handler).toBe('function');
        handler();
        expect(mockOpenModal).toHaveBeenCalled();
      });

      it('should handle undefined extraFilters', () => {
        const contextWithoutExtraFilters: JtdContext = {
          ...mockContext,
          extraFilters: undefined,
        };

        const data: JtdClickHandlerData = {
          jtdConfig: mockJtdConfig,
          jumpTarget: mockJtdConfig.jumpTargets[0],
          widgetProps: mockWidgetProps,
          point: mockDataPoint,
        };

        const handler = getJtdClickHandler(data, contextWithoutExtraFilters, mockActions);

        expect(typeof handler).toBe('function');
        handler();
        expect(mockOpenModal).toHaveBeenCalled();
      });

      it('should work without data point but with extraFilters', () => {
        const contextWithExtraFilters: JtdContext = {
          ...mockContext,
          extraFilters: [mockExtraFilter1],
        };

        const data: JtdClickHandlerData = {
          jtdConfig: mockJtdConfig,
          jumpTarget: mockJtdConfig.jumpTargets[0],
          widgetProps: mockWidgetProps,
          point: undefined,
        };

        const handler = getJtdClickHandler(data, contextWithExtraFilters, mockActions);

        expect(typeof handler).toBe('function');
        handler();
        expect(mockOpenModal).toHaveBeenCalled();

        // Should not try to get filters from undefined data point
        expect(jtdFilters.getFiltersFromDataPoint).not.toHaveBeenCalled();
      });
    });

    describe('getJtdClickHandlerForMultiplePoints with extraFilters', () => {
      const mockPoints = [mockDataPoint, { ...mockDataPoint, categoryValue: 'Category2' }];

      beforeEach(() => {
        // Mock for multiple points - return different filters for each point
        (jtdFilters.getFiltersFromDataPoint as any)
          .mockReturnValueOnce([mockGeneratedFilter])
          .mockReturnValue([{ ...mockGeneratedFilter, members: ['Generated2'] }]);
      });

      it('should merge extraFilters with highest priority for multiple points', () => {
        const contextWithExtraFilters: JtdContext = {
          ...mockContext,
          dashboardFilters: [mockDashboardFilter],
          extraFilters: [mockExtraFilter1, mockExtraFilter2],
        };

        const data: JtdClickHandlerData = {
          jtdConfig: mockJtdConfig,
          jumpTarget: mockJtdConfig.jumpTargets[0],
          widgetProps: mockWidgetProps,
          points: mockPoints,
        };

        const handler = getJtdClickHandlerForMultiplePoints(
          data,
          contextWithExtraFilters,
          mockActions,
        );

        expect(typeof handler).toBe('function');
        handler();
        expect(mockOpenModal).toHaveBeenCalled();

        // Should process filters from all points
        expect(jtdFilters.getFiltersFromDataPoint).toHaveBeenCalledTimes(2);
        expect(jtdFilters.getFormulaContextFilters).toHaveBeenCalledWith(
          mockWidgetProps,
          mockJtdConfig,
        );
      });

      it('should handle empty points array with extraFilters', () => {
        const contextWithExtraFilters: JtdContext = {
          ...mockContext,
          extraFilters: [mockExtraFilter1],
        };

        const data: JtdClickHandlerData = {
          jtdConfig: mockJtdConfig,
          jumpTarget: mockJtdConfig.jumpTargets[0],
          widgetProps: mockWidgetProps,
          points: [],
        };

        const handler = getJtdClickHandlerForMultiplePoints(
          data,
          contextWithExtraFilters,
          mockActions,
        );

        // Should return a no-op function for empty points
        expect(typeof handler).toBe('function');
        handler();

        // Should not open modal for empty points
        expect(mockOpenModal).not.toHaveBeenCalled();
      });

      it('should handle undefined points with extraFilters', () => {
        const contextWithExtraFilters: JtdContext = {
          ...mockContext,
          extraFilters: [mockExtraFilter1],
        };

        const data: JtdClickHandlerData = {
          jtdConfig: mockJtdConfig,
          jumpTarget: mockJtdConfig.jumpTargets[0],
          widgetProps: mockWidgetProps,
          points: undefined,
        };

        const handler = getJtdClickHandlerForMultiplePoints(
          data,
          contextWithExtraFilters,
          mockActions,
        );

        expect(typeof handler).toBe('function');
        handler();

        // Should not open modal for undefined points
        expect(mockOpenModal).not.toHaveBeenCalled();
      });
    });

    describe('handleDataPointClick with extraFilters', () => {
      it('should pass extraFilters through context to click handlers', () => {
        const mockGetJumpToDashboardMenuItem = vi.fn().mockReturnValue({
          caption: 'Test Menu Item',
          onClick: vi.fn(),
        });

        // Use a config with multiple drill targets to trigger the menu path
        const multiTargetConfig: JtdConfig = {
          ...mockJtdConfig,
          jumpTargets: [mockJtdConfig.jumpTargets[0], { caption: 'Second Target', id: 'target-2' }],
        };

        const coreData: JtdCoreData = {
          jtdConfig: multiTargetConfig,
          widgetProps: mockWidgetProps,
          point: mockDataPoint,
        };

        const contextWithExtraFilters: JtdContext = {
          ...mockContext,
          extraFilters: [mockExtraFilter1],
        };

        const eventData: JtdDataPointClickEvent = {
          nativeEvent: new MouseEvent('click') as any,
          getJumpToDashboardMenuItem: mockGetJumpToDashboardMenuItem,
        };

        handleDataPointClick(
          coreData,
          contextWithExtraFilters,
          { ...mockActions, translate: vi.fn() },
          eventData,
        );

        expect(mockGetJumpToDashboardMenuItem).toHaveBeenCalled();

        // Verify the context passed includes extraFilters
        const callArgs = mockGetJumpToDashboardMenuItem.mock.calls[0];
        expect(callArgs).toBeDefined();
        expect(callArgs[1]).toEqual(contextWithExtraFilters); // context should be the second argument
      });
    });

    describe('handlePivotDataPointClick with extraFilters', () => {
      const mockPivotDataPoint: PivotTableDataPoint = {
        isDataCell: true,
        isCaptionCell: false,
        isTotalCell: false,
        entries: {
          rows: [
            {
              dataOption: { name: 'Category' } as any,
              attribute: mockAttribute1,
              value: 'Electronics',
            },
          ],
          columns: [],
          values: [
            {
              dataOption: { name: 'Revenue' } as any,
              value: 1000,
            },
          ],
        },
      } as PivotTableDataPoint;

      it('should handle extraFilters in pivot data point clicks', () => {
        // Create JTD config with proper pivotDimensions to match the mock data point
        const jtdConfigWithPivotTargets: JtdConfig = {
          ...mockJtdConfig,
          jumpTargets: [
            {
              id: 'target-with-pivot-dimensions',
              caption: 'Target With Pivot Dimensions',
              pivotDimensions: ['rows.0', 'values.0'], // Match both rows and values from mockPivotDataPoint
            },
          ],
        };

        const pivotData = {
          jtdConfig: jtdConfigWithPivotTargets,
          widgetProps: mockWidgetProps,
          point: mockPivotDataPoint,
        };

        const contextWithExtraFilters: JtdContext = {
          ...mockContext,
          extraFilters: [mockExtraFilter1, mockExtraFilter2],
        };

        const result = handlePivotDataPointClick(pivotData, contextWithExtraFilters, mockActions);

        // The handler should return a function, call it to trigger the modal
        if (typeof result === 'function') {
          (result as () => void)();
        }

        expect(mockOpenModal).toHaveBeenCalled();
      });
    });

    describe('handleTextWidgetClick with extraFilters', () => {
      it('should work with current signature (extraFilters handled internally)', async () => {
        // Note: handleTextWidgetClick currently doesn't accept extraFilters parameter
        // extraFilters would need to be passed through context in future versions
        await handleTextWidgetClick(
          mockJtdConfig,
          mockWidgetProps,
          mockContext.dashboardFilters,
          mockContext.originalWidgetFilters,
          mockOpenModal,
        );

        expect(mockOpenModal).toHaveBeenCalled();
      });

      it('should work with empty dashboard and widget filters', async () => {
        await handleTextWidgetClick(mockJtdConfig, mockWidgetProps, [], [], mockOpenModal);

        expect(mockOpenModal).toHaveBeenCalled();
      });
    });
  });
});
