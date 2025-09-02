import { useMemo } from 'react';
import { getTranslatedDataOptions as legacyGetTranslatedDataOptions } from '@/chart-data-options/get-translated-data-options';
import { generateUniqueDataColumnsNames } from '@/chart-data-options/validate-data-options';
import { ChartDataOptions, ChartType } from '@/types';
import { isRestructuredChartType } from '../restructured-charts/utils';
import { getChartBuilder } from '../restructured-charts/chart-builder-factory';
import {
  ChartBuilder,
  SupportedChartType,
  TypedChartDataOptions,
} from '../restructured-charts/types';

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
