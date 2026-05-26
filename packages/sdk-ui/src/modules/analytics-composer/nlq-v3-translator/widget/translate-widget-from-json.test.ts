import {
  MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
} from '../../__mocks__/mock-data-sources.js';
import { getErrors, getSuccessData } from '../shared/utils/translation-helpers.js';
import type { WidgetJSON } from '../types.js';
import { translateWidgetFromJSON } from './translate-widget-from-json.js';

const context = {
  dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
};

describe('translateWidgetFromJSON — missing or invalid widgetType', () => {
  it('returns error when widgetType is missing', () => {
    const result = translateWidgetFromJSON({
      data: {
        id: 'w-1',
        chartType: 'column',
        dataOptions: { category: [], value: [], breakBy: [] },
      } as unknown as WidgetJSON,
      context,
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors[0].path).toBe('widgetType');
    expect(getErrors(result)[0]).toMatch(/widgetType is required/i);
  });

  it('returns error for unknown widgetType', () => {
    const result = translateWidgetFromJSON({
      data: {
        widgetType: 'unknown',
        id: 'w-x',
      } as unknown as WidgetJSON,
      context,
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors[0].path).toBe('widgetType');
    expect(getErrors(result)[0]).toMatch(/Invalid widgetType/);
  });
});

describe('translateWidgetFromJSON — missing id', () => {
  it('returns error when chart widget has no id', () => {
    const result = translateWidgetFromJSON({
      data: {
        widgetType: 'chart',
        chartType: 'column',
        dataOptions: { category: [], value: [], breakBy: [] },
      } as unknown as WidgetJSON,
      context,
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors[0].path).toBe('id');
    expect(getErrors(result)[0]).toMatch(/id is required/i);
  });
});

describe('translateWidgetFromJSON — chart', () => {
  const chartWidgetJSON: Extract<WidgetJSON, { widgetType: 'chart' }> = {
    widgetType: 'chart',
    id: 'w-1',
    title: 'Revenue by Month',
    description: 'Monthly chart',
    chartType: 'column',
    dataOptions: {
      category: ['DM.Commerce.Date.Years'],
      value: [{ function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] }],
      breakBy: [],
    },
  };

  it('returns widgetType chart and preserves title/description', () => {
    const result = translateWidgetFromJSON({ data: chartWidgetJSON, context });
    expect(result.success).toBe(true);
    const data = getSuccessData(result);
    expect(data.widgetType).toBe('chart');
    expect((data as { title?: string }).title).toBe('Revenue by Month');
    expect((data as { description?: string }).description).toBe('Monthly chart');
  });

  it('maps dataSet to dataSource and omits dataSet', () => {
    const result = translateWidgetFromJSON({ data: chartWidgetJSON, context });
    const data = getSuccessData(result);
    expect(data).toMatchObject({
      widgetType: 'chart',
      dataSource: expect.objectContaining({ title: 'Sample ECommerce', type: 'elasticube' }),
    });
    expect(data).not.toHaveProperty('dataSet');
  });

  it('uses dataSource from JSON when set', () => {
    const result = translateWidgetFromJSON({
      data: { ...chartWidgetJSON, dataSource: 'Other Cube' },
      context,
    });
    const data = getSuccessData(result);
    expect((data as { dataSource?: string }).dataSource).toBe('Other Cube');
  });

  it('maps config and highlightSelectionDisabled from JSON', () => {
    const result = translateWidgetFromJSON({
      data: {
        ...chartWidgetJSON,
        config: { actions: { downloadCsv: { enabled: true } } },
        highlightSelectionDisabled: true,
      },
      context,
    });
    const data = getSuccessData(result);
    expect((data as { config?: unknown }).config).toEqual({
      actions: { downloadCsv: { enabled: true } },
    });
    expect((data as { highlightSelectionDisabled?: boolean }).highlightSelectionDisabled).toBe(
      true,
    );
  });

  it('translates chart dataOptions correctly', () => {
    const result = translateWidgetFromJSON({ data: chartWidgetJSON, context });
    const data = getSuccessData(result);
    expect((data as { chartType?: string }).chartType).toBe('column');
    const dataOptions = (data as { dataOptions?: { category?: unknown[] } }).dataOptions;
    expect(dataOptions?.category).toHaveLength(1);
  });

  it('translates chart filters', () => {
    const withFilter: Extract<WidgetJSON, { widgetType: 'chart' }> = {
      ...chartWidgetJSON,
      filters: [
        {
          function: 'filterFactory.members',
          args: ['DM.Commerce.Date.Years', ['2013-01-01T00:00:00']],
        },
      ],
    };
    const result = translateWidgetFromJSON({ data: withFilter, context });
    expect(result.success).toBe(true);
    const data = getSuccessData(result);
    expect((data as { filters?: unknown[] }).filters).toHaveLength(1);
  });

  it('returns error for invalid chartType', () => {
    const invalid: Extract<WidgetJSON, { widgetType: 'chart' }> = {
      ...chartWidgetJSON,
      chartType: 'not-a-chart-type',
    };
    const result = translateWidgetFromJSON({ data: invalid, context });
    expect(result.success).toBe(false);
    expect(getErrors(result).length).toBeGreaterThan(0);
  });
});

describe('translateWidgetFromJSON — pivot', () => {
  const pivotTableWidgetJSON: Extract<WidgetJSON, { widgetType: 'pivot' }> = {
    widgetType: 'pivot',
    id: 'w-2',
    title: 'Revenue by Category',
    dataOptions: {
      rows: ['DM.Category.Category'],
      columns: ['DM.Commerce.Gender'],
      values: [{ function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] }],
    },
  };

  it('returns widgetType pivot and preserves title', () => {
    const result = translateWidgetFromJSON({ data: pivotTableWidgetJSON, context });
    expect(result.success).toBe(true);
    const data = getSuccessData(result);
    expect(data.widgetType).toBe('pivot');
    expect((data as { title?: string }).title).toBe('Revenue by Category');
  });

  it('maps dataSet to dataSource and omits dataSet', () => {
    const result = translateWidgetFromJSON({ data: pivotTableWidgetJSON, context });
    const data = getSuccessData(result);
    expect(data).toMatchObject({
      widgetType: 'pivot',
      dataSource: expect.objectContaining({ title: 'Sample ECommerce', type: 'elasticube' }),
    });
    expect(data).not.toHaveProperty('dataSet');
  });

  it('translates pivot dataOptions correctly', () => {
    const result = translateWidgetFromJSON({ data: pivotTableWidgetJSON, context });
    const data = getSuccessData(result);
    const dataOptions = (data as { dataOptions?: { rows?: unknown[]; values?: unknown[] } })
      .dataOptions;
    expect(dataOptions?.rows).toHaveLength(1);
    expect(dataOptions?.values).toHaveLength(1);
  });
});

describe('translateWidgetFromJSON — text', () => {
  const textWidgetJSON: Extract<WidgetJSON, { widgetType: 'text' }> = {
    widgetType: 'text',
    id: 'w-3',
    styleOptions: {
      vAlign: 'valign-top',
      bgColor: '#ffffff',
      html: '<p>Hello world</p>',
    },
  };

  it('passes styleOptions through without data translation', () => {
    const result = translateWidgetFromJSON({ data: textWidgetJSON, context });
    expect(result.success).toBe(true);
    const data = getSuccessData(result);
    expect(data.widgetType).toBe('text');
    expect((data as { styleOptions?: { html?: string } }).styleOptions?.html).toBe(
      '<p>Hello world</p>',
    );
  });
});

describe('translateWidgetFromJSON — custom', () => {
  it('passes dataOptions through and translates filters', () => {
    const result = translateWidgetFromJSON({
      data: {
        widgetType: 'custom',
        id: 'w-4',
        customWidgetType: 'my-plugin',
        title: 'Custom Widget',
        dataOptions: { myAxis: [{ name: 'Revenue' }] },
        filters: [
          {
            function: 'filterFactory.members',
            args: ['DM.Commerce.Date.Years', ['2013-01-01T00:00:00']],
          },
        ],
      },
      context,
    });
    expect(result.success).toBe(true);
    const data = getSuccessData(result);
    expect(data.widgetType).toBe('custom');
    expect((data as { customWidgetType?: string }).customWidgetType).toBe('my-plugin');
    expect((data as { filters?: unknown[] }).filters).toHaveLength(1);
  });
});
