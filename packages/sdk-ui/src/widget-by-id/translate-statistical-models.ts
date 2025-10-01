import { ForecastFormulaOptions, TrendFormulaOptions } from '@ethings-os/sdk-data';
import { StyledMeasureColumn } from '../types.js';
import { StatisticalModels } from './types.js';

/**
 * Temporary internal flag to enable/disable statistical models in the data options.
 *
 * @internal
 */
const ENABLE_STATISTICAL_MODELS = true;

/**
 * Translate forecast model type from DTO to CSDK Model
 *
 * @param modelType - Forecast model type from DTO
 * @returns Forecast model type from CSDK Model
 */
const translateForecastModelTypeFromDto = (
  modelType: NonNullable<StatisticalModels['forecast']>['modelType'],
): ForecastFormulaOptions['modelType'] => {
  switch (modelType) {
    case 'en':
      return 'auto';
    case 'aa':
      return 'autoArima';
    case 'hw':
      return 'holtWinters';
    case 'fb':
      return 'prophet';
    default:
      return 'auto';
  }
};

/**
 * Translate forecast model type from CSDK Model to DTO
 *
 * @param modelType - Forecast model type from CSDK Model
 * @returns Forecast model type from DTO
 */
const translateForecastModelTypeToDto = (
  modelType: ForecastFormulaOptions['modelType'],
): NonNullable<StatisticalModels['forecast']>['modelType'] => {
  switch (modelType) {
    case 'auto':
      return 'en';
    case 'autoArima':
      return 'aa';
    case 'holtWinters':
      return 'hw';
    case 'prophet':
      return 'fb';
    default:
      return 'en';
  }
};

/**
 * Translate trend model type from DTO to CSDK Model
 *
 * @param modelType - Trend model type from DTO
 * @returns Trend model type from CSDK Model
 */
const translateTrendModelTypeFromDto = (
  modelType: NonNullable<StatisticalModels['trend']>['trendType'],
): TrendFormulaOptions['modelType'] => {
  switch (modelType) {
    case 'linear':
      return 'linear';
    case 'logarithmic':
      return 'logarithmic';
    case 'smooth':
      return 'advancedSmoothing';
    case 'local':
      return 'localEstimates';
    default:
      return 'linear';
  }
};

/**
 * Translate trend model type from CSDK Model to DTO
 *
 * @param modelType - Trend model type from CSDK Model
 * @returns Trend model type from DTO
 */
const translateTrendModelTypeToDto = (
  modelType: TrendFormulaOptions['modelType'],
): NonNullable<StatisticalModels['trend']>['trendType'] => {
  switch (modelType) {
    case 'linear':
      return 'linear';
    case 'logarithmic':
      return 'logarithmic';
    case 'advancedSmoothing':
      return 'smooth';
    case 'localEstimates':
      return 'local';
    default:
      return 'linear';
  }
};

/** @internal */
export function applyStatisticalModels(
  dataOption: StyledMeasureColumn,
  statisticalModels?: StatisticalModels,
): StyledMeasureColumn {
  if (!statisticalModels || !ENABLE_STATISTICAL_MODELS) return dataOption;

  const { forecast, trend } = statisticalModels;
  let newDataOption = { ...dataOption }; // Create a shallow copy to avoid mutation

  if (forecast && !forecast.isViewerDisabled && forecast.isEnabled) {
    const forecastOptions: ForecastFormulaOptions = {
      confidenceInterval: forecast.confidence / 100,
      forecastHorizon: forecast.forecastPeriod,
      modelType: translateForecastModelTypeFromDto(forecast.modelType),
    };

    // Apply boundaries if present
    if (forecast.boundaries) {
      if (forecast.boundaries.isInt?.isEnabled) {
        forecastOptions.roundToInt = true;
      }

      if (forecast.boundaries.upper?.isEnabled) {
        forecastOptions.upperBound = forecast.boundaries.upper.value ?? undefined;
      }

      if (forecast.boundaries.lower?.isEnabled) {
        forecastOptions.lowerBound = forecast.boundaries.lower.value ?? undefined;
      }
    }

    newDataOption = {
      ...newDataOption,
      forecast: forecastOptions,
    };
  }

  if (trend && !trend.isViewerDisabled && trend.isEnabled) {
    newDataOption = {
      ...newDataOption,
      trend: {
        modelType: translateTrendModelTypeFromDto(trend.trendType),
      },
    };
  }

  return newDataOption;
}

/**
 * Create statistical models from styled measure column
 *
 * @internal
 */
export function createStatisticalModels(
  column: StyledMeasureColumn,
): StatisticalModels | undefined {
  if (!ENABLE_STATISTICAL_MODELS) return undefined;

  const models: StatisticalModels = {};

  if (column.forecast) {
    // ForecastFormulaOptions has more detailed configuration
    models.forecast = {
      isEnabled: true,
      isViewerDisabled: false,
      explainVariable: null,
      evaluation: {
        type: 'all',
        numLastPointsForEvaluation: 0,
        ignoreLast: 0,
      },
      // forecastHorizon default is 3 according to ForecastFormulaOptions
      forecastPeriod: column.forecast.forecastHorizon || 3,
      // confidenceInterval valid range is (0.8 <= X < 1)
      confidence: (column.forecast.confidenceInterval || 0.8) * 100,
      modelType: translateForecastModelTypeToDto(column.forecast.modelType),
      boundaries: {
        upper: {
          isEnabled: column.forecast.upperBound !== undefined,
          value: null, // upperBound is used for model training but not stored in DTO
        },
        lower: {
          isEnabled: column.forecast.lowerBound !== undefined,
          value: null, // lowerBound is used for model training but not stored in DTO
        },
        isInt: {
          isEnabled: column.forecast.roundToInt || false,
        },
      },
      isAccessible: true,
    };
  }

  if (column.trend) {
    models.trend = {
      isEnabled: true,
      isViewerDisabled: false,
      trendType: translateTrendModelTypeToDto(column.trend.modelType),
      ignoreAnomalies: column.trend.ignoreAnomalies ?? false,
      trendOnForecast: false,
      compare: {
        isEnabled: false,
        period: 'year',
      },
      isAccessible: true,
    };
  }

  return Object.keys(models).length > 0 ? models : undefined;
}
