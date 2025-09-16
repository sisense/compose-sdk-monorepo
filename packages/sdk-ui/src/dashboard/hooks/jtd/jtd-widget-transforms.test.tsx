import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  addPointerCursorToChart,
  applyClickNavigationForChart,
  applyClickNavigationForPivot,
  applyClickNavigationForText,
  applyRightClickNavigation,
  applyRightClickNavigationForPivot,
  applyPivotLinkStyling,
  addJtdIconToHeader,
} from './jtd-widget-transforms';
import { WidgetProps } from '@/props.js';
import { JtdWidgetTransformConfig } from './jtd-types';
import { PivotTableDataPoint } from '@/types';
import { JtdNavigateType } from '@/widget-by-id/types';
import { SizeMeasurement } from '@/types';

// Mock dependencies
vi.mock('@/widget-by-id/utils', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    isChartWidgetProps: vi.fn(),
    isPivotTableWidgetProps: vi.fn(),
    isTextWidgetProps: vi.fn(),
    registerDataPointContextMenuHandler: vi.fn((widgetProps, handler) => {
      // Mock implementation that adds the handler to widget props
      widgetProps.onDataPointContextMenu = handler;
      return widgetProps;
    }),
  };
});

// Mock functions are now all properly imported from widgetUtils

vi.mock('./jtd-handlers', () => ({
  handleDataPointClick: vi.fn(),
  handlePivotDataPointClick: vi.fn(),
  handleTextWidgetClick: vi.fn(),
}));

vi.mock('./jtd-menu', () => ({
  getJumpToDashboardMenuItem: vi.fn(),
  getJumpToDashboardMenuItemForMultiplePoints: vi.fn(),
}));

vi.mock('./jtd-formatters', () => ({
  createJtdHyperlinkDataCellFormatter: vi.fn(() => vi.fn()),
  createJtdHyperlinkHeaderCellFormatter: vi.fn(() => vi.fn()),
}));

// Import mocked functions
import * as widgetUtils from '@/widget-by-id/utils';
import * as jtdHandlers from './jtd-handlers';
import * as jtdMenu from './jtd-menu';
import * as jtdFormatters from './jtd-formatters';

describe('jtd-widget-transforms', () => {
  const mockChartWidgetProps: WidgetProps = {
    id: 'widget-1',
    widgetType: 'chart',
    chartType: 'column',
    dataOptions: {
      category: [{ name: 'Category', type: 'text-attribute' } as any],
      value: [{ name: 'Revenue', aggregation: 'sum' } as any],
    },
  } as any;

  const mockPivotWidgetProps: WidgetProps = {
    id: 'pivot-widget-1',
    widgetType: 'pivot',
    dataOptions: {
      rows: [{ name: 'Category', type: 'text-attribute' } as any],
      columns: [{ name: 'Quarter', type: 'datetime' } as any],
      values: [{ name: 'Revenue', aggregation: 'sum' } as any],
    },
  } as any;

  const mockTextWidgetProps: WidgetProps = {
    id: 'text-widget-1',
    widgetType: 'text',
    styleOptions: {
      htmlContent: '<p>Sample text</p>',
    },
  } as any;

  const mockConfig: JtdWidgetTransformConfig = {
    jtdConfig: {
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
    },
    dashboardFilters: [],
    originalWidgetFilters: [],
  };

  const mockContext = {
    dashboardFilters: [],
    originalWidgetFilters: [],
  };

  const mockActions = {
    openModal: vi.fn(),
    openMenu: vi.fn(),
    translate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    vi.mocked(widgetUtils.isChartWidgetProps).mockReturnValue(false);
    vi.mocked(widgetUtils.isPivotTableWidgetProps).mockReturnValue(false);
    vi.mocked(widgetUtils.isTextWidgetProps).mockReturnValue(false);
    vi.mocked(jtdHandlers.handleDataPointClick).mockReturnValue(Promise.resolve(''));
    vi.mocked(jtdHandlers.handlePivotDataPointClick).mockReturnValue(Promise.resolve(''));
    vi.mocked(jtdHandlers.handleTextWidgetClick).mockReturnValue(Promise.resolve(''));
    vi.mocked(jtdMenu.getJumpToDashboardMenuItem).mockReturnValue(null);
    vi.mocked(jtdMenu.getJumpToDashboardMenuItemForMultiplePoints).mockReturnValue(null);
    vi.mocked(jtdFormatters.createJtdHyperlinkDataCellFormatter).mockReturnValue(vi.fn());
    vi.mocked(jtdFormatters.createJtdHyperlinkHeaderCellFormatter).mockReturnValue(vi.fn());
  });

  describe('addPointerCursorToChart', () => {
    it('should return unchanged props for non-chart widgets', () => {
      vi.mocked(widgetUtils.isChartWidgetProps).mockReturnValue(false);

      const result = addPointerCursorToChart(mockTextWidgetProps);

      expect(result).toBe(mockTextWidgetProps);
    });

    it('should add cursor pointer for supported chart types', () => {
      vi.mocked(widgetUtils.isChartWidgetProps).mockReturnValue(true);

      const result = addPointerCursorToChart(mockChartWidgetProps);

      expect(result).not.toBe(mockChartWidgetProps);
      expect((result as any).plotOptions?.series?.cursor).toBe('pointer');
    });

    it('should return unchanged props for unsupported chart types', () => {
      vi.mocked(widgetUtils.isChartWidgetProps).mockReturnValue(true);
      const unsupportedChart = { ...mockChartWidgetProps, chartType: 'unsupported' as any };

      const result = addPointerCursorToChart(unsupportedChart);

      expect(result).toBe(unsupportedChart);
    });

    it('should preserve existing plotOptions when adding cursor', () => {
      vi.mocked(widgetUtils.isChartWidgetProps).mockReturnValue(true);
      const existingPlotOptions = {
        plotOptions: {
          series: { pointWidth: 20 },
          column: { borderWidth: 1 },
        },
      };
      const chartWithPlotOptions = { ...mockChartWidgetProps, ...existingPlotOptions };

      const result = addPointerCursorToChart(chartWithPlotOptions);

      expect((result as any).plotOptions?.series?.cursor).toBe('pointer');
      expect((result as any).plotOptions?.series?.pointWidth).toBe(20);
      expect((result as any).plotOptions?.column?.borderWidth).toBe(1);
    });

    it('should support all defined chart types', () => {
      const supportedTypes = [
        'line',
        'area',
        'column',
        'bar',
        'pie',
        'funnel',
        'scatter',
        'bubble',
      ];

      supportedTypes.forEach((chartType) => {
        vi.mocked(widgetUtils.isChartWidgetProps).mockReturnValue(true);
        const chartProps = { ...mockChartWidgetProps, chartType: chartType as any };

        const result = addPointerCursorToChart(chartProps);

        expect((result as any).plotOptions?.series?.cursor).toBe('pointer');
      });
    });
  });

  describe('applyClickNavigationForChart', () => {
    it('should return unchanged props for non-chart widgets', () => {
      vi.mocked(widgetUtils.isChartWidgetProps).mockReturnValue(false);

      const result = applyClickNavigationForChart(mockTextWidgetProps, mockConfig, mockActions);

      expect(result).toBe(mockTextWidgetProps);
    });

    it('should add click navigation for chart widgets', () => {
      vi.mocked(widgetUtils.isChartWidgetProps).mockReturnValue(true);

      const result = applyClickNavigationForChart(mockChartWidgetProps, mockConfig, mockActions);

      expect(result).not.toBe(mockChartWidgetProps);
      expect((result as any).onDataPointClick).toBeDefined();

      // Verify the handler is called when onDataPointClick is triggered
      const mockPoint = { value: 100, categoryValue: 'Test', seriesValue: 'Series' };
      const mockEvent = { type: 'click', bubbles: true, cancelable: true } as any;
      (result as any).onDataPointClick(mockPoint, mockEvent);

      expect(jtdHandlers.handleDataPointClick).toHaveBeenCalled();
    });

    it('should preserve existing onDataPointClick when adding JTD navigation', () => {
      vi.mocked(widgetUtils.isChartWidgetProps).mockReturnValue(true);
      const existingClickHandler = vi.fn();
      const chartWithClick = { ...mockChartWidgetProps, onDataPointClick: existingClickHandler };

      const result = applyClickNavigationForChart(chartWithClick, mockConfig, mockActions);

      expect((result as any).onDataPointClick).toBeDefined();
      expect((result as any).onDataPointClick).not.toBe(existingClickHandler);
    });
  });

  describe('applyClickNavigationForPivot', () => {
    it('should return unchanged props for non-pivot widgets', () => {
      vi.mocked(widgetUtils.isPivotTableWidgetProps).mockReturnValue(false);

      const result = applyClickNavigationForPivot(mockChartWidgetProps, mockConfig, mockActions);

      expect(result).toBe(mockChartWidgetProps);
    });

    it('should add click navigation for pivot widgets', () => {
      vi.mocked(widgetUtils.isPivotTableWidgetProps).mockReturnValue(true);

      const result = applyClickNavigationForPivot(mockPivotWidgetProps, mockConfig, mockActions);

      expect(result).not.toBe(mockPivotWidgetProps);
      expect((result as any).onDataPointClick).toBeDefined();
    });

    it('should handle pivot data point click correctly', () => {
      vi.mocked(widgetUtils.isPivotTableWidgetProps).mockReturnValue(true);

      const result = applyClickNavigationForPivot(mockPivotWidgetProps, mockConfig, mockActions);

      const mockPivotPoint: PivotTableDataPoint = {
        isDataCell: true,
        isCaptionCell: false,
        isTotalCell: false,
        entries: {
          rows: [{ id: 'row1', dataOption: { name: 'Category' } as any, value: 'Electronics' }],
          columns: [{ id: 'col1', dataOption: { name: 'Quarter' } as any, value: 'Q1' }],
          values: [{ id: 'val1', dataOption: { name: 'Revenue' } as any, value: 100 }],
        },
      };

      (result as any).onDataPointClick?.(mockPivotPoint, {} as any);

      expect(jtdHandlers.handlePivotDataPointClick).toHaveBeenCalledWith(
        expect.any(Object),
        mockContext,
        mockActions,
      );
    });
  });

  describe('applyClickNavigationForText', () => {
    it('should return unchanged props for non-text widgets', () => {
      vi.mocked(widgetUtils.isTextWidgetProps).mockReturnValue(false);

      const result = applyClickNavigationForText(mockChartWidgetProps, mockConfig, mockActions);

      expect(result).toBe(mockChartWidgetProps);
    });

    it('should add click navigation for text widgets', () => {
      vi.mocked(widgetUtils.isTextWidgetProps).mockReturnValue(true);

      const result = applyClickNavigationForText(mockTextWidgetProps, mockConfig, mockActions);

      expect(result).not.toBe(mockTextWidgetProps);
      expect((result as any).onDataPointClick).toBeDefined();

      // Trigger the click handler to verify it was called
      (result as any).onDataPointClick();

      expect(jtdHandlers.handleTextWidgetClick).toHaveBeenCalled();
    });
  });

  describe('applyRightClickNavigation', () => {
    it('should return unchanged props for non-chart widgets', () => {
      vi.mocked(widgetUtils.isChartWidgetProps).mockReturnValue(false);

      const result = applyRightClickNavigation(mockTextWidgetProps, mockConfig, mockActions);

      expect(result).toBe(mockTextWidgetProps);
    });

    it('should add right-click navigation for chart widgets', () => {
      vi.mocked(widgetUtils.isChartWidgetProps).mockReturnValue(true);

      const result = applyRightClickNavigation(mockChartWidgetProps, mockConfig, mockActions);

      expect(result).not.toBe(mockChartWidgetProps);
      expect((result as any).onDataPointContextMenu).toBeDefined();
    });

    it('should preserve existing onDataPointContextMenu when adding JTD navigation', () => {
      vi.mocked(widgetUtils.isChartWidgetProps).mockReturnValue(true);
      const existingContextMenuHandler = vi.fn();
      const chartWithContextMenu = {
        ...mockChartWidgetProps,
        onDataPointContextMenu: existingContextMenuHandler,
      };

      const result = applyRightClickNavigation(chartWithContextMenu, mockConfig, mockActions);

      expect((result as any).onDataPointContextMenu).toBeDefined();
      expect((result as any).onDataPointContextMenu).not.toBe(existingContextMenuHandler);
    });
  });

  describe('applyRightClickNavigationForPivot', () => {
    it('should return unchanged props for non-pivot widgets', () => {
      vi.mocked(widgetUtils.isPivotTableWidgetProps).mockReturnValue(false);

      const result = applyRightClickNavigationForPivot(
        mockChartWidgetProps,
        mockConfig,
        mockActions,
      );

      expect(result).toBe(mockChartWidgetProps);
    });

    it('should add right-click navigation for pivot widgets', () => {
      vi.mocked(widgetUtils.isPivotTableWidgetProps).mockReturnValue(true);

      const result = applyRightClickNavigationForPivot(
        mockPivotWidgetProps,
        mockConfig,
        mockActions,
      );

      expect(result).not.toBe(mockPivotWidgetProps);
      expect((result as any).onDataPointContextMenu).toBeDefined();
    });
  });

  describe('applyPivotLinkStyling', () => {
    it('should return unchanged props for non-pivot widgets', () => {
      vi.mocked(widgetUtils.isPivotTableWidgetProps).mockReturnValue(false);

      const result = applyPivotLinkStyling(mockChartWidgetProps, mockConfig);

      expect(result).toBe(mockChartWidgetProps);
    });

    it('should add link styling for pivot widgets', () => {
      vi.mocked(widgetUtils.isPivotTableWidgetProps).mockReturnValue(true);

      const result = applyPivotLinkStyling(mockPivotWidgetProps, mockConfig);

      expect(result).not.toBe(mockPivotWidgetProps);
      expect(jtdFormatters.createJtdHyperlinkDataCellFormatter).toHaveBeenCalled();
      expect(jtdFormatters.createJtdHyperlinkHeaderCellFormatter).toHaveBeenCalled();
    });

    it('should preserve existing formatters when adding JTD formatters', () => {
      vi.mocked(widgetUtils.isPivotTableWidgetProps).mockReturnValue(true);
      const existingDataFormatter = vi.fn();
      const existingHeaderFormatter = vi.fn();
      const pivotWithFormatters = {
        ...mockPivotWidgetProps,
        onDataCellFormat: existingDataFormatter,
        onHeaderCellFormat: existingHeaderFormatter,
      };

      const result = applyPivotLinkStyling(pivotWithFormatters, mockConfig);

      expect((result as any).onDataCellFormat).toBeDefined();
      expect((result as any).onHeaderCellFormat).toBeDefined();
      expect((result as any).onDataCellFormat).not.toBe(existingDataFormatter);
      expect((result as any).onHeaderCellFormat).not.toBe(existingHeaderFormatter);
    });
  });

  describe('addJtdIconToHeader', () => {
    it('should add JTD icon to widget with title', () => {
      vi.mocked(widgetUtils.isChartWidgetProps).mockReturnValue(true);
      const widgetWithTitle = { ...mockChartWidgetProps, title: 'My Chart' };

      const result = addJtdIconToHeader(widgetWithTitle);

      expect(result).not.toBe(widgetWithTitle);
      expect((result as any).styleOptions?.header?.renderTitle).toBeDefined();
      expect(typeof (result as any).styleOptions?.header?.renderTitle).toBe('function');
    });

    it('should return unchanged props for non-chart widgets', () => {
      vi.mocked(widgetUtils.isChartWidgetProps).mockReturnValue(false);

      const result = addJtdIconToHeader(mockChartWidgetProps);

      expect(result).toBe(mockChartWidgetProps);
    });

    it('should add header renderTitle function for chart widgets', () => {
      vi.mocked(widgetUtils.isChartWidgetProps).mockReturnValue(true);
      const widgetWithTitle = { ...mockChartWidgetProps, title: 'Original Title' };

      const result = addJtdIconToHeader(widgetWithTitle);

      expect(result).not.toBe(widgetWithTitle);
      expect((result as any).title).toBe('Original Title'); // Title should be preserved
      expect((result as any).styleOptions?.header?.renderTitle).toBeDefined();
    });

    it('should handle empty string title', () => {
      const widgetWithEmptyTitle = { ...mockChartWidgetProps, title: '' };

      const result = addJtdIconToHeader(widgetWithEmptyTitle);

      expect(result).toBe(widgetWithEmptyTitle);
    });
  });
});
