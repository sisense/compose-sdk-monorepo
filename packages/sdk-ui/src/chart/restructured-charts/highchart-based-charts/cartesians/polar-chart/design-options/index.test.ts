import {
  translateStyleOptionsToDesignOptions,
  isCorrectStyleOptions,
  designOptionsTranslators,
} from './index';
import { getCartesianChartStyle } from '@/chart-options-processor/style-to-design-options-translator/translate-to-highcharts-options';
import {
  extendStyleOptionsWithDefaults,
  getDesignOptionsPerSeries,
} from '@/chart-options-processor/style-to-design-options-translator/prepare-design-options';
import { getDefaultStyleOptions } from '@/chart-options-processor/chart-options-service';
import { withYAxisNormalizationForPolar } from '@/chart-options-processor/cartesian/utils/axis/axis-builders';
import { PolarStyleOptions, ChartStyleOptions } from '@/types';
import { CartesianChartDataOptionsInternal } from '@/chart-data-options/types';

// Mock dependencies
vi.mock(
  '@/chart-options-processor/style-to-design-options-translator/translate-to-highcharts-options',
  () => ({
    getCartesianChartStyle: vi.fn(),
  }),
);

vi.mock(
  '@/chart-options-processor/style-to-design-options-translator/prepare-design-options',
  () => ({
    extendStyleOptionsWithDefaults: vi.fn(),
    getDesignOptionsPerSeries: vi.fn(),
  }),
);

vi.mock('@/chart-options-processor/chart-options-service', () => ({
  getDefaultStyleOptions: vi.fn(),
}));

vi.mock('@/chart-options-processor/subtype-to-design-options', () => ({
  chartSubtypeToDesignOptions: {
    'polar/column': { polarType: 'column' },
    'polar/area': { polarType: 'area' },
    'polar/line': { polarType: 'line' },
  },
}));

vi.mock('@/chart-options-processor/cartesian/utils/axis/axis-builders', () => ({
  withYAxisNormalizationForPolar: vi.fn(),
}));

const mockedGetCartesianChartStyle = vi.mocked(getCartesianChartStyle);
const mockedExtendStyleOptionsWithDefaults = vi.mocked(extendStyleOptionsWithDefaults);
const mockedGetDesignOptionsPerSeries = vi.mocked(getDesignOptionsPerSeries);
const mockedGetDefaultStyleOptions = vi.mocked(getDefaultStyleOptions);
const mockedWithYAxisNormalizationForPolar = vi.mocked(withYAxisNormalizationForPolar);

describe('polar-chart design-options', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    mockedGetCartesianChartStyle.mockReturnValue({
      lineType: 'straight',
      legend: 'bottom',
      lineWidth: 2,
      valueLabel: {},
      marker: { enabled: false, size: 'small', fill: 'full' },
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
      autoZoom: { enabled: true },
      dataLimits: { seriesCapacity: 50, categoriesCapacity: 100000 },
    });

    mockedExtendStyleOptionsWithDefaults.mockReturnValue({
      subtype: 'polar/column',
    } as any);

    mockedGetDesignOptionsPerSeries.mockReturnValue({});

    mockedGetDefaultStyleOptions.mockReturnValue({});

    mockedWithYAxisNormalizationForPolar.mockImplementation((options) => ({
      ...options,
      yAxis: {
        ...options.yAxis,
        titleEnabled: false,
        title: null,
      },
    }));
  });

  describe('translateStyleOptionsToDesignOptions', () => {
    const mockDataOptions: CartesianChartDataOptionsInternal = {
      x: [{ column: { name: 'x', type: 'text' } }],
      y: [{ column: { name: 'y', type: 'number' } }],
      breakBy: [],
    };

    it('should translate polar style options to design options', () => {
      const styleOptions: PolarStyleOptions = {
        subtype: 'polar/area',
      };

      const result = translateStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

      expect(mockedGetCartesianChartStyle).toHaveBeenCalledWith(styleOptions, false);
      expect(mockedExtendStyleOptionsWithDefaults).toHaveBeenCalledWith(styleOptions, {});
      expect(mockedGetDesignOptionsPerSeries).toHaveBeenCalledWith(mockDataOptions, 'polar', {
        subtype: 'polar/column',
      });
      expect(mockedWithYAxisNormalizationForPolar).toHaveBeenCalled();
      expect(result.polarType).toBe('area');
      expect(result.yAxis.titleEnabled).toBe(false);
      expect(result.yAxis.title).toBeNull();
    });

    it('should use default polar type when subtype is not provided', () => {
      const styleOptions: PolarStyleOptions = {};

      const result = translateStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

      expect(result.polarType).toBe('column');
    });

    it('should use default polar type when subtype is not in chartSubtypeToDesignOptions', () => {
      const styleOptions: PolarStyleOptions = {
        subtype: 'polar/unknown' as any,
      };

      const result = translateStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

      expect(result.polarType).toBe('column');
    });

    it('should handle different polar subtypes correctly', () => {
      const testCases = [
        { subtype: 'polar/column', expectedType: 'column' },
        { subtype: 'polar/area', expectedType: 'area' },
        { subtype: 'polar/line', expectedType: 'line' },
      ] as const;

      testCases.forEach(({ subtype, expectedType }) => {
        const styleOptions: PolarStyleOptions = { subtype };
        const result = translateStyleOptionsToDesignOptions(styleOptions, mockDataOptions);
        expect(result.polarType).toBe(expectedType);
      });
    });

    it('should apply Y-axis normalization', () => {
      const styleOptions: PolarStyleOptions = {
        subtype: 'polar/column',
      };

      translateStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

      expect(mockedWithYAxisNormalizationForPolar).toHaveBeenCalledWith(
        expect.objectContaining({
          polarType: 'column',
          designPerSeries: {},
        }),
      );
    });
  });

  describe('isCorrectStyleOptions', () => {
    it('should return true for valid polar style options', () => {
      const validOptions = [
        { subtype: 'polar/column' },
        { subtype: 'polar/area' },
        { subtype: 'polar/line' },
        { subtype: 'polar/custom' },
        {}, // no subtype is valid
        { subtype: undefined }, // undefined subtype is valid
        { subtype: null }, // null subtype is valid
      ];

      validOptions.forEach((options) => {
        expect(isCorrectStyleOptions(options as ChartStyleOptions)).toBe(true);
      });
    });

    it('should return false for non-polar style options', () => {
      const invalidOptions = [
        { subtype: 'line/basic' },
        { subtype: 'column/stacked' },
        { subtype: 'bar/grouped' },
        { subtype: 'area/spline' },
        { subtype: 'pie/classic' },
      ];

      invalidOptions.forEach((options) => {
        expect(isCorrectStyleOptions(options as ChartStyleOptions)).toBe(false);
      });
    });

    it('should return false for null or non-object inputs', () => {
      const invalidInputs = [null, undefined, 'string', 123, () => {}];

      invalidInputs.forEach((input) => {
        expect(isCorrectStyleOptions(input as any)).toBe(false);
      });
    });

    it('should return true for arrays (they are objects)', () => {
      // Arrays are objects and pass the typeof check, which is expected behavior
      expect(isCorrectStyleOptions([] as any)).toBe(true);
    });

    it('should handle edge cases', () => {
      expect(isCorrectStyleOptions({ subtype: '' } as any)).toBe(true); // empty string is valid
      expect(isCorrectStyleOptions({ other: 'property' } as any)).toBe(true); // no subtype property is valid
    });
  });

  describe('designOptionsTranslators', () => {
    it('should export the correct translator functions', () => {
      expect(designOptionsTranslators).toEqual({
        translateStyleOptionsToDesignOptions,
        isCorrectStyleOptions,
      });
    });

    it('should have the correct function references', () => {
      expect(designOptionsTranslators.translateStyleOptionsToDesignOptions).toBe(
        translateStyleOptionsToDesignOptions,
      );
      expect(designOptionsTranslators.isCorrectStyleOptions).toBe(isCorrectStyleOptions);
    });
  });
});
