import { describe, it, expect } from 'vitest';
import { UserType } from '@ethings-os/sdk-pivot-client';
import type { JaqlPanel, PivotDataNode, PivotTreeNode } from '@ethings-os/sdk-pivot-client';
import {
  createJtdHyperlinkDataCellFormatter,
  createJtdHyperlinkHeaderCellFormatter,
  getPivotFormatterCellActionability,
  isPivotClickHandlerActionable,
  getPivotTargetActionability,
} from './jtd-formatters';
import { JtdConfig, isJumpTargetWithId, PivotDimId, JtdTarget } from './jtd-types';
import { AnyColumn } from '@/chart-data-options/types';
import { PivotTableDataPoint } from '@/types';

describe('jtd-formatters', () => {
  const customHyperlinkColor = '#FF0000';

  const mockDrillTarget1: JtdTarget & { pivotDimensions?: PivotDimId[] } = {
    id: 'target-dashboard-1',
    caption: 'Sales Dashboard',
    pivotDimensions: ['columns.0', 'rows.0'], // Backward compatibility test data
  };

  const mockDrillTarget2: JtdTarget & { pivotDimensions?: PivotDimId[] } = {
    id: 'target-dashboard-2',
    caption: 'Marketing Dashboard',
    pivotDimensions: ['values.0'], // Backward compatibility test data
  };

  const mockJtdConfig: JtdConfig = {
    enabled: true,
    navigateType: 'rightclick',
    jumpTargets: [mockDrillTarget1, mockDrillTarget2],
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

      const result = formatter(mockPivotDataNode, mockJaqlPanel, mockDataOption, 'columns.0');

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

      const result = formatter(mockPivotDataNode, mockJaqlPanel, undefined as any, 'columns.0');

      expect(result).toBeUndefined();
    });

    it('should return formatting result when drill target has no pivot dimensions (fallback behavior)', () => {
      const configWithNoPivotDims: JtdConfig = {
        ...mockJtdConfig,
        jumpTargets: [
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

      const result = formatter(mockPivotDataNode, mockJaqlPanel, mockDataOption, 'columns.0');

      expect(result).toEqual({
        style: {
          color: customHyperlinkColor,
          cursor: 'pointer',
        },
      });
    });

    it('should handle empty drill targets array', () => {
      const configWithEmptyTargets: JtdConfig = {
        ...mockJtdConfig,
        jumpTargets: [],
      };

      const formatter = createJtdHyperlinkDataCellFormatter(
        customHyperlinkColor,
        configWithEmptyTargets,
      );

      const result = formatter(mockPivotDataNode, mockJaqlPanel, mockDataOption, 'columns.0');

      expect(result).toBeUndefined();
    });

    it('should match against multiple drill targets', () => {
      const formatter = createJtdHyperlinkDataCellFormatter(customHyperlinkColor, mockJtdConfig);

      // Test first drill target
      const result1 = formatter(mockPivotDataNode, mockJaqlPanel, mockDataOption, 'columns.0');
      expect(result1).toBeDefined();

      // Test second drill target
      const result2 = formatter(mockPivotDataNode, mockJaqlPanel, mockDataOption, 'values.0');
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

      const result = formatter(mockPivotTreeNode, mockJaqlPanel, mockDataOption, 'columns.0');

      expect(result).toEqual({
        style: {
          color: customHyperlinkColor,
          cursor: 'pointer',
        },
      });
    });

    it('should return undefined for non-matching drill target', () => {
      const formatter = createJtdHyperlinkHeaderCellFormatter(customHyperlinkColor, mockJtdConfig);

      const result = formatter(mockPivotTreeNode, mockJaqlPanel, mockDataOption, 'columns.99');

      expect(result).toBeUndefined();
    });

    it('should return undefined when no data option provided', () => {
      const formatter = createJtdHyperlinkHeaderCellFormatter(customHyperlinkColor, mockJtdConfig);

      const result = formatter(mockPivotTreeNode, mockJaqlPanel, undefined, 'columns.0');

      expect(result).toBeUndefined();
    });

    it('should return undefined when no jaql panel item provided', () => {
      const formatter = createJtdHyperlinkHeaderCellFormatter(customHyperlinkColor, mockJtdConfig);

      const result = formatter(mockPivotTreeNode, undefined, mockDataOption, 'columns.0');

      expect(result).toBeUndefined();
    });

    it('should return undefined for measures panel', () => {
      const formatter = createJtdHyperlinkHeaderCellFormatter(customHyperlinkColor, mockJtdConfig);

      const result = formatter(
        mockPivotTreeNode,
        mockMeasureJaqlPanel,
        mockDataOption,
        'columns.0',
      );

      expect(result).toBeUndefined();
    });

    it('should return undefined for sub total cells', () => {
      const formatter = createJtdHyperlinkHeaderCellFormatter(customHyperlinkColor, mockJtdConfig);

      const result = formatter(mockSubTotalNode, mockJaqlPanel, mockDataOption, 'columns.0');

      expect(result).toBeUndefined();
    });

    it('should return undefined for grand total cells', () => {
      const formatter = createJtdHyperlinkHeaderCellFormatter(customHyperlinkColor, mockJtdConfig);

      const result = formatter(mockGrandTotalNode, mockJaqlPanel, mockDataOption, 'columns.0');

      expect(result).toBeUndefined();
    });

    it('should return undefined for corner cells', () => {
      const formatter = createJtdHyperlinkHeaderCellFormatter(customHyperlinkColor, mockJtdConfig);

      const result = formatter(mockCornerNode, mockJaqlPanel, mockDataOption, 'columns.0');

      expect(result).toBeUndefined();
    });

    it('should handle empty drill targets array', () => {
      const configWithEmptyTargets: JtdConfig = {
        ...mockJtdConfig,
        jumpTargets: [],
      };

      const formatter = createJtdHyperlinkHeaderCellFormatter(
        customHyperlinkColor,
        configWithEmptyTargets,
      );

      const result = formatter(mockPivotTreeNode, mockJaqlPanel, mockDataOption, 'columns.0');

      expect(result).toBeUndefined();
    });

    it('should match against multiple drill targets', () => {
      const formatter = createJtdHyperlinkHeaderCellFormatter(customHyperlinkColor, mockJtdConfig);

      // Test first drill target
      const result1 = formatter(mockPivotTreeNode, mockJaqlPanel, mockDataOption, 'columns.0');
      expect(result1).toBeDefined();

      // Test second drill target
      const result2 = formatter(mockPivotTreeNode, mockJaqlPanel, mockDataOption, 'values.0');
      expect(result2).toBeDefined();
    });

    it('should return formatting result when drill target has undefined pivot dimensions (fallback behavior)', () => {
      const configWithUndefinedPivotDims: JtdConfig = {
        ...mockJtdConfig,
        jumpTargets: [
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

      const result = formatter(mockPivotTreeNode, mockJaqlPanel, mockDataOption, 'columns.0');

      expect(result).toEqual({
        style: {
          color: customHyperlinkColor,
          cursor: 'pointer',
        },
      });
    });

    it('should return formatting result when drill target has empty pivot dimensions array (fallback behavior)', () => {
      const configWithEmptyPivotDims: JtdConfig = {
        ...mockJtdConfig,
        jumpTargets: [
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

      const result = formatter(mockPivotTreeNode, mockJaqlPanel, mockDataOption, 'columns.0');

      expect(result).toEqual({
        style: {
          color: customHyperlinkColor,
          cursor: 'pointer',
        },
      });
    });
  });

  describe('getPivotFormatterCellActionability and isPivotClickHandlerActionable', () => {
    const mockJtdConfigWithPivotTargets: JtdConfig = {
      enabled: true,
      navigateType: 'click',
      jumpTargets: [
        {
          id: 'target-1',
          caption: 'Target 1',
          pivotDimensions: ['rows.0', 'columns.0'],
        },
        {
          id: 'target-2',
          caption: 'Target 2',
          pivotDimensions: ['values.0'],
        },
      ],
    };

    const mockJtdConfigWithoutPivotTargets: JtdConfig = {
      enabled: true,
      navigateType: 'click',
      jumpTargets: [
        {
          id: 'general-target',
          caption: 'General Target',
        },
      ],
    };

    // Helper function to create mock pivot points
    const createMockPivotPoint = (
      rows: Array<{ id: string; value: any }> = [],
      columns: Array<{ id: string; value: any }> = [],
      values: Array<{ id: string; value: any }> = [],
    ): PivotTableDataPoint =>
      ({
        isDataCell: values.length > 0,
        isCaptionCell: values.length === 0,
        isTotalCell: false,
        entries: { rows, columns, values },
      } as PivotTableDataPoint);

    // Helper function to safely get target id
    const getTargetId = (target: any): string | undefined => {
      return target && isJumpTargetWithId(target) ? target.id : undefined;
    };

    describe('using cellId (formatter path)', () => {
      it('should return actionable for matching dimension ID', () => {
        const result = getPivotFormatterCellActionability(mockJtdConfigWithPivotTargets, 'rows.0');

        expect(result.isActionable).toBe(true);
        expect(getTargetId(result.matchingTarget)).toBe('target-1');
      });

      it('should return not actionable for non-matching dimension ID', () => {
        const result = getPivotFormatterCellActionability(mockJtdConfigWithPivotTargets, 'rows.1');

        expect(result.isActionable).toBe(false);
        expect(result.matchingTarget).toBeUndefined();
      });

      it('should return actionable when no dimension-specific targets exist', () => {
        const result = getPivotFormatterCellActionability(
          mockJtdConfigWithoutPivotTargets,
          'rows.0',
        );

        expect(result.isActionable).toBe(true);
        expect(getTargetId(result.matchingTarget)).toBe('general-target');
      });
    });

    describe('using pivotPoint (click handler path)', () => {
      it('should return actionable for matching values cell', () => {
        const mockPivotPoint = createMockPivotPoint(
          [{ id: 'rows.0', value: 'Category1' }],
          [{ id: 'columns.0', value: 'Year2023' }],
          [{ id: 'values.0', value: 1000 }],
        );

        const result = isPivotClickHandlerActionable(mockJtdConfigWithPivotTargets, mockPivotPoint);
        expect(result.isActionable).toBe(true);
        expect(getTargetId(result.matchingTarget)).toBe('target-2');
      });

      it('should return not actionable for row header (headers not clickable)', () => {
        const mockPivotPoint = createMockPivotPoint([{ id: 'rows.0', value: 'Category1' }]);

        const result = isPivotClickHandlerActionable(mockJtdConfigWithPivotTargets, mockPivotPoint);
        expect(result.isActionable).toBe(false);
        expect(result.matchingTarget).toBeUndefined();
      });

      it('should return not actionable for column header (headers not clickable)', () => {
        const mockPivotPoint = createMockPivotPoint([], [{ id: 'columns.0', value: 'Year2023' }]);

        const result = isPivotClickHandlerActionable(mockJtdConfigWithPivotTargets, mockPivotPoint);
        expect(result.isActionable).toBe(false);
        expect(result.matchingTarget).toBeUndefined();
      });

      it('should return not actionable for non-matching cells', () => {
        const mockPivotPoint = createMockPivotPoint(
          [{ id: 'rows.1', value: 'Category2' }], // rows.1 not in any target
        );

        const result = isPivotClickHandlerActionable(mockJtdConfigWithPivotTargets, mockPivotPoint);
        expect(result.isActionable).toBe(false);
        expect(result.matchingTarget).toBeUndefined();
      });

      it('should handle deepest entry selection correctly (row headers not clickable)', () => {
        const mockPivotPoint = createMockPivotPoint([
          { id: 'rows.0', value: 'Category1' },
          { id: 'rows.1', value: 'SubCategory1' }, // deepest row
        ]);

        // Configure target that matches the deepest row
        const configWithDeepestTarget: JtdConfig = {
          enabled: true,
          navigateType: 'click',
          jumpTargets: [
            {
              id: 'deep-target',
              caption: 'Deep Target',
              pivotDimensions: ['rows.1'], // matches deepest row
            },
          ],
        };

        const result = isPivotClickHandlerActionable(configWithDeepestTarget, mockPivotPoint);
        // Row headers should not be clickable regardless of configuration
        expect(result.isActionable).toBe(false);
        expect(result.matchingTarget).toBeUndefined();
      });
    });

    describe('edge cases', () => {
      it('should handle empty entries', () => {
        const mockPivotPoint = createMockPivotPoint();

        const result = isPivotClickHandlerActionable(mockJtdConfigWithPivotTargets, mockPivotPoint);
        expect(result.isActionable).toBe(false);
      });

      it('should handle missing entries', () => {
        const mockPivotPoint: PivotTableDataPoint = {} as PivotTableDataPoint;

        const result = isPivotClickHandlerActionable(mockJtdConfigWithPivotTargets, mockPivotPoint);
        expect(result.isActionable).toBe(false);
      });

      it('should handle empty cell ID', () => {
        const result = getPivotFormatterCellActionability(mockJtdConfigWithPivotTargets, '');

        expect(result.isActionable).toBe(false);
      });
    });

    describe('formatters vs handlers behavior differences', () => {
      const formatterTestCases = [
        { id: 'rows.0', shouldBeActionable: true, expectedTarget: 'target-1' },
        { id: 'columns.0', shouldBeActionable: true, expectedTarget: 'target-1' },
        { id: 'values.0', shouldBeActionable: true, expectedTarget: 'target-2' },
        { id: 'rows.1', shouldBeActionable: false, expectedTarget: undefined },
        { id: 'columns.1', shouldBeActionable: false, expectedTarget: undefined },
        { id: 'values.1', shouldBeActionable: false, expectedTarget: undefined },
      ];

      formatterTestCases.forEach(({ id, shouldBeActionable, expectedTarget }) => {
        it(`formatter should handle ${id} correctly`, () => {
          const formatterResult = getPivotFormatterCellActionability(
            mockJtdConfigWithPivotTargets,
            id,
          );

          expect(formatterResult.isActionable).toBe(shouldBeActionable);

          // For actionable cases, expect the target to match; for non-actionable cases, expect undefined
          const expectedTargetId = shouldBeActionable ? expectedTarget : undefined;
          expect(getTargetId(formatterResult.matchingTarget)).toBe(expectedTargetId);
        });
      });

      // Click handlers have different behavior - only data cells are actionable
      const handlerTestCases = [
        {
          dimType: 'rows',
          id: 'rows.0',
          shouldBeActionable: false,
          description: 'row header (not clickable)',
        },
        {
          dimType: 'columns',
          id: 'columns.0',
          shouldBeActionable: false,
          description: 'column header (not clickable)',
        },
        {
          dimType: 'values',
          id: 'values.0',
          shouldBeActionable: true,
          expectedTarget: 'target-2',
          description: 'data cell (clickable)',
        },
        {
          dimType: 'values',
          id: 'some-other-value',
          shouldBeActionable: false,
          description: 'non-matching data cell with different ID',
          createAtPosition: 1,
        },
      ];

      handlerTestCases.forEach(
        ({ dimType, id, shouldBeActionable, expectedTarget, description, createAtPosition }) => {
          it(`handler should handle ${description}`, () => {
            // For non-matching test, create entry at position 1 instead of 0
            const position = createAtPosition ?? 0;
            const entries =
              dimType === 'values' && position === 1
                ? [
                    { id: 'values.0', value: 'FirstValue' },
                    { id, value: 'TestValue' },
                  ] // Put target at position 1
                : [{ id, value: 'TestValue' }];

            const mockPivotPoint = createMockPivotPoint(
              dimType === 'rows' ? entries : [],
              dimType === 'columns' ? entries : [],
              dimType === 'values' ? entries : [],
            );

            const handlerResult = isPivotClickHandlerActionable(
              mockJtdConfigWithPivotTargets,
              mockPivotPoint,
            );

            expect(handlerResult.isActionable).toBe(shouldBeActionable);

            // For actionable cases, expect the target to match; for non-actionable cases, expect undefined
            const expectedTargetId = shouldBeActionable ? expectedTarget : undefined;
            expect(getTargetId(handlerResult.matchingTarget)).toBe(expectedTargetId);
          });
        },
      );
    });

    describe('getPivotTargetActionability', () => {
      const mockJtdConfigWithMultipleTargets: JtdConfig = {
        enabled: true,
        navigateType: 'click',
        jumpTargets: [
          {
            id: 'target-1',
            caption: 'Target 1',
            pivotDimensions: ['values.0'],
          },
          {
            id: 'target-2',
            caption: 'Target 2',
            pivotDimensions: ['values.0'], // Same dimension as target-1
          },
          {
            id: 'target-3',
            caption: 'Target 3',
            pivotDimensions: ['rows.0'],
          },
          {
            id: 'target-4',
            caption: 'Target 4',
            // No pivotDimensions - fallback target
          },
        ],
      };

      it('should return multiple targets for matching dimension', () => {
        const mockPivotPoint = createMockPivotPoint([], [], [{ id: 'values.0', value: 1000 }]);

        const result = getPivotTargetActionability(
          mockJtdConfigWithMultipleTargets,
          mockPivotPoint,
        );

        expect(result.isActionable).toBe(true);
        expect(result.matchingTargets).toHaveLength(2);
        expect(result.matchingTargets.map((t) => getTargetId(t))).toEqual(['target-1', 'target-2']);
      });

      it('should return single target for unique dimension', () => {
        const mockPivotPoint = createMockPivotPoint([{ id: 'rows.0', value: 'Category1' }]);

        const result = getPivotTargetActionability(
          mockJtdConfigWithMultipleTargets,
          mockPivotPoint,
        );

        expect(result.isActionable).toBe(false); // Row headers are not clickable
        expect(result.matchingTargets).toHaveLength(0);
      });

      it('should return no targets when no dimension-specific targets exist', () => {
        const mockJtdConfigNoDimensions: JtdConfig = {
          enabled: true,
          navigateType: 'click',
          jumpTargets: [
            {
              id: 'target-1',
              caption: 'Target 1',
            },
            {
              id: 'target-2',
              caption: 'Target 2',
            },
          ],
        };

        const mockPivotPoint = createMockPivotPoint([], [], [{ id: 'values.0', value: 1000 }]);

        const result = getPivotTargetActionability(mockJtdConfigNoDimensions, mockPivotPoint);

        // After removing fallback logic, targets without pivotDimensions are not actionable
        expect(result.isActionable).toBe(false);
        expect(result.matchingTargets).toHaveLength(0);
      });

      it('should return empty array for non-data cells', () => {
        const mockPivotPoint = createMockPivotPoint([{ id: 'rows.0', value: 'Category1' }]);

        const result = getPivotTargetActionability(
          mockJtdConfigWithMultipleTargets,
          mockPivotPoint,
        );

        expect(result.isActionable).toBe(false);
        expect(result.matchingTargets).toHaveLength(0);
      });

      it('should return empty array when disabled', () => {
        const disabledConfig: JtdConfig = {
          ...mockJtdConfigWithMultipleTargets,
          enabled: false,
        };

        const mockPivotPoint = createMockPivotPoint([], [], [{ id: 'values.0', value: 1000 }]);

        const result = getPivotTargetActionability(disabledConfig, mockPivotPoint);

        expect(result.isActionable).toBe(false);
        expect(result.matchingTargets).toHaveLength(0);
      });

      it('should handle direct PivotDimId matching (values.1 at position 0)', () => {
        const mockJtdConfigWithValues1: JtdConfig = {
          enabled: true,
          navigateType: 'click',
          jumpTargets: [
            {
              id: 'drill-value-target',
              caption: 'Drill Value Target',
              pivotDimensions: ['values.1'], // Target is values.1
            },
          ],
        };

        // Create pivot point with values.1 at position 0 in the array
        const mockPivotPoint = createMockPivotPoint(
          [],
          [],
          [{ id: 'values.1', value: 65.9 }], // Entry ID is values.1 but at array position 0
        );

        const result = getPivotTargetActionability(mockJtdConfigWithValues1, mockPivotPoint);

        expect(result.isActionable).toBe(true);
        expect(result.matchingTargets).toHaveLength(1);
        expect(getTargetId(result.matchingTargets[0])).toBe('drill-value-target');
      });

      it('should return no targets when dimension-specific targets dont match', () => {
        const mockJtdConfigMixed: JtdConfig = {
          enabled: true,
          navigateType: 'click',
          jumpTargets: [
            {
              id: 'dimension-specific-target',
              caption: 'Dimension Specific',
              pivotDimensions: ['rows.0'], // Only for rows.0
            },
            {
              id: 'fallback-target-1',
              caption: 'Fallback 1',
              // No pivotDimensions - no longer treated as fallback
            },
            {
              id: 'fallback-target-2',
              caption: 'Fallback 2',
              pivotDimensions: [], // Empty array - no longer treated as fallback
            },
          ],
        };

        // Click on values.0 - doesn't match the rows.0 dimension-specific target
        const mockPivotPoint = createMockPivotPoint([], [], [{ id: 'values.0', value: 100 }]);

        const result = getPivotTargetActionability(mockJtdConfigMixed, mockPivotPoint);

        // After removing fallback logic, no targets should match
        expect(result.isActionable).toBe(false);
        expect(result.matchingTargets).toHaveLength(0);
      });

      it('should return empty array when only dimension-specific targets exist and none match', () => {
        const mockJtdConfigOnlyDimensionSpecific: JtdConfig = {
          enabled: true,
          navigateType: 'click',
          jumpTargets: [
            {
              id: 'rows-target',
              caption: 'Rows Target',
              pivotDimensions: ['rows.0'],
            },
            {
              id: 'columns-target',
              caption: 'Columns Target',
              pivotDimensions: ['columns.0'],
            },
          ],
        };

        // Click on values.0 - doesn't match any dimension-specific targets
        const mockPivotPoint = createMockPivotPoint([], [], [{ id: 'values.0', value: 100 }]);

        const result = getPivotTargetActionability(
          mockJtdConfigOnlyDimensionSpecific,
          mockPivotPoint,
        );

        expect(result.isActionable).toBe(false);
        expect(result.matchingTargets).toHaveLength(0);
      });
    });
  });
});
