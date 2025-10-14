import { describe, expect, test } from 'vitest';

import { StackableChartDesignOptions } from '@/chart-options-processor/translations/design-options';

import { getBarChartSpacingForTotalLabels } from './labels-spacing';

describe('labels-spacing', () => {
  describe('getBarChartSpacingForTotalLabels', () => {
    const createMockDesignOptions = (
      showTotal = true,
      stackType: 'classic' | 'stacked' | 'stack100' = 'stack100',
      totalLabelRotation?: number,
    ): StackableChartDesignOptions => ({
      totalLabels: { enabled: showTotal, rotation: totalLabelRotation },
      stackType,
      // Add other required properties with default values
      legend: {
        enabled: true,
        position: 'bottom',
      },
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

    describe('when showTotal is false', () => {
      test('should return zero spacing regardless of stack type', () => {
        const designOptions = createMockDesignOptions(false);
        const result = getBarChartSpacingForTotalLabels(designOptions);

        expect(result).toEqual({
          rightSpacing: 0,
          topSpacing: 0,
        });
      });
    });

    describe('when stackType is not stack100', () => {
      test('should return zero spacing for classic stack type', () => {
        const designOptions = createMockDesignOptions(true, 'classic');
        const result = getBarChartSpacingForTotalLabels(designOptions);

        expect(result).toEqual({
          rightSpacing: 0,
          topSpacing: 0,
        });
      });

      test('should return zero spacing for stacked type', () => {
        const designOptions = createMockDesignOptions(true, 'stacked');
        const result = getBarChartSpacingForTotalLabels(designOptions);

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
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 40, // Large spacing for horizontal labels (0 degrees)
            topSpacing: 0,
          });
        });

        test('should handle null totalLabelRotation (defaults to 0)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', null as any);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 40, // Large spacing for horizontal labels (0 degrees)
            topSpacing: 0,
          });
        });

        test('should handle 0 degrees rotation (horizontal)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 0);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 40, // Large spacing
            topSpacing: 0,
          });
        });
      });

      describe('horizontal labels (< 20 degrees)', () => {
        test('should return large spacing for 10 degrees', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 10);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 40,
            topSpacing: 0,
          });
        });

        test('should return large spacing for 19 degrees (boundary)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 19);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 40,
            topSpacing: 0,
          });
        });

        test('should return large spacing for negative angles in horizontal range', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', -15);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 40,
            topSpacing: 0,
          });
        });
      });

      describe('diagonal labels (20-69 degrees)', () => {
        test('should return medium spacing for 20 degrees (boundary)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 20);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 25,
            topSpacing: 0,
          });
        });

        test('should return medium spacing for 45 degrees', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 45);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 25,
            topSpacing: 0,
          });
        });

        test('should return medium spacing for 69 degrees (boundary)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 69);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 25,
            topSpacing: 0,
          });
        });
      });

      describe('vertical labels (70-109 degrees)', () => {
        test('should return small spacing for 70 degrees (boundary)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 70);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 15,
            topSpacing: 0,
          });
        });

        test('should return small spacing for 90 degrees', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 90);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 15,
            topSpacing: 0,
          });
        });

        test('should return small spacing for 109 degrees (boundary)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 109);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 15,
            topSpacing: 0,
          });
        });
      });

      describe('inverted diagonal labels (110-159 degrees)', () => {
        test('should return medium spacing for 110 degrees (boundary)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 110);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 25,
            topSpacing: 0,
          });
        });

        test('should return medium spacing for 135 degrees', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 135);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 25,
            topSpacing: 0,
          });
        });

        test('should return medium spacing for 159 degrees (boundary)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 159);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 25,
            topSpacing: 0,
          });
        });
      });

      describe('inverted horizontal labels (160-179 degrees)', () => {
        test('should return large spacing for 160 degrees (boundary)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 160);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 40,
            topSpacing: 0,
          });
        });

        test('should return large spacing for 180 degrees', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 180);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 40,
            topSpacing: 0,
          });
        });
      });

      describe('modulo 180 calculations for angles > 180', () => {
        test('should handle 200 degrees (equivalent to 20 degrees)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 200);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 25, // Same as 20 degrees (diagonal)
            topSpacing: 0,
          });
        });

        test('should handle 270 degrees (equivalent to 90 degrees)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 270);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 15, // Same as 90 degrees (vertical)
            topSpacing: 0,
          });
        });

        test('should handle 360 degrees (equivalent to 0 degrees)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 360);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 40, // Same as 0 degrees (horizontal)
            topSpacing: 0,
          });
        });

        test('should handle 540 degrees (equivalent to 0 degrees)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 540);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 40, // Same as 0 degrees (horizontal)
            topSpacing: 0,
          });
        });
      });

      describe('negative angle handling', () => {
        test('should handle -45 degrees (equivalent to 135 degrees)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', -45);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 25, // Same as 135 degrees (inverted diagonal)
            topSpacing: 0,
          });
        });

        test('should handle -90 degrees (equivalent to 90 degrees)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', -90);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 15, // Same as 90 degrees (vertical)
            topSpacing: 0,
          });
        });

        test('should handle -180 degrees (equivalent to 0 degrees)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', -180);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 40, // Same as 0 degrees (horizontal)
            topSpacing: 0,
          });
        });

        test('should handle -200 degrees (equivalent to 20 degrees)', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', -200);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 25, // Same as 20 degrees (diagonal)
            topSpacing: 0,
          });
        });
      });

      describe('edge cases and extreme values', () => {
        test('should handle very large positive angles', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 7200); // 40 full rotations
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 40, // Equivalent to 0 degrees
            topSpacing: 0,
          });
        });

        test('should handle very large negative angles', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', -7200); // -40 full rotations
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 40, // Equivalent to 0 degrees
            topSpacing: 0,
          });
        });

        test('should handle decimal angles', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 19.9);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 40, // Still in horizontal range
            topSpacing: 0,
          });
        });

        test('should handle decimal angles crossing boundary', () => {
          const designOptions = createMockDesignOptions(true, 'stack100', 20.1);
          const result = getBarChartSpacingForTotalLabels(designOptions);

          expect(result).toEqual({
            rightSpacing: 25, // Now in diagonal range
            topSpacing: 0,
          });
        });
      });

      describe('topSpacing consistency', () => {
        test('should always return topSpacing as 0 for bar charts', () => {
          const testCases = [0, 45, 90, 135, 180, 225, 270, 315, 360, -45, -90];

          testCases.forEach((angle) => {
            const designOptions = createMockDesignOptions(true, 'stack100', angle);
            const result = getBarChartSpacingForTotalLabels(designOptions);

            expect(result.topSpacing).toBe(0);
          });
        });
      });
    });

    describe('type safety and parameter validation', () => {
      test('should handle missing optional properties gracefully', () => {
        const minimalDesignOptions = {
          totalLabels: { enabled: true },
          stackType: 'stack100' as const,
          // totalLabelRotation is optional
        } as StackableChartDesignOptions;

        const result = getBarChartSpacingForTotalLabels(minimalDesignOptions);

        expect(result).toEqual({
          rightSpacing: 40, // Default to 0 rotation behavior
          topSpacing: 0,
        });
      });
    });
  });
});
