import { ChartDataOptions, ChartType } from '../types';
import { getAttributes, getMeasures, translateChartDataOptions } from './translate-data-options';
import { applyDefaultChartDataOptions, validateDataOptions } from './validate-data-options';

export function getTranslatedDataOptions(chartDataOptions: ChartDataOptions, chartType: ChartType) {
  {
    const validatedDataOptions = validateDataOptions(chartType, chartDataOptions);
    // translate to internal options
    const chartDataOptionsWithoutDefaults = translateChartDataOptions(
      chartType,
      validatedDataOptions,
    );

    // apply default options
    const dataOptions = applyDefaultChartDataOptions(chartDataOptionsWithoutDefaults, chartType);

    const attributes = getAttributes(dataOptions, chartType);
    const measures = getMeasures(dataOptions, chartType);

    return {
      dataOptions,
      attributes,
      measures,
    };
  }
}
