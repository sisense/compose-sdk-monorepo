import { validateCategoricalChartDataOptions } from './validate-categorical-data-options';
import * as DM from '../../__demo__/sample-ecommerce';
import { measures } from '@sisense/sdk-data';

describe('validateCategoricalChartDataOptions', () => {
  const CATEGORY_1 = DM.Commerce.Condition;
  const CATEGORY_2 = DM.Commerce.AgeRange;
  const CATEGORY_3 = DM.Commerce.Gender;
  const CATEGORY_4 = DM.Commerce.CountryID;
  const VALUE_1 = measures.sum(DM.Commerce.Revenue);
  const VALUE_2 = measures.sum(DM.Commerce.Cost);
  const VALUE_3 = measures.sum(DM.Commerce.Quantity);

  it('should throw an error when dataOptions.value is empty', () => {
    const chartType = 'pie';
    const dataOptions = {
      category: [CATEGORY_1],
      value: [],
    };

    expect(() => validateCategoricalChartDataOptions(chartType, dataOptions)).toThrow();
  });

  it('should not throw an error when dataOptions.value is not empty', () => {
    const chartType = 'pie';
    const dataOptions = {
      category: [CATEGORY_1],
      value: [CATEGORY_2],
    };

    expect(() => validateCategoricalChartDataOptions(chartType, dataOptions)).not.toThrow();
  });

  it('should filter dataOptions by allowed lengths for the specified chart type', () => {
    const chartType = 'treemap';
    const dataOptions = {
      category: [CATEGORY_1, CATEGORY_2, CATEGORY_3, CATEGORY_4],
      value: [VALUE_1, VALUE_2],
    };

    const result = validateCategoricalChartDataOptions(chartType, dataOptions);

    expect(result.category).toHaveLength(3); // Maximum 'category' length for 'treemap' is 3
    expect(result.value).toHaveLength(1); // Maximum 'value' length for 'treemap' is 1
  });

  it('should filter dataOptions correctly for the specified chart type', () => {
    const chartType = 'funnel';
    const dataOptions = {
      category: [CATEGORY_1, CATEGORY_2, CATEGORY_3],
      value: [VALUE_1, VALUE_2, VALUE_3],
    };

    const result = validateCategoricalChartDataOptions(chartType, dataOptions);

    // Ensure that the data options are correctly filtered based on the chart type.
    expect(result.category).toHaveLength(1); // Maximum 'category' length for 'funnel' is 1
    expect(result.value).toHaveLength(1); // Maximum 'value' length for 'funnel' is 1
  });

  describe('warnings in console', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should log a warning when too many categories are provided', () => {
      const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
      const chartType = 'funnel';
      const dataOptions = {
        category: [CATEGORY_1, CATEGORY_2, CATEGORY_3, CATEGORY_4],
        value: [VALUE_1],
      };

      validateCategoricalChartDataOptions(chartType, dataOptions);

      // Expect that a warning message is logged to the console
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `Maximum 'category' length is limited to 1 for 'funnel' chart. Taken first 1 categories`,
        ),
      );
    });

    it('should log a warning when too many values are provided', () => {
      const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
      const chartType = 'funnel';
      const dataOptions = {
        category: [CATEGORY_1],
        value: [VALUE_1, VALUE_2, VALUE_3],
      };

      validateCategoricalChartDataOptions(chartType, dataOptions);

      // Expect that a warning message is logged to the console
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `Maximum 'value' length is limited to 1 for 'funnel' chart. Taken first 1 values`,
        ),
      );
    });
  });
});
