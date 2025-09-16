import { describe, test, expect } from 'vitest';
import { getAreaChartSpacingForTotalLabels } from './labels-spacing';
import { StackableChartDesignOptions } from '@/chart-options-processor/translations/design-options';

describe('labels-spacing', () => {
  describe('getAreaChartSpacingForTotalLabels', () => {
    const createMockDesignOptions = (
      showTotal = true,
      stackType: 'classic' | 'stacked' | 'stack100' = 'stack100',
      totalLabelRotation?: number,
    ): StackableChartDesignOptions => ({
      showTotal,
      stackType,
      totalLabelRotation,
      // Add other required properties with default values
      legend: {
        enabled: true,
        position: 'bottom',
      },
      valueLabel: {},
      lineType: 'straight',
      lineWidth: 2,
      marker: { enabled: false, size: 'small', fill: 'full' },
      autoZoom: {
        enabled: false,
      },
      xAxis: {
        type: 'linear',
        enabled: true,
        titleEnabled: true,
        title: 'X Axis title',
        gridLine: true,
        labels: true,
        min: null,
        max: null,
        tickInterval: null,
      },
      yAxis: {
        type: 'linear',
        enabled: true,
        titleEnabled: true,
        title: 'Y Axis title',
        gridLine: true,
        labels: true,
        min: null,
        max: null,
        tickInterval: null,
      },
      dataLimits: {
        seriesCapacity: 50,
        categoriesCapacity: 50000,
      },
      designPerSeries: {},
    });

    describe('rightSpacing behavior', () => {
      test('should always return rightSpacing as 0 for area charts', () => {
        const testCases = [
          { showTotal: true, stackType: 'stack100' as const, rotation: 0 },
          { showTotal: true, stackType: 'stack100' as const, rotation: 45 },
          { showTotal: true, stackType: 'stack100' as const, rotation: 90 },
          { showTotal: true, stackType: 'stacked' as const, rotation: 0 },
          { showTotal: false, stackType: 'classic' as const, rotation: undefined },
        ];

        testCases.forEach(({ showTotal, stackType, rotation }) => {
          const designOptions = createMockDesignOptions(showTotal, stackType, rotation);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result.rightSpacing).toBe(0);
        });
      });
    });

    describe('when showTotal is false', () => {
      test('should return zero spacing regardless of stack type', () => {
        const designOptions = createMockDesignOptions(false);
        const result = getAreaChartSpacingForTotalLabels(designOptions);

        expect(result).toEqual({
          rightSpacing: 0,
          topSpacing: 0,
        });
      });
    });

    describe('when stackType is not stack100', () => {
      test('should return zero spacing for classic stack type', () => {
        const designOptions = createMockDesignOptions(true, 'classic');
        const result = getAreaChartSpacingForTotalLabels(designOptions);

        expect(result).toEqual({
          rightSpacing: 0,
          topSpacing: 0,
        });
      });

      test('should return zero spacing for stacked type', () => {
        const designOptions = createMockDesignOptions(true, 'stacked');
        const result = getAreaChartSpacingForTotalLabels(designOptions);

        expect(result).toEqual({
          rightSpacing: 0,
          topSpacing: 0,
        });
      });
    });

    describe('when showTotal is true and stackType is stack100', () => {
      describe('rotation angle calculations', () => {
        test('should handle undefined totalLabelRotation (defaults to 0)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', undefined);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 10, // Small topSpacing for horizontal labels (0 degrees)
          });
        });

        test('should handle null totalLabelRotation (defaults to 0)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', null as any);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 10, // Small topSpacing for horizontal labels (0 degrees)
          });
        });

        test('should handle 0 degrees rotation (horizontal)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 0);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 10, // Small topSpacing
          });
        });
      });

      describe('horizontal labels (< 20 degrees)', () => {
        test('should return small topSpacing for 10 degrees', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 10);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 10,
          });
        });

        test('should return small topSpacing for 19 degrees (boundary)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 19);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 10,
          });
        });

        test('should return small topSpacing for negative angles in horizontal range', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', -15);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 10,
          });
        });
      });

      describe('diagonal labels (20-69 degrees)', () => {
        test('should return medium topSpacing for 20 degrees (boundary)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 20);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 30,
          });
        });

        test('should return medium topSpacing for 45 degrees', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 45);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 30,
          });
        });

        test('should return medium topSpacing for 69 degrees (boundary)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 69);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 30,
          });
        });
      });

      describe('vertical labels (70-109 degrees)', () => {
        test('should return large topSpacing for 70 degrees (boundary)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 70);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 40,
          });
        });

        test('should return large topSpacing for 90 degrees', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 90);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 40,
          });
        });

        test('should return large topSpacing for 109 degrees (boundary)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 109);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 40,
          });
        });
      });

      describe('inverted diagonal labels (110-159 degrees)', () => {
        test('should return medium topSpacing for 110 degrees (boundary)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 110);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 30,
          });
        });

        test('should return medium topSpacing for 135 degrees', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 135);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 30,
          });
        });

        test('should return medium topSpacing for 159 degrees (boundary)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 159);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 30,
          });
        });
      });

      describe('inverted horizontal labels (160-179 degrees)', () => {
        test('should return small topSpacing for 160 degrees (boundary)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 160);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 10,
          });
        });

        test('should return small topSpacing for 180 degrees', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 180);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 10,
          });
        });
      });

      describe('modulo 180 calculations for angles > 180', () => {
        test('should handle 200 degrees (equivalent to 20 degrees)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 200);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 30, // Same as 20 degrees (diagonal)
          });
        });

        test('should handle 270 degrees (equivalent to 90 degrees)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 270);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 40, // Same as 90 degrees (vertical)
          });
        });

        test('should handle 360 degrees (equivalent to 0 degrees)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 360);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 10, // Same as 0 degrees (horizontal)
          });
        });

        test('should handle 540 degrees (equivalent to 0 degrees)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 540);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 10, // Same as 0 degrees (horizontal)
          });
        });
      });

      describe('negative angle handling', () => {
        test('should handle -45 degrees (equivalent to 135 degrees)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', -45);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 30, // Same as 135 degrees (inverted diagonal)
          });
        });

        test('should handle -90 degrees (equivalent to 90 degrees)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', -90);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 40, // Same as 90 degrees (vertical)
          });
        });

        test('should handle -180 degrees (equivalent to 0 degrees)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', -180);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 10, // Same as 0 degrees (horizontal)
          });
        });

        test('should handle -200 degrees (equivalent to 20 degrees)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', -200);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 30, // Same as 20 degrees (diagonal)
          });
        });
      });

      describe('edge cases and extreme values', () => {
        test('should handle very large positive angles', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 7200); // 40 full rotations
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 10, // Equivalent to 0 degrees
          });
        });

        test('should handle very large negative angles', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', -7200); // -40 full rotations
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 10, // Equivalent to 0 degrees
          });
        });

        test('should handle decimal angles', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 19.9);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 10, // Still in horizontal range
          });
        });

        test('should handle decimal angles crossing boundary', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 20.1);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 0,
            topSpacing: 30, // Now in diagonal range
          });
        });
      });
    });

    describe('type safety and parameter validation', () => {
      test('should handle missing optional properties gracefully', () => {
        const minimalDesignOptions = {
          showTotal: true,
          stackType: 'stack100' as const,
          // totalLabelRotation is optional
        } as StackableChartDesignOptions;

        const result = getAreaChartSpacingForTotalLabels(minimalDesignOptions);

        expect(result).toEqual({
          rightSpacing: 0,
          topSpacing: 10, // Default to 0 rotation behavior
        });
      });
    });

    describe('area chart specificity', () => {
      test('should return area-specific spacing values according to enum', () => {
        // Test that the function returns values matching the AreaTotalLabelVerticalSpacing enum
        const horizontalDesignOptions = createMockDesignOptions(true, 'stack100', 0);
        const diagonalDesignOptions = createMockDesignOptions(true, 'stack100', 45);
        const verticalDesignOptions = createMockDesignOptions(true, 'stack100', 90);

        const horizontalResult = getAreaChartSpacingForTotalLabels(horizontalDesignOptions);
        const diagonalResult = getAreaChartSpacingForTotalLabels(diagonalDesignOptions);
        const verticalResult = getAreaChartSpacingForTotalLabels(verticalDesignOptions);

        // Verify specific area chart spacing values
        expect(horizontalResult.topSpacing).toBe(10); // AreaTotalLabelVerticalSpacing.Small
        expect(diagonalResult.topSpacing).toBe(30); // AreaTotalLabelVerticalSpacing.Medium
        expect(verticalResult.topSpacing).toBe(40); // AreaTotalLabelVerticalSpacing.Large
      });

      test('should consistently return rightSpacing as 0 (area chart specific)', () => {
        // Test comment in code: "Area charts don't use right spacing for total labels"
        const testRotations = [0, 30, 60, 90, 120, 150, 180];

        testRotations.forEach((rotation) => {
          const designOptions = createMockDesignOptions(true, 'stack100', rotation);
          const result = getAreaChartSpacingForTotalLabels(designOptions);

          expect(result.rightSpacing).toBe(0);
        });
      });
    });

    describe('rotation threshold constants verification', () => {
      test('should respect LABEL_ROTATION_THRESHOLD.HORIZONTAL (20 degrees)', () => {
        const justBelow = createMockDesignOptions(true, 'stack100', 19);
        const atThreshold = createMockDesignOptions(true, 'stack100', 20);

        const belowResult = getAreaChartSpacingForTotalLabels(justBelow);
        const thresholdResult = getAreaChartSpacingForTotalLabels(atThreshold);

        expect(belowResult.topSpacing).toBe(10); // Small (horizontal)
        expect(thresholdResult.topSpacing).toBe(30); // Medium (diagonal)
      });

      test('should respect LABEL_ROTATION_THRESHOLD.DIAGONAL (70 degrees)', () => {
        const justBelow = createMockDesignOptions(true, 'stack100', 69);
        const atThreshold = createMockDesignOptions(true, 'stack100', 70);

        const belowResult = getAreaChartSpacingForTotalLabels(justBelow);
        const thresholdResult = getAreaChartSpacingForTotalLabels(atThreshold);

        expect(belowResult.topSpacing).toBe(30); // Medium (diagonal)
        expect(thresholdResult.topSpacing).toBe(40); // Large (vertical)
      });

      test('should respect LABEL_ROTATION_THRESHOLD.VERTICAL (110 degrees)', () => {
        const justBelow = createMockDesignOptions(true, 'stack100', 109);
        const atThreshold = createMockDesignOptions(true, 'stack100', 110);

        const belowResult = getAreaChartSpacingForTotalLabels(justBelow);
        const thresholdResult = getAreaChartSpacingForTotalLabels(atThreshold);

        expect(belowResult.topSpacing).toBe(40); // Large (vertical)
        expect(thresholdResult.topSpacing).toBe(30); // Medium (inverted diagonal)
      });

      test('should respect LABEL_ROTATION_THRESHOLD.INVERTED_DIAGONAL (160 degrees)', () => {
        const justBelow = createMockDesignOptions(true, 'stack100', 159);
        const atThreshold = createMockDesignOptions(true, 'stack100', 160);

        const belowResult = getAreaChartSpacingForTotalLabels(justBelow);
        const thresholdResult = getAreaChartSpacingForTotalLabels(atThreshold);

        expect(belowResult.topSpacing).toBe(30); // Medium (inverted diagonal)
        expect(thresholdResult.topSpacing).toBe(10); // Small (inverted horizontal)
      });
    });

    describe('functional programming compliance', () => {
      test('should be pure function - not mutate input', () => {
        const designOptions = createMockDesignOptions(true, 'stack100', 45);
        const originalOptions = JSON.parse(JSON.stringify(designOptions));

        getAreaChartSpacingForTotalLabels(designOptions);

        expect(designOptions).toEqual(originalOptions);
      });

      test('should return consistent results for same input', () => {
        const designOptions = createMockDesignOptions(true, 'stack100', 75);

        const result1 = getAreaChartSpacingForTotalLabels(designOptions);
        const result2 = getAreaChartSpacingForTotalLabels(designOptions);

        expect(result1).toEqual(result2);
      });
    });
  });
});
