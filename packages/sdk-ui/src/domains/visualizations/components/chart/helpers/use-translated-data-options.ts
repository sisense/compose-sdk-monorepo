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
  isForecastOrTrendChart?: boolean,
) => {
  return useMemo(() => {
    return getTranslatedDataOptions(chartDataOptions, chartType, {
      isForecastOrTrendChart,
      shouldHaveUniqueDataColumnNames: true,
    });
  }, [chartDataOptions, chartType, isForecastOrTrendChart]);
};

export function getTranslatedDataOptions(
  chartDataOptions: ChartDataOptions,
  chartType: ChartType,
  options?: {
    /** Indicates if the chart is a forecast or trend chart for temporal routing between legacy and restructured charts processing */
    isForecastOrTrendChart?: boolean;
    /** Indicates if the data column names should be generated uniquely */
    shouldHaveUniqueDataColumnNames?: boolean;
  },
) {
  if (isRestructuredChartType(chartType) && !options?.isForecastOrTrendChart) {
    const chartBuilder = getChartBuilder(chartType);
    if (!chartBuilder.dataOptions.isCorrectDataOptions(chartDataOptions)) {
      throw new Error('Incorrect data options');
    }
    return newTranslateDataOptions(chartBuilder, chartDataOptions, options);
  } else {
    return legacyTranslateDataOptions(chartDataOptions, chartType, options);
  }
}

function newTranslateDataOptions<CT extends SupportedChartType>(
  chartBuilder: ChartBuilder<CT>,
  chartDataOptions: TypedChartDataOptions<CT>,
  options?: {
    /** Indicates if the data column names should be generated uniquely */
    shouldHaveUniqueDataColumnNames?: boolean;
  },
) {
  const internalDataOptions =
    chartBuilder.dataOptions.translateDataOptionsToInternal(chartDataOptions);
  const attributes = chartBuilder.dataOptions.getAttributes(internalDataOptions);
  const measures = chartBuilder.dataOptions.getMeasures(internalDataOptions);
  const dataColumnNamesMapping = options?.shouldHaveUniqueDataColumnNames
    ? generateUniqueDataColumnsNames(measures)
    : {};
  return { dataOptions: internalDataOptions, attributes, measures, dataColumnNamesMapping };
}

function legacyTranslateDataOptions(
  chartDataOptions: ChartDataOptions,
  chartType: ChartType,
  options?: {
    /** Indicates if the data column names should be generated uniquely */
    shouldHaveUniqueDataColumnNames?: boolean;
  },
) {
  const { dataOptions, attributes, measures } = legacyGetTranslatedDataOptions(
    chartDataOptions,
    chartType,
  );
  const dataColumnNamesMapping = options?.shouldHaveUniqueDataColumnNames
    ? generateUniqueDataColumnsNames(measures)
    : {};
  return {
    dataOptions,
    attributes,
    measures,
    dataColumnNamesMapping,
  };
}
