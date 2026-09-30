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

const context = {
  dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
};

const REVENUE = { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] };
const COST = { function: 'measureFactory.sum', args: ['DM.Commerce.Cost', 'Total Cost'] };

/** JSON → props → JSON; returns the props and the regenerated JSON */
const roundTripFromJSON = (chartJSON: ChartJSON) => {
  const chartProps = getSuccessData(translateChartFromJSON({ data: chartJSON, context }));
  const reverseJSON = getSuccessData(translateChartToJSON(chartProps));
  return { chartProps, reverseJSON };
};

describe('translateChartToJSON — KPI', () => {
  const kpiCases: { name: string; dataOptions: ChartJSON['dataOptions'] }[] = [
    { name: 'value only', dataOptions: { value: REVENUE } },
    {
      name: "valueMode 'last'",
      dataOptions: { value: REVENUE, category: 'DM.Commerce.Date.Months', valueMode: 'last' },
    },
    {
      name: "valueMode 'total'",
      dataOptions: { value: REVENUE, category: 'DM.Commerce.Date.Months', valueMode: 'total' },
    },
    {
      name: "comparison 'previous-period'",
      dataOptions: {
        value: REVENUE,
        category: 'DM.Commerce.Date.Months',
        comparison: { type: 'previous-period' },
      },
    },
    {
      name: "comparison 'delta'",
      dataOptions: { value: REVENUE, comparison: { type: 'delta', value: COST } },
    },
    {
      name: "comparison 'delta' with a styled measure",
      dataOptions: {
        value: REVENUE,
        comparison: {
          type: 'delta',
          value: { column: COST, numberFormatConfig: { name: 'Currency', symbol: '$' } },
        },
      },
    },
    {
      name: "comparison 'value'",
      dataOptions: { value: REVENUE, comparison: { type: 'value', value: COST } },
    },
    {
      name: "comparison 'target' with a measure",
      dataOptions: { value: REVENUE, comparison: { type: 'target', target: COST } },
    },
    {
      name: "comparison 'target' with a number",
      dataOptions: { value: REVENUE, comparison: { type: 'target', target: 250000 } },
    },
    {
      name: 'valueMode and comparison combined',
      dataOptions: {
        value: REVENUE,
        category: 'DM.Commerce.Date.Months',
        valueMode: 'total',
        comparison: { type: 'target', target: COST },
      },
    },
  ];

  it.each(kpiCases)('round-trips JSON → props → JSON: $name', ({ dataOptions }) => {
    const { reverseJSON } = roundTripFromJSON({ chartType: 'kpi', dataOptions });

    expect(reverseJSON.chartType).toBe('kpi');
    expect(reverseJSON.dataOptions).toEqual(dataOptions);
  });

  it.each(kpiCases)('round-trips props → JSON → props: $name', ({ dataOptions }) => {
    const { chartProps, reverseJSON } = roundTripFromJSON({ chartType: 'kpi', dataOptions });

    const reverseProps = getSuccessData(translateChartFromJSON({ data: reverseJSON, context }));
    expect(reverseProps.dataOptions).toEqual(chartProps.dataOptions);
  });

  it('translates comparison baselines to measures and keeps a numeric target as is', () => {
    const measureTarget = roundTripFromJSON({
      chartType: 'kpi',
      dataOptions: { value: REVENUE, comparison: { type: 'target', target: COST } },
    }).chartProps.dataOptions as { comparison: { type: string; target: unknown } };
    expect(measureTarget.comparison.type).toBe('target');
    expect(measureTarget.comparison.target).toHaveProperty(
      'composeCode',
      "measureFactory.sum(DM.Commerce.Cost, 'Total Cost')",
    );

    const numericTarget = roundTripFromJSON({
      chartType: 'kpi',
      dataOptions: { value: REVENUE, comparison: { type: 'target', target: 250000 } },
    }).chartProps.dataOptions as { comparison: unknown };
    expect(numericTarget.comparison).toEqual({ type: 'target', target: 250000 });
  });

  it('reports a comparison measure missing composeCode at dataOptions.comparison.value', () => {
    const { chartProps } = roundTripFromJSON({
      chartType: 'kpi',
      dataOptions: { value: REVENUE, comparison: { type: 'delta', value: COST } },
    });
    const dataOptions = chartProps.dataOptions as {
      value: unknown;
      comparison: { type: 'delta'; value: object };
    };

    const result = translateChartToJSON({
      ...chartProps,
      dataOptions: {
        ...dataOptions,
        comparison: {
          type: 'delta',
          value: { ...dataOptions.comparison.value, composeCode: undefined },
        },
      },
    } as typeof chartProps);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].path).toBe('dataOptions.comparison.value');
  });

  it('rejects a comparison with an unknown type', () => {
    const { chartProps } = roundTripFromJSON({ chartType: 'kpi', dataOptions: { value: REVENUE } });

    const result = translateChartToJSON({
      ...chartProps,
      dataOptions: {
        ...chartProps.dataOptions,
        // @ts-expect-error -- deliberately invalid comparison type
        comparison: { type: 'forecast' },
      },
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors[0].path).toBe('dataOptions.comparison');
  });
});

describe('translateChartToJSON — Sankey', () => {
  const sankeyDataOptions: ChartJSON['dataOptions'] = {
    category: ['DM.Commerce.Gender', 'DM.Category.Category'],
    value: REVENUE,
  };

  it('round-trips JSON → props → JSON', () => {
    const { reverseJSON } = roundTripFromJSON({
      chartType: 'sankey',
      dataOptions: sankeyDataOptions,
    });

    expect(reverseJSON.chartType).toBe('sankey');
    expect(reverseJSON.dataOptions).toEqual(sankeyDataOptions);
  });

  it('round-trips props → JSON → props with seriesToColorMap', () => {
    const dataOptions = { ...sankeyDataOptions, seriesToColorMap: { Male: '#00cee6' } };
    const { chartProps, reverseJSON } = roundTripFromJSON({ chartType: 'sankey', dataOptions });

    expect(reverseJSON.dataOptions).toEqual(dataOptions);
    const reverseProps = getSuccessData(translateChartFromJSON({ data: reverseJSON, context }));
    expect(reverseProps.dataOptions).toEqual(chartProps.dataOptions);
  });
});
