import { measureFactory } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import type { CartesianChartDataOptions } from '@/domains/visualizations/core/chart-data-options/types';
import type { DataOptionLocation } from '@/types';

import { getDataOptionByLocation } from './get-data-option-by-location';

describe('getDataOptionByLocation', () => {
  it('should retrieve column from category array', () => {
    const dataOptions: CartesianChartDataOptions = {
      category: [DM.Commerce.Date.Years, DM.Category.Category],
      value: [measureFactory.sum(DM.Commerce.Revenue)],
      breakBy: [],
    };

    const location: DataOptionLocation = {
      dataOptionName: 'category',
      dataOptionIndex: 0,
    };

    const result = getDataOptionByLocation(dataOptions, location);

    expect(result).toBe(DM.Commerce.Date.Years);
  });

  it('should retrieve styled column from breakBy array', () => {
    const styledColumn = {
      column: DM.Country.Country,
    };

    const dataOptions: CartesianChartDataOptions = {
      category: [DM.Commerce.Date.Years],
      value: [measureFactory.sum(DM.Commerce.Revenue)],
      breakBy: [styledColumn],
    };

    const location: DataOptionLocation = {
      dataOptionName: 'breakBy',
      dataOptionIndex: 0,
    };

    const result = getDataOptionByLocation(dataOptions, location);

    expect(result).toBe(styledColumn);
  });

  it('should retrieve measure from value array', () => {
    const revenueMeasure = measureFactory.sum(DM.Commerce.Revenue);
    const costMeasure = measureFactory.sum(DM.Commerce.Cost);

    const dataOptions: CartesianChartDataOptions = {
      category: [DM.Commerce.Date.Years],
      value: [revenueMeasure, costMeasure],
      breakBy: [],
    };

    const location: DataOptionLocation = {
      dataOptionName: 'value',
      dataOptionIndex: 1,
    };

    const result = getDataOptionByLocation(dataOptions, location);

    expect(result).toBe(costMeasure);
  });

  it('should return undefined for out-of-bounds index', () => {
    const dataOptions: CartesianChartDataOptions = {
      category: [DM.Commerce.Date.Years],
      value: [measureFactory.sum(DM.Commerce.Revenue)],
      breakBy: [],
    };

    const location: DataOptionLocation = {
      dataOptionName: 'category',
      dataOptionIndex: 5,
    };

    const result = getDataOptionByLocation(dataOptions, location);

    expect(result).toBeUndefined();
  });

  it('should return undefined for non-existent property', () => {
    const dataOptions: CartesianChartDataOptions = {
      category: [DM.Commerce.Date.Years],
      value: [measureFactory.sum(DM.Commerce.Revenue)],
      breakBy: [],
    };

    const location: DataOptionLocation = {
      dataOptionName: 'nonExistent' as DataOptionLocation['dataOptionName'],
      dataOptionIndex: 0,
    };

    const result = getDataOptionByLocation(dataOptions, location);

    expect(result).toBeUndefined();
  });

  it('should use default index 0 when index is not provided for array', () => {
    const dataOptions: CartesianChartDataOptions = {
      category: [DM.Commerce.Date.Years],
      value: [measureFactory.sum(DM.Commerce.Revenue)],
      breakBy: [],
    };

    const location: DataOptionLocation = {
      dataOptionName: 'category',
    };

    const result = getDataOptionByLocation(dataOptions, location);

    expect(result).toBe(DM.Commerce.Date.Years);
  });
});
