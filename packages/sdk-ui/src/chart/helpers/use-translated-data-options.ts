import { useMemo } from 'react';
import { getTranslatedDataOptions } from '@/chart-data-options/get-translated-data-options';
import { translateMeasureToValue } from '@/chart-data-options/utils';
import { generateUniqueDataColumnsNames } from '@/chart-data-options/validate-data-options';
import { ChartDataOptions, ChartType } from '@/types';

export const useTranslatedDataOptions = (
  chartDataOptions: ChartDataOptions,
  chartType: ChartType,
) => {
  return useMemo(() => {
    const { dataOptions, attributes, measures } = getTranslatedDataOptions(
      chartDataOptions,
      chartType,
    );
    const dataColumnNamesMapping = generateUniqueDataColumnsNames(
      measures.map(translateMeasureToValue),
    );
    return {
      dataOptions,
      attributes,
      measures,
      dataColumnNamesMapping,
    };
  }, [chartDataOptions, chartType]);
};
