import { TranslatableError } from '../../translation/translatable-error';
import { CategoricalChartType } from '../../types';
import { CategoricalChartDataOptions } from '../types';

export function validateCategoricalChartDataOptions(
  chartType: CategoricalChartType,
  dataOptions: CategoricalChartDataOptions,
): CategoricalChartDataOptions {
  if (!dataOptions.value || dataOptions.value.length === 0) {
    throw new TranslatableError('errors.dataOptions.emptyValueArray');
  }
  return filterCategoricalDataOptionsByAllowedLength(chartType, dataOptions);
}

type MaxCategoricalDataOptionsLengths = {
  category: number;
  value: number;
};

type MaxCategoricalDataOptionsLengthsMap = {
  [key in CategoricalChartType]: MaxCategoricalDataOptionsLengths;
};

/**
 * Maximum allowed lengths of attributes per categorical chart type.
 */
const maxCategoricalDataOptionsLengthsMap: MaxCategoricalDataOptionsLengthsMap = {
  pie: {
    category: 1,
    value: 1,
  },
  funnel: {
    category: 1,
    value: 1,
  },
  treemap: {
    category: 3,
    value: 1,
  },
};

/**
 * Filter data options by allowed length of attributes for specific chart type.
 * @param chartType
 * @param dataOptions
 * @returns
 */
function filterCategoricalDataOptionsByAllowedLength(
  chartType: CategoricalChartType,
  dataOptions: CategoricalChartDataOptions,
): CategoricalChartDataOptions {
  const maxLengths = maxCategoricalDataOptionsLengthsMap[chartType];
  if (dataOptions.category.length > maxLengths.category) {
    console.warn(
      `Maximum 'category' length is limited to ${maxLengths.category} for '${chartType}' chart. Taken first ${maxLengths.category} categories`,
    );
  }
  const filteredCategory = dataOptions.category.slice(0, maxLengths.category);

  if (dataOptions.value.length > maxLengths.value) {
    console.warn(
      `Maximum 'value' length is limited to ${maxLengths.value} for '${chartType}' chart. Taken first ${maxLengths.value} values`,
    );
  }
  const filteredValue = dataOptions.value.slice(0, maxLengths.value);
  return {
    ...dataOptions,
    category: filteredCategory,
    value: filteredValue,
  };
}
