import { describe, it, expect } from 'vitest';
import { UserType } from '@sisense/sdk-pivot-client';
import type { JaqlPanel, PivotDataNode, PivotTreeNode } from '@sisense/sdk-pivot-client';
import {
  createJtdHyperlinkDataCellFormatter,
  createJtdHyperlinkHeaderCellFormatter,
} from './jtd-formatters';
import { JtdConfig, JtdNavigateType, JtdPivotDrillTarget } from '@/widget-by-id/types';
import { AnyColumn } from '@/chart-data-options/types';
import { SizeMeasurement } from '@/types';

describe('jtd-formatters', () => {
  const customHyperlinkColor = '#FF0000';

  const mockDrillTarget1: JtdPivotDrillTarget = {
    id: 'target-dashboard-1',
    caption: 'Sales Dashboard',
    pivotDimensions: ['category-id', 'region-id'],
  };

  const mockDrillTarget2: JtdPivotDrillTarget = {
    id: 'target-dashboard-2',
    caption: 'Marketing Dashboard',
    pivotDimensions: ['product-id'],
  };

  const mockJtdConfig: JtdConfig = {
    enabled: true,
    navigateType: JtdNavigateType.RIGHT_CLICK,
    drillTargets: [mockDrillTarget1, mockDrillTarget2],
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

  const mockDataOption: AnyColumn = {
    name: 'Category',
    type: 'text-attribute',
  };

  const mockJaqlPanel: JaqlPanel = {
    panel: 'rows',
    field: {
      index: 0,
    },
    jaql: {
      dim: '[Category]',
    } as any,
  };

  const mockMeasureJaqlPanel: JaqlPanel = {
    panel: 'measures',
    field: {
      index: 0,
    },
    jaql: {
      agg: 'sum',
    } as any,
  };

  const mockPivotDataNode: PivotDataNode = {
    value: 'Electronics',
    content: 'Electronics',
  } as PivotDataNode;

  const mockPivotTreeNode: PivotTreeNode = {
    content: 'Electronics',
  } as PivotTreeNode;

  const mockSubTotalNode: PivotTreeNode = {
    content: 'Sub Total',
    userType: UserType.SUB_TOTAL,
  } as PivotTreeNode;

  const mockGrandTotalNode: PivotTreeNode = {
    content: 'Grand Total',
    userType: UserType.GRAND_TOTAL,
  } as PivotTreeNode;

  const mockCornerNode: PivotTreeNode = {
    content: '',
    userType: UserType.CORNER,
  } as PivotTreeNode;

  describe('createJtdHyperlinkDataCellFormatter', () => {
    it('should create a data cell formatter with custom hyperlink color', () => {
      const formatter = createJtdHyperlinkDataCellFormatter(customHyperlinkColor, mockJtdConfig);

      expect(typeof formatter).toBe('function');
    });

    it('should return formatting result for matching drill target', () => {
      const formatter = createJtdHyperlinkDataCellFormatter(customHyperlinkColor, mockJtdConfig);

      const result = formatter(mockPivotDataNode, mockJaqlPanel, mockDataOption, 'category-id');

      expect(result).toEqual({
        style: {
          color: customHyperlinkColor,
          cursor: 'pointer',
        },
      });
    });

    it('should return undefined for non-matching drill target', () => {
      const formatter = createJtdHyperlinkDataCellFormatter(customHyperlinkColor, mockJtdConfig);

      const result = formatter(mockPivotDataNode, mockJaqlPanel, mockDataOption, 'non-matching-id');

      expect(result).toBeUndefined();
    });

    it('should return undefined when no data option provided', () => {
      const formatter = createJtdHyperlinkDataCellFormatter(customHyperlinkColor, mockJtdConfig);

      const result = formatter(mockPivotDataNode, mockJaqlPanel, undefined as any, 'category-id');

      expect(result).toBeUndefined();
    });

    it('should return undefined when drill target has no pivot dimensions', () => {
      const configWithNoPivotDims: JtdConfig = {
        ...mockJtdConfig,
        drillTargets: [
          {
            id: 'target-dashboard-1',
            caption: 'Sales Dashboard',
          },
        ],
      };

      const formatter = createJtdHyperlinkDataCellFormatter(
        customHyperlinkColor,
        configWithNoPivotDims,
      );

      const result = formatter(mockPivotDataNode, mockJaqlPanel, mockDataOption, 'category-id');

      expect(result).toBeUndefined();
    });

    it('should handle empty drill targets array', () => {
      const configWithEmptyTargets: JtdConfig = {
        ...mockJtdConfig,
        drillTargets: [],
      };

      const formatter = createJtdHyperlinkDataCellFormatter(
        customHyperlinkColor,
        configWithEmptyTargets,
      );

      const result = formatter(mockPivotDataNode, mockJaqlPanel, mockDataOption, 'category-id');

      expect(result).toBeUndefined();
    });

    it('should match against multiple drill targets', () => {
      const formatter = createJtdHyperlinkDataCellFormatter(customHyperlinkColor, mockJtdConfig);

      // Test first drill target
      const result1 = formatter(mockPivotDataNode, mockJaqlPanel, mockDataOption, 'category-id');
      expect(result1).toBeDefined();

      // Test second drill target
      const result2 = formatter(mockPivotDataNode, mockJaqlPanel, mockDataOption, 'product-id');
      expect(result2).toBeDefined();
    });
  });

  describe('createJtdHyperlinkHeaderCellFormatter', () => {
    it('should create a header cell formatter with custom hyperlink color', () => {
      const formatter = createJtdHyperlinkHeaderCellFormatter(customHyperlinkColor, mockJtdConfig);

      expect(typeof formatter).toBe('function');
    });

    it('should return formatting result for matching drill target', () => {
      const formatter = createJtdHyperlinkHeaderCellFormatter(customHyperlinkColor, mockJtdConfig);

      const result = formatter(mockPivotTreeNode, mockJaqlPanel, mockDataOption, 'category-id');

      expect(result).toEqual({
        style: {
          color: customHyperlinkColor,
          cursor: 'pointer',
        },
      });
    });

    it('should return undefined for non-matching drill target', () => {
      const formatter = createJtdHyperlinkHeaderCellFormatter(customHyperlinkColor, mockJtdConfig);

      const result = formatter(mockPivotTreeNode, mockJaqlPanel, mockDataOption, 'non-matching-id');

      expect(result).toBeUndefined();
    });

    it('should return undefined when no data option provided', () => {
      const formatter = createJtdHyperlinkHeaderCellFormatter(customHyperlinkColor, mockJtdConfig);

      const result = formatter(mockPivotTreeNode, mockJaqlPanel, undefined, 'category-id');

      expect(result).toBeUndefined();
    });

    it('should return undefined when no jaql panel item provided', () => {
      const formatter = createJtdHyperlinkHeaderCellFormatter(customHyperlinkColor, mockJtdConfig);

      const result = formatter(mockPivotTreeNode, undefined, mockDataOption, 'category-id');

      expect(result).toBeUndefined();
    });

    it('should return undefined for measures panel', () => {
      const formatter = createJtdHyperlinkHeaderCellFormatter(customHyperlinkColor, mockJtdConfig);

      const result = formatter(
        mockPivotTreeNode,
        mockMeasureJaqlPanel,
        mockDataOption,
        'category-id',
      );

      expect(result).toBeUndefined();
    });

    it('should return undefined for sub total cells', () => {
      const formatter = createJtdHyperlinkHeaderCellFormatter(customHyperlinkColor, mockJtdConfig);

      const result = formatter(mockSubTotalNode, mockJaqlPanel, mockDataOption, 'category-id');

      expect(result).toBeUndefined();
    });

    it('should return undefined for grand total cells', () => {
      const formatter = createJtdHyperlinkHeaderCellFormatter(customHyperlinkColor, mockJtdConfig);

      const result = formatter(mockGrandTotalNode, mockJaqlPanel, mockDataOption, 'category-id');

      expect(result).toBeUndefined();
    });

    it('should return undefined for corner cells', () => {
      const formatter = createJtdHyperlinkHeaderCellFormatter(customHyperlinkColor, mockJtdConfig);

      const result = formatter(mockCornerNode, mockJaqlPanel, mockDataOption, 'category-id');

      expect(result).toBeUndefined();
    });

    it('should handle empty drill targets array', () => {
      const configWithEmptyTargets: JtdConfig = {
        ...mockJtdConfig,
        drillTargets: [],
      };

      const formatter = createJtdHyperlinkHeaderCellFormatter(
        customHyperlinkColor,
        configWithEmptyTargets,
      );

      const result = formatter(mockPivotTreeNode, mockJaqlPanel, mockDataOption, 'category-id');

      expect(result).toBeUndefined();
    });

    it('should match against multiple drill targets', () => {
      const formatter = createJtdHyperlinkHeaderCellFormatter(customHyperlinkColor, mockJtdConfig);

      // Test first drill target
      const result1 = formatter(mockPivotTreeNode, mockJaqlPanel, mockDataOption, 'category-id');
      expect(result1).toBeDefined();

      // Test second drill target
      const result2 = formatter(mockPivotTreeNode, mockJaqlPanel, mockDataOption, 'product-id');
      expect(result2).toBeDefined();
    });

    it('should handle drill target with undefined pivot dimensions', () => {
      const configWithUndefinedPivotDims: JtdConfig = {
        ...mockJtdConfig,
        drillTargets: [
          {
            id: 'target-dashboard-1',
            caption: 'Sales Dashboard',
          },
        ],
      };

      const formatter = createJtdHyperlinkHeaderCellFormatter(
        customHyperlinkColor,
        configWithUndefinedPivotDims,
      );

      const result = formatter(mockPivotTreeNode, mockJaqlPanel, mockDataOption, 'category-id');

      expect(result).toBeUndefined();
    });

    it('should handle drill target with empty pivot dimensions array', () => {
      const configWithEmptyPivotDims: JtdConfig = {
        ...mockJtdConfig,
        drillTargets: [
          {
            id: 'target-dashboard-1',
            caption: 'Sales Dashboard',
          },
        ],
      };

      const formatter = createJtdHyperlinkHeaderCellFormatter(
        customHyperlinkColor,
        configWithEmptyPivotDims,
      );

      const result = formatter(mockPivotTreeNode, mockJaqlPanel, mockDataOption, 'category-id');

      expect(result).toBeUndefined();
    });
  });
});
