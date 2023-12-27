import { ChartDataOptions, ChartType } from '../types';
import { getAttributes, getMeasures, translateChartDataOptions } from './translate-data-options';
import { applyDefaultChartDataOptions, validateDataOptions } from './validate-data-options';

export function getTranslatedDataOptions(dataOptions: ChartDataOptions, chartType: ChartType) {
  {
    const validatedDataOptions = validateDataOptions(chartType, dataOptions);
    // translate to internal options
    const chartDataOptionsWithoutDefaults = translateChartDataOptions(
      chartType,
      validatedDataOptions,
    );

    // apply default options
    const chartDataOptions = applyDefaultChartDataOptions(
      chartDataOptionsWithoutDefaults,
      chartType,
    );

    const attributes = getAttributes(chartDataOptions, chartType);
    const measures = getMeasures(chartDataOptions, chartType);

    return {
      chartDataOptions,
      attributes,
      measures,
    };
  }
}
