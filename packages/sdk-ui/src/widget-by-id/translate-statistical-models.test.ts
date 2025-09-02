import { StyledMeasureColumn } from '../chart-data-options/types.js';
import { applyStatisticalModels, createStatisticalModels } from './translate-statistical-models';
import { StatisticalModels } from './types.js';

describe('createStatisticalModels', () => {
  const mockMeasureColumn = {
    column: {
      name: 'Revenue',
      type: 'measure',
    },
  };

  it('should create trend model correctly', () => {
    const column: StyledMeasureColumn = {
      ...mockMeasureColumn,
      trend: {
        modelType: 'linear',
        ignoreAnomalies: true,
      },
    } as StyledMeasureColumn;

    const result = createStatisticalModels(column);
    const expectedTrend = {
      isEnabled: true,
      isViewerDisabled: false,
      trendType: 'linear',
      ignoreAnomalies: true,
      trendOnForecast: false,
      compare: {
        isEnabled: false,
        period: 'year',
      },
      isAccessible: true,
    };

    expect(result?.trend).toEqual(expectedTrend);
  });

  it('should create forecast model correctly with defaults', () => {
    const column: StyledMeasureColumn = {
      ...mockMeasureColumn,
      forecast: {
        modelType: 'auto', // This is the model type, will be converted to 'en' in DTO
        confidenceInterval: 0.8,
        forecastHorizon: 3,
      },
    } as StyledMeasureColumn;

    const result = createStatisticalModels(column);
    const expectedForecast = {
      isEnabled: true,
      isViewerDisabled: false,
      explainVariable: null,
      evaluation: {
        type: 'all',
        numLastPointsForEvaluation: 0,
        ignoreLast: 0,
      },
      forecastPeriod: 3,
      confidence: 80,
      modelType: 'en', // 'en' is the DTO representation of 'auto'
      boundaries: {
        upper: {
          isEnabled: false,
          value: null,
        },
        lower: {
          isEnabled: false,
          value: null,
        },
        isInt: {
          isEnabled: false,
        },
      },
      isAccessible: true,
    };

    expect(result?.forecast).toEqual(expectedForecast);
  });

  it('should create forecast model with boundaries and roundToInt', () => {
    const column: StyledMeasureColumn = {
      ...mockMeasureColumn,
      forecast: {
        modelType: 'auto', // This is the model type, will be converted to 'en' in DTO
        confidenceInterval: 0.8,
        forecastHorizon: 3,
        upperBound: 1000,
        lowerBound: 0,
        roundToInt: true,
      },
    } as StyledMeasureColumn;

    const result = createStatisticalModels(column);
    expect(result?.forecast?.boundaries).toEqual({
      upper: {
        isEnabled: true,
        value: null,
      },
      lower: {
        isEnabled: true,
        value: null,
      },
      isInt: {
        isEnabled: true,
      },
    });
  });

  it('should create both trend and forecast models when both present', () => {
    const column: StyledMeasureColumn = {
      ...mockMeasureColumn,
      trend: {
        modelType: 'linear',
      },
      forecast: {
        modelType: 'auto', // This is the model type, will be converted to 'en' in DTO
        confidenceInterval: 0.8,
        forecastHorizon: 3,
      },
    } as StyledMeasureColumn;

    const result = createStatisticalModels(column);
    const expectedModels = {
      trend: {
        isEnabled: true,
        isViewerDisabled: false,
        trendType: 'linear',
        ignoreAnomalies: false,
        trendOnForecast: false,
        compare: {
          isEnabled: false,
          period: 'year',
        },
        isAccessible: true,
      },
      forecast: {
        isEnabled: true,
        isViewerDisabled: false,
        explainVariable: null,
        evaluation: {
          type: 'all',
          numLastPointsForEvaluation: 0,
          ignoreLast: 0,
        },
        forecastPeriod: 3,
        confidence: 80,
        modelType: 'en',
        boundaries: {
          upper: {
            isEnabled: false,
            value: null,
          },
          lower: {
            isEnabled: false,
            value: null,
          },
          isInt: {
            isEnabled: false,
          },
        },
        isAccessible: true,
      },
    };

    expect(result).toEqual(expectedModels);
  });

  it('should return undefined when no statistical models present', () => {
    const column: StyledMeasureColumn = {
      ...mockMeasureColumn,
    } as StyledMeasureColumn;

    const result = createStatisticalModels(column);
    expect(result).toBeUndefined();
  });
});

describe('applyStatisticalModels', () => {
  const baseColumn: StyledMeasureColumn = {
    column: {
      name: 'Profit',
      type: 'measure',
    },
  } as StyledMeasureColumn;

  // Helper functions to create valid model objects
  const createValidForecastModel = (
    overrides: Partial<NonNullable<StatisticalModels['forecast']>> = {},
  ) => ({
    isEnabled: true,
    isViewerDisabled: false,
    explainVariable: null,
    evaluation: {
      type: 'all',
      numLastPointsForEvaluation: 0,
      ignoreLast: 0,
    },
    forecastPeriod: 3,
    confidence: 80,
    modelType: 'en' as const,
    boundaries: {
      upper: {
        isEnabled: false,
        value: null,
      },
      lower: {
        isEnabled: false,
        value: null,
      },
      isInt: {
        isEnabled: false,
      },
    },
    isAccessible: true,
    ...overrides,
  });

  const createValidTrendModel = (
    overrides: Partial<NonNullable<StatisticalModels['trend']>> = {},
  ) => ({
    isEnabled: true,
    isViewerDisabled: false,
    trendType: 'linear' as const,
    ignoreAnomalies: false,
    trendOnForecast: false,
    compare: {
      isEnabled: false,
      period: 'year',
    },
    isAccessible: true,
    ...overrides,
  });

  it('should return original dataOption if statisticalModels is undefined', () => {
    const result = applyStatisticalModels(baseColumn, undefined);
    expect(result).toBe(baseColumn);
  });

  it('should apply forecast model when enabled and not viewer disabled', () => {
    const statisticalModels = {
      forecast: createValidForecastModel({
        isEnabled: true,
        isViewerDisabled: false,
        confidence: 85,
        forecastPeriod: 5,
        modelType: 'aa',
      }),
    };
    const result = applyStatisticalModels(baseColumn, statisticalModels);
    expect(result.forecast).toEqual({
      confidenceInterval: 0.85,
      forecastHorizon: 5,
      modelType: 'autoArima',
    });
  });

  it('should apply trend model when enabled and not viewer disabled', () => {
    const statisticalModels = {
      trend: createValidTrendModel({
        isEnabled: true,
        isViewerDisabled: false,
        trendType: 'local',
      }),
    };
    const result = applyStatisticalModels(baseColumn, statisticalModels);
    expect(result.trend).toEqual({
      modelType: 'localEstimates',
    });
  });

  it('should not apply forecast if isViewerDisabled is true', () => {
    const statisticalModels = {
      forecast: createValidForecastModel({
        isEnabled: true,
        isViewerDisabled: true,
        confidence: 90,
        forecastPeriod: 2,
        modelType: 'fb',
      }),
    };
    const result = applyStatisticalModels(baseColumn, statisticalModels);
    expect(result.forecast).toBeUndefined();
  });

  it('should not apply trend if isEnabled is false', () => {
    const statisticalModels = {
      trend: createValidTrendModel({
        isEnabled: false,
        isViewerDisabled: false,
        trendType: 'smooth',
      }),
    };
    const result = applyStatisticalModels(baseColumn, statisticalModels);
    expect(result.trend).toBeUndefined();
  });

  it('should apply both forecast and trend if both are enabled and not viewer disabled', () => {
    const statisticalModels = {
      forecast: createValidForecastModel({
        isEnabled: true,
        isViewerDisabled: false,
        confidence: 95,
        forecastPeriod: 7,
        modelType: 'hw',
      }),
      trend: createValidTrendModel({
        isEnabled: true,
        isViewerDisabled: false,
        trendType: 'smooth',
      }),
    };
    const result = applyStatisticalModels(baseColumn, statisticalModels);
    expect(result.forecast).toEqual({
      confidenceInterval: 0.95,
      forecastHorizon: 7,
      modelType: 'holtWinters',
    });
    expect(result.trend).toEqual({
      modelType: 'advancedSmoothing',
    });
  });

  it('should use default modelType if unknown forecast modelType is provided', () => {
    const statisticalModels = {
      forecast: createValidForecastModel({
        isEnabled: true,
        isViewerDisabled: false,
        confidence: 80,
        forecastPeriod: 4,
        modelType: 'en',
      }),
    };
    const result = applyStatisticalModels(baseColumn, statisticalModels);
    expect(result.forecast?.modelType).toBe('auto');
  });

  it('should apply boundaries when present in forecast model', () => {
    const statisticalModels = {
      forecast: createValidForecastModel({
        isEnabled: true,
        isViewerDisabled: false,
        boundaries: {
          upper: { isEnabled: true, value: 1000 },
          lower: { isEnabled: true, value: 0 },
          isInt: { isEnabled: true },
        },
      }),
    };
    const result = applyStatisticalModels(baseColumn, statisticalModels);
    expect(result.forecast?.roundToInt).toBe(true);
    expect(result.forecast?.upperBound).toBe(1000);
    expect(result.forecast?.lowerBound).toBe(0);
  });

  it('should not apply boundaries when disabled', () => {
    const statisticalModels = {
      forecast: createValidForecastModel({
        isEnabled: true,
        isViewerDisabled: false,
        boundaries: {
          upper: { isEnabled: false, value: null },
          lower: { isEnabled: false, value: null },
          isInt: { isEnabled: false },
        },
      }),
    };
    const result = applyStatisticalModels(baseColumn, statisticalModels);
    expect(result.forecast?.roundToInt).toBeUndefined();
    expect(result.forecast?.upperBound).toBeUndefined();
    expect(result.forecast?.lowerBound).toBeUndefined();
  });
});
