import { createAttribute, measureFactory } from '@sisense/sdk-data';

import {
  MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
} from '../../__mocks__/mock-data-sources.js';
import { getSuccessData } from '../shared/utils/translation-helpers.js';
import type { ChartJSON } from '../types.js';
import { translateChartFromJSON } from './translate-chart-from-json.js';
import { translateChartToJSON } from './translate-chart-to-json.js';

describe('translateChartToJSON', () => {
  it('should round-trip category with StyledColumn (dateFormat)', () => {
    const chartJSON = {
      chartType: 'line',
      dataOptions: {
        category: [{ column: 'DM.Commerce.Date.Months', dateFormat: 'yy-MM' }],
        value: [
          {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Revenue', 'Revenue'],
          },
        ],
        breakBy: [],
      },
    };

    const fromResult = translateChartFromJSON({
      data: chartJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(fromResult.success).toBe(true);
    const chartProps = getSuccessData(fromResult);

    const toResult = translateChartToJSON(chartProps);
    expect(toResult.success).toBe(true);

    const reverseJSON = getSuccessData(toResult);
    expect(reverseJSON.dataOptions).toBeDefined();
    const category = (reverseJSON.dataOptions as { category?: unknown[] }).category;
    expect(category).toHaveLength(1);
    expect(category![0]).toHaveProperty('column', 'DM.Commerce.Date.Months');
    expect(category![0]).toHaveProperty('dateFormat', 'yy-MM');
  });

  it('should round-trip breakBy with StyledColumn (sortType)', () => {
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

    const fromResult = translateChartFromJSON({
      data: chartJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(fromResult.success).toBe(true);
    const chartProps = getSuccessData(fromResult);

    const toResult = translateChartToJSON(chartProps);
    expect(toResult.success).toBe(true);

    const reverseJSON = getSuccessData(toResult);
    expect(reverseJSON.dataOptions).toBeDefined();
    const breakBy = (reverseJSON.dataOptions as { breakBy?: unknown[] }).breakBy;
    expect(breakBy).toHaveLength(1);
    expect(breakBy![0]).toHaveProperty('column', 'DM.Commerce.Gender');
    expect(breakBy![0]).toHaveProperty('sortType', 'sortAsc');
  });

  it('should attribute axis item errors to the outer dataOptions index', () => {
    const Revenue = createAttribute({
      name: 'Revenue',
      type: 'numeric-attribute',
      expression: '[Commerce.Revenue]',
      dataSource: { title: 'Sample ECommerce', live: false },
    });
    const validMeasure = measureFactory.sum(Revenue, 'Total Revenue');
    const invalidMeasure = { ...measureFactory.sum(Revenue, 'Bad'), composeCode: undefined };

    const result = translateChartToJSON({
      chartType: 'column',
      dataOptions: {
        value: [validMeasure, invalidMeasure],
      },
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.errors[0].path).toBe('dataOptions.value[1]');
  });

  it('should round-trip boxplot with boxType and outliersEnabled passed through', () => {
    const chartJSON = {
      chartType: 'boxplot',
      dataOptions: {
        category: ['DM.Category.Category'],
        value: ['DM.Commerce.Cost'],
      },
      styleOptions: { subtype: 'boxplot/iqr' },
    } as unknown as ChartJSON;

    const fromResult = translateChartFromJSON({
      data: chartJSON,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(fromResult.success).toBe(true);
    const chartProps = getSuccessData(fromResult);

    const toResult = translateChartToJSON(chartProps);
    expect(toResult.success).toBe(true);

    const reverseJSON = getSuccessData(toResult);
    const dataOptions = reverseJSON.dataOptions as {
      category?: unknown[];
      value?: unknown[];
      boxType?: string;
      outliersEnabled?: boolean;
    };
    expect(dataOptions.boxType).toBe('iqr');
    expect(dataOptions.outliersEnabled).toBe(true);
  });
});
