import flow from 'lodash-es/flow';

import { Transformer } from '@/utils/utility-types/transformer';

import { CategoricalChartType } from '../../types';
import { CategoricalChartDataOptions } from '../types';

export function validateCategoricalChartDataOptions(
  chartType: CategoricalChartType,
  dataOptions: CategoricalChartDataOptions,
): CategoricalChartDataOptions {
  const maxLengths = maxCategoricalDataOptionsLengthsMap[chartType];

  // For pie charts, only apply value limitation if there are categories
  const shouldApplyValueLimitation = chartType !== 'pie' || dataOptions.category.length > 0;

  const transformers: Transformer<CategoricalChartDataOptions>[] = [
    withCategoryLimitation(maxLengths.category),
    shouldApplyValueLimitation
      ? withValueLimitation(maxLengths.value)
      : (data: CategoricalChartDataOptions) => data,
  ];

  // Apply transformers in sequence
  return flow(...transformers)(dataOptions);
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
    category: 3,
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
  sunburst: {
    category: 6,
    value: 1,
  },
};

/**
 * Creates a transformer that limits the number of categories in chart data options.
 *
 * @param maxCategories - Maximum allowed number of categories
 * @returns Transformer function that limits categories
 */
export function withCategoryLimitation(maxCategories: number) {
  return (dataOptions: CategoricalChartDataOptions): CategoricalChartDataOptions => {
    if (dataOptions.category.length > maxCategories) {
      console.warn(
        `Maximum 'category' length is limited to ${maxCategories}. Taken first ${maxCategories} categories`,
      );
    }

    return {
      ...dataOptions,
      category: dataOptions.category.slice(0, maxCategories),
    };
  };
}

/**
 * Creates a transformer that limits the number of values in chart data options.
 *
 * @param maxValues - Maximum allowed number of values
 * @returns Transformer function that limits values
 */
export function withValueLimitation(maxValues: number) {
  return (dataOptions: CategoricalChartDataOptions): CategoricalChartDataOptions => {
    if (dataOptions.value.length > maxValues) {
      console.warn(
        `Maximum 'value' length is limited to ${maxValues}. Taken first ${maxValues} values`,
      );
    }

    return {
      ...dataOptions,
      value: dataOptions.value.slice(0, maxValues),
    };
  };
}
