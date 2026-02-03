import { measureFactory } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import type { CartesianChartDataOptions } from '@/domains/visualizations/core/chart-data-options/types';

import { getDataOptionLocation } from './get-data-option-location';

describe('getDataOptionLocation', () => {
  it('should find column in category array', () => {
    const dataOptions: CartesianChartDataOptions = {
      category: [DM.Commerce.Date.Years, DM.Category.Category],
      value: [measureFactory.sum(DM.Commerce.Revenue)],
      breakBy: [],
    };

    const result = getDataOptionLocation(dataOptions, DM.Category.Category);

    expect(result).toEqual({
      dataOptionName: 'category',
      dataOptionIndex: 1,
    });
  });

  it('should find styled column in breakBy array', () => {
    const styledColumn = {
      column: DM.Country.Country,
    };

    const dataOptions: CartesianChartDataOptions = {
      category: [DM.Commerce.Date.Years],
      value: [measureFactory.sum(DM.Commerce.Revenue)],
      breakBy: [styledColumn],
    };

    const result = getDataOptionLocation(dataOptions, DM.Country.Country);

    expect(result).toEqual({
      dataOptionName: 'breakBy',
      dataOptionIndex: 0,
    });
  });

  it('should return undefined when column is not found', () => {
    const dataOptions: CartesianChartDataOptions = {
      category: [DM.Commerce.Date.Years],
      value: [measureFactory.sum(DM.Commerce.Revenue)],
      breakBy: [],
    };

    const result = getDataOptionLocation(dataOptions, DM.Commerce.AgeRange);

    expect(result).toBeUndefined();
  });
});
