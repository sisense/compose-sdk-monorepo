import { useMemo } from 'react';

import { getTranslatedDataOptions as legacyGetTranslatedDataOptions } from '@/domains/visualizations/core/chart-data-options/get-translated-data-options.js';
import { generateUniqueDataColumnsNames } from '@/domains/visualizations/core/chart-data-options/validate-data-options/index.js';
import { ChartDataOptions, ChartType } from '@/types';

import { getChartBuilder } from '../restructured-charts/chart-builder-factory.js';
import {
  ChartBuilder,
  SupportedChartType,
  TypedChartDataOptions,
} from '../restructured-charts/types.js';
import { isRestructuredChartType } from '../restructured-charts/utils.js';

export const useTranslatedDataOptions = (
  chartDataOptions: ChartDataOptions,
  chartType: ChartType,
  /** Indicates if the chart is a forecast or trend chart for temporal routing between legacy and restructured charts processing */
  isForecastOrTrendChart: boolean,
) => {
  return useMemo(() => {
    if (isRestructuredChartType(chartType) && !isForecastOrTrendChart) {
      const chartBuilder = getChartBuilder(chartType);
      if (!chartBuilder.dataOptions.isCorrectDataOptions(chartDataOptions)) {
        throw new Error('Incorrect data options');
      }
      return newTranslateDataOptions(chartBuilder, chartDataOptions);
    } else {
      return legacyTranslateDataOptions(chartDataOptions, chartType);
    }
  }, [chartDataOptions, chartType, isForecastOrTrendChart]);
};

function newTranslateDataOptions<CT extends SupportedChartType>(
  chartBuilder: ChartBuilder<CT>,
  chartDataOptions: TypedChartDataOptions<CT>,
) {
  const internalDataOptions =
    chartBuilder.dataOptions.translateDataOptionsToInternal(chartDataOptions);
  const attributes = chartBuilder.dataOptions.getAttributes(internalDataOptions);
  const measures = chartBuilder.dataOptions.getMeasures(internalDataOptions);
  const dataColumnNamesMapping = generateUniqueDataColumnsNames(measures);
  return {
    dataOptions: internalDataOptions,
    attributes,
    measures,
    dataColumnNamesMapping,
  };
}

function legacyTranslateDataOptions(chartDataOptions: ChartDataOptions, chartType: ChartType) {
  const { dataOptions, attributes, measures } = legacyGetTranslatedDataOptions(
    chartDataOptions,
    chartType,
  );
  const dataColumnNamesMapping = generateUniqueDataColumnsNames(measures);
  return {
    dataOptions,
    attributes,
    measures,
    dataColumnNamesMapping,
  };
}
