import { SAMPLE_ECOMMERCE_TREEMAP_CHART } from '../../__mocks__/example-charts.js';
import {
  MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
} from '../../__mocks__/mock-data-sources.js';
import type { NlqTranslationError } from '../../types.js';
import { getErrors, getSuccessData } from '../shared/utils/translation-helpers.js';
import type { ChartJSON } from '../types.js';
import { translateChartFromJSON } from './translate-chart-from-json.js';

describe('translateChartFromJSON', () => {
  it('should translate treemap chart with category and value', () => {
    const result = translateChartFromJSON({
      data: SAMPLE_ECOMMERCE_TREEMAP_CHART,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(true);
    const chartProps = getSuccessData(result);
    expect(chartProps.chartType).toBe('treemap');
    expect(chartProps.dataOptions).toBeDefined();
    const dataOptions = chartProps.dataOptions as { category?: unknown[]; value?: unknown[] };
    expect(dataOptions.category).toHaveLength(2);
    expect(dataOptions.value).toHaveLength(1);
  });
  it('should produce StyledMeasureColumn for value with sortType', () => {
    const chartJSON = {
      chartType: 'bar',
      dataOptions: {
        category: ['DM.Category.Category'],
        value: [
          {
            column: {
              function: 'measureFactory.sum',
              args: ['DM.Commerce.Revenue', 'Total Revenue'],
            },
            sortType: 'sortDesc' as const,
          },
        ],
        breakBy: [],
      },
    };

    const result = translateChartFromJSON({
      data: chartJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(true);
    const chartProps = getSuccessData(result);
    expect(chartProps.dataOptions).toBeDefined();
    const value = (chartProps.dataOptions as { value?: unknown[] }).value;
    expect(value).toHaveLength(1);
    expect(value![0]).toHaveProperty('column');
    expect(value![0]).toHaveProperty('sortType', 'sortDesc');
  });

  it('should produce StyledColumn for breakBy with sortType', () => {
    const chartJSON = {
      chartType: 'column',
      dataOptions: {
        category: ['DM.Commerce.Date.Years'],
        value: [
          {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Revenue', 'Total Revenue'],
          },
        ],
        breakBy: [{ column: 'DM.Commerce.Gender', sortType: 'sortAsc' as const }],
      },
    };

    const result = translateChartFromJSON({
      data: chartJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(true);
    const chartProps = getSuccessData(result);
    expect(chartProps.dataOptions).toBeDefined();
    const breakBy = (chartProps.dataOptions as { breakBy?: unknown[] }).breakBy;
    expect(breakBy).toHaveLength(1);
    expect(breakBy![0]).toHaveProperty('column');
    expect(breakBy![0]).toHaveProperty('sortType', 'sortAsc');
  });

  it('should produce unwrapped Attribute/Measure for plain string/FunctionCall', () => {
    const chartJSON = {
      chartType: 'bar',
      dataOptions: {
        category: ['DM.Category.Category'],
        value: [
          {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Revenue', 'Total Revenue'],
          },
        ],
        breakBy: [],
      },
    };

    const result = translateChartFromJSON({
      data: chartJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(true);
    const chartProps = getSuccessData(result);
    const dataOptions = chartProps.dataOptions as {
      category?: unknown[];
      value?: unknown[];
    };
    expect(dataOptions.category).toHaveLength(1);
    expect(dataOptions.value).toHaveLength(1);
    // Plain string produces Attribute (no column wrapper)
    expect(dataOptions.category![0]).not.toHaveProperty('column');
    expect(dataOptions.category![0]).toHaveProperty('composeCode');
    // Plain FunctionCall produces Measure (no column wrapper)
    expect(dataOptions.value![0]).not.toHaveProperty('column');
    expect(dataOptions.value![0]).toHaveProperty('composeCode');
  });

  it('should return error with suggestion when dimension has table typo', () => {
    const chartJSON = {
      chartType: 'column',
      dataOptions: {
        category: ['DM.Comerce.Category'],
        value: [{ function: 'measureFactory.sum', args: ['DM.Commerce.Revenue'] }],
      },
    };

    const result = translateChartFromJSON({
      data: chartJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    expect(getErrors(result).some((msg) => msg.includes("Did you mean 'Commerce'?"))).toBe(true);
  });

  it('should return error with suggestion when measure has column typo', () => {
    const chartJSON = {
      chartType: 'column',
      dataOptions: {
        category: ['DM.Category.Category'],
        value: [{ function: 'measureFactory.sum', args: ['DM.Commerce.Reveneu'] }],
      },
    };

    const result = translateChartFromJSON({
      data: chartJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    expect(getErrors(result).some((msg) => msg.includes("Did you mean 'Revenue'?"))).toBe(true);
  });

  it('should collect multiple errors across category and value axes', () => {
    const chartJSON = {
      chartType: 'column',
      dataOptions: {
        category: ['DM.Commerce.Date.Year'], // Invalid: should be 'Years'
        value: [
          {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.RevenueTYPO', 'Total Revenue'], // Invalid: typo in Revenue
          },
        ],
        breakBy: ['DM.Commerce.Gender'],
      },
    };

    const result = translateChartFromJSON({
      data: chartJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    const errors = (
      result as { errors: Array<{ category: string; index: unknown; message: string }> }
    ).errors;
    expect(errors.length).toBeGreaterThanOrEqual(2);

    const categoryError = errors.find(
      (e) => e.category === 'dataOptions' && e.index === 'category',
    );
    const valueError = errors.find((e) => e.category === 'dataOptions' && e.index === 'value');

    expect(categoryError).toBeDefined();
    expect(categoryError!.message).toMatch(/Invalid date level 'Year'/);
    expect(categoryError!.message).toMatch(/Did you mean 'Years'/);

    expect(valueError).toBeDefined();
    expect(valueError!.message).toMatch(/RevenueTYPO|not found|Did you mean 'Revenue'/);
  });

  it('should return error when chartType prop has typo (chartTypeZZ)', () => {
    const chartJSON = {
      chartTypeZZ: 'column',
      dataOptions: {
        category: ['DM.Commerce.Date.Years'],
        value: [{ function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] }],
        breakBy: ['DM.Commerce.Gender'],
      },
    };

    const result = translateChartFromJSON({
      data: chartJSON as unknown as ChartJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    const errors = (result as { errors: NlqTranslationError[] }).errors;
    const chartTypeError = errors.find((e) => e.category === 'chartType' && e.index === -1);
    expect(chartTypeError).toBeDefined();
    expect(chartTypeError!.message).toMatch(/chartType is required/);
    expect(chartTypeError!.message).toMatch(/chartTypeZZ/);
    expect(chartTypeError!.input).toEqual({ chartTypeZZ: 'column' });
  });

  it('should return error with suggestion when chartType value is invalid (colunn)', () => {
    const chartJSON = {
      chartType: 'colunn',
      dataOptions: {
        category: ['DM.Commerce.Date.Years'],
        value: [{ function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] }],
        breakBy: ['DM.Commerce.Gender'],
      },
    };

    const result = translateChartFromJSON({
      data: chartJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    const errors = (result as { errors: NlqTranslationError[] }).errors;
    const chartTypeError = errors.find((e) => e.category === 'chartType' && e.index === -1);
    expect(chartTypeError).toBeDefined();
    expect(chartTypeError!.message).toMatch(/Invalid chartType 'colunn'/);
    expect(chartTypeError!.message).toMatch(/Did you mean 'column'/);
  });

  it('should return error when chartType value is invalid (columnINVALID) without suggestion', () => {
    const chartJSON = {
      chartType: 'columnINVALID',
      dataOptions: {
        category: ['DM.Commerce.Date.Years'],
        value: [{ function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] }],
      },
    };

    const result = translateChartFromJSON({
      data: chartJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    const errors = (result as { errors: NlqTranslationError[] }).errors;
    const chartTypeError = errors.find((e) => e.category === 'chartType' && e.index === -1);
    expect(chartTypeError).toBeDefined();
    expect(chartTypeError!.message).toMatch(/Invalid chartType 'columnINVALID'/);
    expect(chartTypeError!.message).toMatch(/Valid types/);
  });

  it('should return error when dataOptions has typo in axis key (categry)', () => {
    const chartJSON = {
      chartType: 'column',
      dataOptions: {
        categry: ['DM.Commerce.Date.Years'],
        value: [{ function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] }],
      },
    };

    const result = translateChartFromJSON({
      data: chartJSON as unknown as ChartJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    const errors = (result as { errors: NlqTranslationError[] }).errors;
    const dataOptionsError = errors.find(
      (e) => e.category === 'dataOptions' && e.index === 'categry',
    );
    expect(dataOptionsError).toBeDefined();
    expect(dataOptionsError!.message).toMatch(/Unknown dataOptions key 'categry'/);
    expect(dataOptionsError!.message).toMatch(/Did you mean 'category'/);
  });

  it('should not duplicate error when typo suggests required axis (categoryz -> category)', () => {
    const chartJSON = {
      chartType: 'column',
      dataOptions: {
        categoryz: ['DM.Commerce.Date.Years'],
        value: [{ function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] }],
      },
    };

    const result = translateChartFromJSON({
      data: chartJSON as unknown as ChartJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    const errors = (result as { errors: NlqTranslationError[] }).errors;
    const typoError = errors.find((e) => e.category === 'dataOptions' && e.index === 'categoryz');
    const missingError = errors.find(
      (e) =>
        e.category === 'dataOptions' && e.index === 'category' && e.message.includes('Missing'),
    );
    expect(typoError).toBeDefined();
    expect(typoError!.message).toMatch(/Unknown dataOptions key 'categoryz'/);
    expect(typoError!.message).toMatch(/Did you mean 'category'/);
    expect(missingError).toBeUndefined();
  });

  it('should return error when axis is invalid for chart type (category on scattermap)', () => {
    const chartJSON = {
      chartType: 'scattermap',
      dataOptions: {
        category: ['DM.Commerce.Date.Years'],
        geo: ['DM.Country.Country'],
      },
    };

    const result = translateChartFromJSON({
      data: chartJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    const errors = (result as { errors: NlqTranslationError[] }).errors;
    const invalidAxisError = errors.find(
      (e) =>
        e.category === 'dataOptions' &&
        e.index === 'category' &&
        e.message.includes('not valid for chart type'),
    );
    expect(invalidAxisError).toBeDefined();
    expect(invalidAxisError!.message).toMatch(/scattermap/);
    expect(invalidAxisError!.message).toMatch(/geo|size|colorBy|details/);
  });

  it('should return error when required axis is missing (column without value)', () => {
    const chartJSON = {
      chartType: 'column',
      dataOptions: {
        category: ['DM.Commerce.Date.Years'],
      },
    };

    const result = translateChartFromJSON({
      data: chartJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    const errors = (result as { errors: NlqTranslationError[] }).errors;
    const missingError = errors.find(
      (e) => e.category === 'dataOptions' && e.index === 'value' && e.message.includes('Missing'),
    );
    expect(missingError).toBeDefined();
    expect(missingError!.message).toMatch(/requires.*value/);
  });

  it('should return error when indicator has no measures', () => {
    const chartJSON = {
      chartType: 'indicator',
      dataOptions: {},
    };

    const result = translateChartFromJSON({
      data: chartJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    const errors = (result as { errors: NlqTranslationError[] }).errors;
    const indicatorError = errors.find(
      (e) =>
        e.category === 'dataOptions' &&
        e.message.includes('Indicator chart requires at least one of'),
    );
    expect(indicatorError).toBeDefined();
  });

  it('should enrich boxplot dataOptions with boxType and outliersEnabled from styleOptions.subtype', () => {
    const chartJSON = {
      chartType: 'boxplot',
      dataOptions: {
        category: ['DM.Category.Category'],
        value: ['DM.Commerce.Cost'],
      },
      styleOptions: { subtype: 'boxplot/iqr' },
    } as unknown as ChartJSON;

    const result = translateChartFromJSON({
      data: chartJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(true);
    const chartProps = getSuccessData(result);
    const dataOptions = chartProps.dataOptions as {
      category?: unknown[];
      value?: unknown[];
      boxType?: string;
      outliersEnabled?: boolean;
    };
    expect(dataOptions.boxType).toBe('iqr');
    expect(dataOptions.outliersEnabled).toBe(true);
    expect(dataOptions.category).toHaveLength(1);
    expect(dataOptions.value).toHaveLength(1);
  });
});
