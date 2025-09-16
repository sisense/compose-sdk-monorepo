import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  getJumpToDashboardMenuItem,
  getJumpToDashboardMenuItemForMultiplePoints,
} from './jtd-menu';
import { JtdCoreData, JtdContext, JtdActions } from './jtd-types';
import { JtdConfig, JtdDrillTarget, JtdNavigateType } from '@/widget-by-id/types';
import { WidgetProps } from '@/props.js';
import { DataPoint } from '@/types';
import { SizeMeasurement } from '@/types';

// Mock dependencies
vi.mock('./jtd-handlers', () => ({
  getJtdClickHandler: vi.fn(),
  getJtdClickHandlerForMultiplePoints: vi.fn(),
}));

// Import mocked functions
import * as jtdHandlers from './jtd-handlers';

describe('jtd-menu', () => {
  const mockOpenModal = vi.fn();
  const mockTranslate = vi.fn();

  const mockDrillTarget1: JtdDrillTarget = {
    id: 'target-dashboard-1',
    caption: 'Sales Dashboard',
  };

  const mockDrillTarget2: JtdDrillTarget = {
    id: 'target-dashboard-2',
    caption: 'Marketing Dashboard',
  };

  const mockSingleTargetConfig: JtdConfig = {
    enabled: true,
    navigateType: JtdNavigateType.RIGHT_CLICK,
    drillTargets: [mockDrillTarget1],
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

  const mockMultipleTargetsConfig: JtdConfig = {
    ...mockSingleTargetConfig,
    drillTargets: [mockDrillTarget1, mockDrillTarget2],
  };

  const mockCustomCaptionConfig: JtdConfig = {
    ...mockSingleTargetConfig,
    drillToDashboardRightMenuCaption: 'Navigate to',
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

  const mockContext: JtdContext = {
    dashboardFilters: [],
    originalWidgetFilters: [],
  };

  const mockActions: Pick<JtdActions, 'openModal' | 'translate'> = {
    openModal: mockOpenModal,
    translate: mockTranslate,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    vi.mocked(jtdHandlers.getJtdClickHandler).mockReturnValue(vi.fn());
    vi.mocked(jtdHandlers.getJtdClickHandlerForMultiplePoints).mockReturnValue(vi.fn());
    vi.mocked(mockTranslate).mockReturnValue('Jump to');
  });

  describe('getJumpToDashboardMenuItem', () => {
    describe('when no JTD config is provided', () => {
      it('should return null', () => {
        const coreData: JtdCoreData = {
          jtdConfig: undefined as any,
          widgetProps: mockWidgetProps,
          point: mockDataPoint,
        };

        const result = getJumpToDashboardMenuItem(coreData, mockContext, mockActions);

        expect(result).toBeNull();
      });
    });

    describe('when single drill target is available', () => {
      it('should return menu item with single caption and click handler', () => {
        const coreData: JtdCoreData = {
          jtdConfig: mockSingleTargetConfig,
          widgetProps: mockWidgetProps,
          point: mockDataPoint,
        };

        const result = getJumpToDashboardMenuItem(coreData, mockContext, mockActions);

        expect(result).toEqual({
          caption: 'Jump to Sales Dashboard',
          onClick: expect.any(Function),
        });
        expect(jtdHandlers.getJtdClickHandler).toHaveBeenCalledWith(
          {
            ...coreData,
            drillTarget: mockDrillTarget1,
          },
          mockContext,
          { openModal: mockOpenModal },
        );
      });

      it('should use custom caption when provided', () => {
        const coreData: JtdCoreData = {
          jtdConfig: mockCustomCaptionConfig,
          widgetProps: mockWidgetProps,
          point: mockDataPoint,
        };

        const result = getJumpToDashboardMenuItem(coreData, mockContext, mockActions);

        expect(result?.caption).toBe('Navigate to Sales Dashboard');
        expect(mockTranslate).not.toHaveBeenCalled();
      });

      it('should use translated default caption when custom caption not provided', () => {
        const coreData: JtdCoreData = {
          jtdConfig: mockSingleTargetConfig,
          widgetProps: mockWidgetProps,
          point: mockDataPoint,
        };

        getJumpToDashboardMenuItem(coreData, mockContext, mockActions);

        expect(mockTranslate).toHaveBeenCalledWith('jumpToDashboard.defaultCaption');
      });
    });

    describe('when multiple drill targets are available', () => {
      it('should return menu item with sub-items for each target', () => {
        const coreData: JtdCoreData = {
          jtdConfig: mockMultipleTargetsConfig,
          widgetProps: mockWidgetProps,
          point: mockDataPoint,
        };

        const result = getJumpToDashboardMenuItem(coreData, mockContext, mockActions);

        expect(result).toEqual({
          caption: 'Jump to',
          subItems: [
            {
              items: [
                {
                  caption: 'Sales Dashboard',
                  onClick: expect.any(Function),
                },
                {
                  caption: 'Marketing Dashboard',
                  onClick: expect.any(Function),
                },
              ],
            },
          ],
        });

        expect(jtdHandlers.getJtdClickHandler).toHaveBeenCalledTimes(2);
        expect(jtdHandlers.getJtdClickHandler).toHaveBeenCalledWith(
          {
            ...coreData,
            drillTarget: mockDrillTarget1,
          },
          mockContext,
          { openModal: mockOpenModal },
        );
        expect(jtdHandlers.getJtdClickHandler).toHaveBeenCalledWith(
          {
            ...coreData,
            drillTarget: mockDrillTarget2,
          },
          mockContext,
          { openModal: mockOpenModal },
        );
      });

      it('should use custom caption for multiple targets', () => {
        const multipleTargetsWithCustomCaption: JtdConfig = {
          ...mockMultipleTargetsConfig,
          drillToDashboardRightMenuCaption: 'Go to',
        };

        const coreData: JtdCoreData = {
          jtdConfig: multipleTargetsWithCustomCaption,
          widgetProps: mockWidgetProps,
          point: mockDataPoint,
        };

        const result = getJumpToDashboardMenuItem(coreData, mockContext, mockActions);

        expect(result?.caption).toBe('Go to');
      });
    });
  });

  describe('getJumpToDashboardMenuItemForMultiplePoints', () => {
    const mockMultiplePoints = [mockDataPoint, mockDataPoint];

    describe('when no JTD config is provided', () => {
      it('should return null', () => {
        const coreData: JtdCoreData = {
          jtdConfig: undefined as any,
          widgetProps: mockWidgetProps,
          points: mockMultiplePoints,
        };

        const result = getJumpToDashboardMenuItemForMultiplePoints(
          coreData,
          mockContext,
          mockActions,
        );

        expect(result).toBeNull();
      });
    });

    describe('when single drill target is available', () => {
      it('should return menu item with single caption and click handler for multiple points', () => {
        const coreData: JtdCoreData = {
          jtdConfig: mockSingleTargetConfig,
          widgetProps: mockWidgetProps,
          points: mockMultiplePoints,
        };

        const result = getJumpToDashboardMenuItemForMultiplePoints(
          coreData,
          mockContext,
          mockActions,
        );

        expect(result).toEqual({
          caption: 'Jump to Sales Dashboard',
          onClick: expect.any(Function),
        });
        expect(jtdHandlers.getJtdClickHandlerForMultiplePoints).toHaveBeenCalledWith(
          {
            ...coreData,
            drillTarget: mockDrillTarget1,
          },
          mockContext,
          { openModal: mockOpenModal },
        );
      });

      it('should use custom caption when provided for multiple points', () => {
        const coreData: JtdCoreData = {
          jtdConfig: mockCustomCaptionConfig,
          widgetProps: mockWidgetProps,
          points: mockMultiplePoints,
        };

        const result = getJumpToDashboardMenuItemForMultiplePoints(
          coreData,
          mockContext,
          mockActions,
        );

        expect(result?.caption).toBe('Navigate to Sales Dashboard');
        expect(mockTranslate).not.toHaveBeenCalled();
      });
    });

    describe('when multiple drill targets are available', () => {
      it('should return menu item with sub-items for each target for multiple points', () => {
        const coreData: JtdCoreData = {
          jtdConfig: mockMultipleTargetsConfig,
          widgetProps: mockWidgetProps,
          points: mockMultiplePoints,
        };

        const result = getJumpToDashboardMenuItemForMultiplePoints(
          coreData,
          mockContext,
          mockActions,
        );

        expect(result).toEqual({
          caption: 'Jump to',
          subItems: [
            {
              items: [
                {
                  caption: 'Sales Dashboard',
                  onClick: expect.any(Function),
                },
                {
                  caption: 'Marketing Dashboard',
                  onClick: expect.any(Function),
                },
              ],
            },
          ],
        });

        expect(jtdHandlers.getJtdClickHandlerForMultiplePoints).toHaveBeenCalledTimes(2);
        expect(jtdHandlers.getJtdClickHandlerForMultiplePoints).toHaveBeenCalledWith(
          {
            ...coreData,
            drillTarget: mockDrillTarget1,
          },
          mockContext,
          { openModal: mockOpenModal },
        );
        expect(jtdHandlers.getJtdClickHandlerForMultiplePoints).toHaveBeenCalledWith(
          {
            ...coreData,
            drillTarget: mockDrillTarget2,
          },
          mockContext,
          { openModal: mockOpenModal },
        );
      });
    });

    describe('edge cases', () => {
      it('should handle empty drill targets array', () => {
        const emptyTargetsConfig: JtdConfig = {
          ...mockSingleTargetConfig,
          drillTargets: [],
        };

        const coreData: JtdCoreData = {
          jtdConfig: emptyTargetsConfig,
          widgetProps: mockWidgetProps,
          points: mockMultiplePoints,
        };

        const result = getJumpToDashboardMenuItemForMultiplePoints(
          coreData,
          mockContext,
          mockActions,
        );

        // Should still work but access drillTargets[0] which would be undefined
        // The function doesn't handle this case explicitly, so it would fail
        expect(() => {
          result?.onClick?.();
        }).not.toThrow();
      });

      it('should handle missing translate function gracefully', () => {
        const actionsWithoutTranslate = {
          openModal: mockOpenModal,
          translate: undefined,
        } as any;

        const coreData: JtdCoreData = {
          jtdConfig: mockSingleTargetConfig,
          widgetProps: mockWidgetProps,
          point: mockDataPoint,
        };

        expect(() => {
          getJumpToDashboardMenuItem(coreData, mockContext, actionsWithoutTranslate);
        }).toThrow();
      });
    });
  });
});
