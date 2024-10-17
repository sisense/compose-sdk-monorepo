import { useMemo } from 'react';
import { getTranslatedDataOptions } from '@/chart-data-options/get-translated-data-options';
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
    const dataColumnNamesMapping = generateUniqueDataColumnsNames(measures);
    return {
      dataOptions,
      attributes,
      measures,
      dataColumnNamesMapping,
    };
  }, [chartDataOptions, chartType]);
};
