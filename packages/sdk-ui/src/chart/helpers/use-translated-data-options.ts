import { useMemo } from 'react';
import { getTranslatedDataOptions } from '@/chart-data-options/get-translated-data-options';
import { translateMeasureToValue } from '@/chart-data-options/utils';
import { generateUniqueDataColumnsNames } from '@/chart-data-options/validate-data-options';
import { ChartDataOptions, ChartType } from '@/types';

export const useTranslatedDataOptions = (dataOptions: ChartDataOptions, chartType: ChartType) => {
  return useMemo(() => {
    const { chartDataOptions, attributes, measures } = getTranslatedDataOptions(
      dataOptions,
      chartType,
    );
    const dataColumnNamesMapping = generateUniqueDataColumnsNames(
      measures.map(translateMeasureToValue),
    );
    return {
      chartDataOptions,
      attributes,
      measures,
      dataColumnNamesMapping,
    };
  }, [dataOptions, chartType]);
};
