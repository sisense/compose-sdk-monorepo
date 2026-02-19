import { TFunction } from '@sisense/sdk-common';
import flow from 'lodash-es/flow';
import { describe, expect, test, vi } from 'vitest';

import { CartesianChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types.js';
import {
  withXAxisLabelPositioning,
  withYAxisLabelPositioning,
} from '@/domains/visualizations/core/chart-options-processor/cartesian/utils/chart-configuration.js';
import { AxisSettings } from '@/domains/visualizations/core/chart-options-processor/translations/axis-section.js';
import { StackableChartDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/design-options.js';
import { CompleteThemeSettings } from '@/types';

import { BuildContext } from '../../../../types.js';
// Import the mocked functions
import { getCartesianXAxis } from '../../../helpers/highchart-options/axis.js';
import { getBasicYAxisSettings } from '../../../helpers/highchart-options/y-axis.js';
import { withStacking } from '../../helpers/highchart-options/stacking.js';
import { getAxes } from './axes.js';
import { getAreaChartSpacingForTotalLabels } from './labels-spacing.js';

// Mock the dependencies
vi.mock('../../../helpers/highchart-options/axis', () => ({
  getCartesianXAxis: vi.fn(),
}));

vi.mock('../../../helpers/highchart-options/y-axis', () => ({
  getBasicYAxisSettings: vi.fn(),
}));

vi.mock(
  '@/domains/visualizations/core/chart-options-processor/cartesian/utils/chart-configuration',
  () => ({
    withXAxisLabelPositioning: vi.fn(),
    withYAxisLabelPositioning: vi.fn(),
  }),
);

vi.mock('../../helpers/highchart-options/stacking', () => ({
  withStacking: vi.fn(),
}));

vi.mock('./labels-spacing', () => ({
  getAreaChartSpacingForTotalLabels: vi.fn(),
}));

vi.mock('lodash-es/flow', () => ({
  default: vi.fn(),
}));

describe('axes', () => {
  describe('getAxes', () => {
    const createMockBuildContext = (
      stackType: 'classic' | 'stacked' | 'stack100' = 'stacked',
      showTotal = false,
      totalLabelRotation = 0,
      themeSettings?: Partial<CompleteThemeSettings>,
    ): BuildContext<'area'> => ({
      chartData: {
        type: 'cartesian',
        series: [],
        xAxisCount: 1,
        xValues: [],
      } as any,
      dataOptions: {
        x: [{ column: { name: 'Category', type: 'string' }, sortType: 'sortNone' }],
        y: [
          {
            column: { name: 'Revenue', aggregation: 'sum' },
            showOnRightAxis: false,
            numberFormatConfig: { decimalScale: 2, symbol: '$', prefix: true },
          },
          {
            column: { name: 'Profit', aggregation: 'sum' },
            showOnRightAxis: true,
            numberFormatConfig: { decimalScale: 1, symbol: '€', prefix: false },
          },
        ],
        breakBy: [],
      } as CartesianChartDataOptionsInternal,
      designOptions: {
        stackType,
        totalLabels: { enabled: showTotal, rotation: totalLabelRotation },
        legend: {
          enabled: true,
          position: 'bottom',
        },
        seriesLabels: {},
        lineType: 'straight',
        lineWidth: 2,
        marker: { enabled: false, size: 'small', fill: 'full' },
        autoZoom: { enabled: false },
        xAxis: {
          type: 'linear',
          enabled: true,
          titleEnabled: true,
          title: 'X Axis',
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
          title: 'Y Axis',
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
      } as StackableChartDesignOptions,
      extraConfig: {
        translate: vi.fn((key: string) => key) as unknown as TFunction,
        themeSettings: {
          typography: {
            primaryTextColor: '#000000',
            ...themeSettings?.typography,
          },
          ...themeSettings,
        } as CompleteThemeSettings,
        dateFormatter: vi.fn(() => 'formatted-date'),
        accessibilityEnabled: false,
      },
    });

    const createMockAxisSettings = (): AxisSettings[] => [
      {
        type: 'linear',
        title: {
          text: 'Primary Y Axis',
          enabled: true,
        },
        labels: {
          enabled: true,
          style: { fontSize: '12px' },
        },
        stackLabels: {
          enabled: false,
          style: { fontSize: '10px' },
          crop: false,
          allowOverlap: true,
          rotation: 0,
          labelrank: 1,
        },
        gridLineWidth: 1,
        min: null,
        max: null,
      },
      {
        type: 'linear',
        title: {
          text: 'Secondary Y Axis',
          enabled: true,
        },
        labels: {
          enabled: true,
          style: { fontSize: '12px' },
        },
        stackLabels: {
          enabled: false,
          style: { fontSize: '10px' },
          crop: false,
          allowOverlap: true,
          rotation: 0,
          labelrank: 1,
        },
        gridLineWidth: 1,
        min: null,
        max: null,
        opposite: true,
      },
    ];

    beforeEach(() => {
      vi.clearAllMocks();

      // Setup default mock behaviors
      (getCartesianXAxis as any).mockReturnValue([
        {
          type: 'category',
          categories: ['A', 'B', 'C'],
          title: { text: 'X Axis' },
          labels: { enabled: true },
        },
      ]);

      (getBasicYAxisSettings as any).mockReturnValue(createMockAxisSettings());

      (getAreaChartSpacingForTotalLabels as any).mockReturnValue({
        rightSpacing: 0,
        topSpacing: 20,
      });

      // Mock the higher-order functions to return identity functions
      (withXAxisLabelPositioning as any).mockImplementation(() => (axes: AxisSettings[]) => axes);
      (withYAxisLabelPositioning as any).mockImplementation(() => (axes: AxisSettings[]) => axes);
      (withStacking as any).mockImplementation(() => (axes: AxisSettings[]) => axes);

      // Mock flow to apply functions in sequence
      (flow as any).mockImplementation(
        (...fns: Array<(input: any) => any>) =>
          (input: any) =>
            fns.reduce((acc, fn) => fn(acc), input),
      );
    });

    describe('basic functionality', () => {
      test('should return xAxis and yAxis settings', () => {
        const ctx = createMockBuildContext();
        const result = getAxes(ctx);

        expect(result).toHaveProperty('xAxis');
        expect(result).toHaveProperty('yAxis');
        expect(Array.isArray(result.xAxis)).toBe(true);
        expect(Array.isArray(result.yAxis)).toBe(true);
      });

      test('should call getCartesianXAxis with correct parameters', () => {
        const ctx = createMockBuildContext();
        getAxes(ctx);

        expect(getCartesianXAxis).toHaveBeenCalledWith(ctx, 'horizontal');
      });

      test('should call getBasicYAxisSettings with correct parameters', () => {
        const ctx = createMockBuildContext();
        getAxes(ctx);

        expect(getBasicYAxisSettings).toHaveBeenCalledWith(ctx, 'area');
      });
    });

    describe('X-axis label positioning', () => {
      test('should call getAreaChartSpacingForTotalLabels with design options', () => {
        const ctx = createMockBuildContext('stack100', true, 45);
        getAxes(ctx);

        expect(getAreaChartSpacingForTotalLabels).toHaveBeenCalledWith(ctx.designOptions);
      });

      test('should call withXAxisLabelPositioning with correct spacing values', () => {
        const mockSpacing = { rightSpacing: 10, topSpacing: 25 };
        (getAreaChartSpacingForTotalLabels as any).mockReturnValue(mockSpacing);

        const ctx = createMockBuildContext();
        getAxes(ctx);

        expect(withXAxisLabelPositioning).toHaveBeenCalledWith({
          totalLabelRightSpacing: 10,
          totalLabelTopSpacing: 25,
        });
      });

      test('should handle zero spacing values', () => {
        const mockSpacing = { rightSpacing: 0, topSpacing: 0 };
        (getAreaChartSpacingForTotalLabels as any).mockReturnValue(mockSpacing);

        const ctx = createMockBuildContext();
        getAxes(ctx);

        expect(withXAxisLabelPositioning).toHaveBeenCalledWith({
          totalLabelRightSpacing: 0,
          totalLabelTopSpacing: 0,
        });
      });
    });

    describe('Y-axis label positioning', () => {
      test('should call withYAxisLabelPositioning with correct shifts', () => {
        const ctx = createMockBuildContext('stack100', true, 0);

        // Mock the spacing calculation to return specific values
        (getAreaChartSpacingForTotalLabels as any).mockReturnValue({
          rightSpacing: 0,
          topSpacing: 30,
        });

        getAxes(ctx);

        expect(withYAxisLabelPositioning).toHaveBeenCalledWith({
          rightShift: 0, // Area charts don't use rightShift for Y-axis positioning
          topShift: -15, // -1 * (topSpacing / 2) = -1 * (30 / 2) = -15
        });
      });

      test('should calculate topShift correctly for different topSpacing values', () => {
        const testCases = [
          { topSpacing: 10, expectedTopShift: -5 },
          { topSpacing: 30, expectedTopShift: -15 },
          { topSpacing: 40, expectedTopShift: -20 },
          { topSpacing: 0, expectedTopShift: 0 },
        ];

        testCases.forEach(({ topSpacing, expectedTopShift }) => {
          vi.clearAllMocks();

          const ctx = createMockBuildContext('stack100', true, 0);
          (getAreaChartSpacingForTotalLabels as any).mockReturnValue({
            rightSpacing: 0,
            topSpacing,
          });

          getAxes(ctx);

          const callArgs = (withYAxisLabelPositioning as any).mock.calls[0][0];
          expect(callArgs.rightShift).toBe(0);
          // Use Object.is to handle -0 vs 0 distinction, but normalize -0 to 0
          const actualTopShift = callArgs.topShift === 0 ? 0 : callArgs.topShift;
          expect(actualTopShift).toBe(expectedTopShift);
        });
      });

      test('should return zero topShift when showTotal is false', () => {
        const ctx = createMockBuildContext('stacked', false, 0);
        getAxes(ctx);

        expect(withYAxisLabelPositioning).toHaveBeenCalledWith({
          rightShift: 0,
          topShift: 0,
        });
      });

      test('should return zero topShift when stackType is not stack100', () => {
        const ctx = createMockBuildContext('stacked', true, 0);
        getAxes(ctx);

        expect(withYAxisLabelPositioning).toHaveBeenCalledWith({
          rightShift: 0,
          topShift: 0,
        });
      });
    });

    describe('stacking integration', () => {
      test('should call withStacking with build context', () => {
        const ctx = createMockBuildContext('stacked', true, 45);
        getAxes(ctx);

        expect(withStacking).toHaveBeenCalledWith(ctx);
      });

      test('should apply transformations in correct order using flow', () => {
        const ctx = createMockBuildContext('stack100', true, 30);
        getAxes(ctx);

        // Verify flow was called with the correct transformation functions
        expect(flow).toHaveBeenCalledWith(
          expect.any(Function), // withStacking result
          expect.any(Function), // withYAxisLabelPositioning result
        );
      });
    });

    describe('calculateTopShift function behavior', () => {
      test('should return 0 when showTotal is false', () => {
        const ctx = createMockBuildContext('stack100', false, 0);
        getAxes(ctx);

        expect(withYAxisLabelPositioning).toHaveBeenCalledWith({
          rightShift: 0,
          topShift: 0,
        });
      });

      test('should return 0 when stackType is not stack100', () => {
        const stackTypes: Array<'classic' | 'stacked'> = ['classic', 'stacked'];

        stackTypes.forEach((stackType) => {
          vi.clearAllMocks();

          const ctx = createMockBuildContext(stackType, true, 0);
          getAxes(ctx);

          expect(withYAxisLabelPositioning).toHaveBeenCalledWith({
            rightShift: 0,
            topShift: 0,
          });
        });
      });

      test('should calculate correct topShift when both conditions are met', () => {
        const ctx = createMockBuildContext('stack100', true, 45);

        // Mock spacing to return specific topSpacing
        (getAreaChartSpacingForTotalLabels as any).mockReturnValue({
          rightSpacing: 0,
          topSpacing: 20,
        });

        getAxes(ctx);

        expect(withYAxisLabelPositioning).toHaveBeenCalledWith({
          rightShift: 0,
          topShift: -10, // -1 * (20 / 2)
        });
      });
    });

    describe('functional programming patterns', () => {
      test('should use pure functions without side effects', () => {
        const ctx = createMockBuildContext();
        const originalDataOptions = JSON.parse(JSON.stringify(ctx.dataOptions));
        const originalDesignOptions = JSON.parse(JSON.stringify(ctx.designOptions));
        const originalChartData = JSON.parse(JSON.stringify(ctx.chartData));

        getAxes(ctx);

        // Test that main data structures weren't mutated (excluding function properties)
        expect(ctx.dataOptions).toEqual(originalDataOptions);
        expect(ctx.designOptions).toEqual(originalDesignOptions);
        expect(ctx.chartData).toEqual(originalChartData);
      });

      test('should compose functions using flow', () => {
        const ctx = createMockBuildContext('stacked', true, 0);
        getAxes(ctx);

        // Verify that flow is used to compose the Y-axis transformations
        expect(flow).toHaveBeenCalled();

        // The flow should be called with withStacking and withYAxisLabelPositioning functions
        const flowCall = (flow as any).mock.calls[0];
        expect(flowCall).toHaveLength(2);
      });

      test('should return consistent results for same input', () => {
        const ctx = createMockBuildContext('stack100', true, 90);

        const result1 = getAxes(ctx);
        const result2 = getAxes(ctx);

        expect(result1).toEqual(result2);
      });
    });

    describe('area chart specificity', () => {
      test('should use horizontal orientation for X-axis (area chart specific)', () => {
        const ctx = createMockBuildContext();
        getAxes(ctx);

        // Area charts use horizontal X axis like line charts (comment in code)
        expect(getCartesianXAxis).toHaveBeenCalledWith(ctx, 'horizontal');
      });

      test('should pass "area" as chart type to getBasicYAxisSettings', () => {
        const ctx = createMockBuildContext();
        getAxes(ctx);

        expect(getBasicYAxisSettings).toHaveBeenCalledWith(ctx, 'area');
      });

      test('should always use rightShift of 0 for Y-axis positioning (area specific)', () => {
        const testCases = [
          { stackType: 'classic' as const, showTotal: false },
          { stackType: 'stacked' as const, showTotal: true },
          { stackType: 'stack100' as const, showTotal: true },
        ];

        testCases.forEach(({ stackType, showTotal }) => {
          vi.clearAllMocks();

          const ctx = createMockBuildContext(stackType, showTotal, 0);
          getAxes(ctx);

          expect(withYAxisLabelPositioning).toHaveBeenCalledWith(
            expect.objectContaining({ rightShift: 0 }),
          );
        });
      });
    });

    describe('edge cases', () => {
      test('should handle undefined totalLabelRotation', () => {
        const ctx = createMockBuildContext('stack100', true, undefined as any);

        expect(() => getAxes(ctx)).not.toThrow();
      });

      test('should handle null values in design options', () => {
        const ctx = createMockBuildContext();
        ctx.designOptions.totalLabels = null as any;

        expect(() => getAxes(ctx)).not.toThrow();
      });

      test('should handle missing spacing calculation gracefully', () => {
        (getAreaChartSpacingForTotalLabels as any).mockReturnValue({
          rightSpacing: undefined,
          topSpacing: undefined,
        });

        const ctx = createMockBuildContext();

        expect(() => getAxes(ctx)).not.toThrow();
      });
    });

    describe('dependency integration', () => {
      test('should properly integrate with all imported dependencies', () => {
        const ctx = createMockBuildContext('stack100', true, 45);

        // Mock all dependencies to return distinct values to verify they're all called
        const mockXAxis = [{ type: 'category', title: { text: 'Mock X' } }];
        const mockYAxis = [{ type: 'linear', title: { text: 'Mock Y' } }];

        (getCartesianXAxis as any).mockReturnValue(mockXAxis);
        (getBasicYAxisSettings as any).mockReturnValue(mockYAxis);

        const result = getAxes(ctx);

        // Verify all major dependencies were called
        expect(getCartesianXAxis).toHaveBeenCalled();
        expect(getBasicYAxisSettings).toHaveBeenCalled();
        expect(getAreaChartSpacingForTotalLabels).toHaveBeenCalled();
        expect(withXAxisLabelPositioning).toHaveBeenCalled();
        expect(withYAxisLabelPositioning).toHaveBeenCalled();
        expect(withStacking).toHaveBeenCalled();
        expect(flow).toHaveBeenCalled();

        // Verify the result structure
        expect(result.xAxis).toBeDefined();
        expect(result.yAxis).toBeDefined();
      });
    });
  });
});
