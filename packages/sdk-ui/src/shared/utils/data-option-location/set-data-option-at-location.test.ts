import { measureFactory } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import type { CartesianChartDataOptions } from '@/domains/visualizations/core/chart-data-options/types.js';
import type { DataOptionLocation } from '@/types';

import { setDataOptionAtLocation } from './set-data-option-at-location.js';

describe('setDataOptionAtLocation', () => {
  it('should update column in category array', () => {
    const dataOptions: CartesianChartDataOptions = {
      category: [DM.Commerce.Date.Years, DM.Category.Category],
      value: [measureFactory.sum(DM.Commerce.Revenue)],
      breakBy: [],
    };

    const location: DataOptionLocation = {
      dataOptionName: 'category',
      dataOptionIndex: 1,
    };

    const result = setDataOptionAtLocation(DM.Commerce.AgeRange, location, dataOptions);

    expect(result.category[0]).toBe(DM.Commerce.Date.Years); // First item unchanged
    expect(result.category[1]).toBe(DM.Commerce.AgeRange);
  });

  it('should update styled column in breakBy array', () => {
    const styledColumn = {
      column: DM.Commerce.Country,
    };

    const newStyledColumn = {
      column: DM.Category.Category,
    };

    const dataOptions: CartesianChartDataOptions = {
      category: [DM.Commerce.Date.Years],
      value: [measureFactory.sum(DM.Commerce.Cost)],
      breakBy: [styledColumn],
    };

    const location: DataOptionLocation = {
      dataOptionName: 'breakBy',
      dataOptionIndex: 0,
    };

    const result = setDataOptionAtLocation(newStyledColumn, location, dataOptions);

    expect(result.breakBy[0]).toBe(newStyledColumn);
  });

  it('should update measure in value array', () => {
    const dataOptions: CartesianChartDataOptions = {
      category: [DM.Category.Category],
      value: [measureFactory.sum(DM.Commerce.Revenue), measureFactory.sum(DM.Commerce.Cost)],
      breakBy: [],
    };

    const location: DataOptionLocation = {
      dataOptionName: 'value',
      dataOptionIndex: 1,
    };
    const newMeasure = measureFactory.sum(DM.Commerce.Quantity);

    const result = setDataOptionAtLocation(newMeasure, location, dataOptions);

    expect(result.value[0]).toBe(dataOptions.value[0]); // First item unchanged
    expect(result.value[1]).toBe(newMeasure);
  });

  it('should return original object for non-existent property', () => {
    const dataOptions: CartesianChartDataOptions = {
      category: [DM.Category.Category],
      value: [measureFactory.sum(DM.Commerce.Revenue)],
      breakBy: [],
    };

    const location: DataOptionLocation = {
      dataOptionName: 'nonExistent' as DataOptionLocation['dataOptionName'],
      dataOptionIndex: 0,
    };

    const result = setDataOptionAtLocation(DM.Commerce.AgeRange, location, dataOptions);

    expect(result).toBe(dataOptions); // Should return original object
  });

  it('should return original object for out-of-bounds index', () => {
    const dataOptions: CartesianChartDataOptions = {
      category: [DM.Category.Category],
      value: [measureFactory.sum(DM.Commerce.Revenue)],
      breakBy: [],
    };

    const location: DataOptionLocation = {
      dataOptionName: 'category',
      dataOptionIndex: 5,
    };

    const result = setDataOptionAtLocation(DM.Commerce.AgeRange, location, dataOptions);

    expect(result).toBe(dataOptions); // Should return original object
  });
});
