import type { WidgetProps } from '@/domains/widgets/components/widget/types.js';

import {
  MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
} from '../../__mocks__/mock-data-sources.js';
import { getErrors, getSuccessData } from '../shared/utils/translation-helpers.js';
import type { WidgetJSON } from '../types.js';
import { translateWidgetFromJSON } from './translate-widget-from-json.js';
import { translateWidgetToJSON } from './translate-widget-to-json.js';

const context = {
  dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
};

describe('translateWidgetToJSON — chart round-trip', () => {
  const chartWidgetJSON: Extract<WidgetJSON, { widgetType: 'chart' }> = {
    widgetType: 'chart',
    id: 'w-1',
    title: 'Revenue Widget',
    description: 'Test widget',
    chartType: 'column',
    dataOptions: {
      category: ['DM.Commerce.Date.Years'],
      value: [{ function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] }],
      breakBy: [],
    },
  };

  it('round-trips chart widget JSON', () => {
    const fromResult = translateWidgetFromJSON({ data: chartWidgetJSON, context });
    expect(fromResult.success).toBe(true);
    const csdk = getSuccessData(fromResult);

    const toResult = translateWidgetToJSON(csdk);
    expect(toResult.success).toBe(true);
    const json = getSuccessData(toResult) as Extract<WidgetJSON, { widgetType: 'chart' }>;

    expect(json.widgetType).toBe('chart');
    expect(json.id).toBe('w-1');
    expect(json.title).toBe('Revenue Widget');
    expect(json.chartType).toBe('column');
    expect(json.dataOptions.category).toHaveLength(1);
  });

  it('serializes dataSource as title string only', () => {
    const fromResult = translateWidgetFromJSON({ data: chartWidgetJSON, context });
    // Narrowed to the chart variant so `config` is typed as `ChartWidgetConfig`, which is the only
    // widget config carrying the download actions asserted below.
    const csdk = getSuccessData(fromResult) as Extract<WidgetProps, { widgetType: 'chart' }>;
    const withDataSource = {
      ...csdk,
      dataSource: {
        title: 'Sample ECommerce',
        type: 'elasticube' as const,
        id: 'ds-id',
        address: 'localhost',
      },
      config: { actions: { downloadCsv: { enabled: true } } },
      highlightSelectionDisabled: true,
    };

    const json = getSuccessData(translateWidgetToJSON(withDataSource)) as Extract<
      WidgetJSON,
      { widgetType: 'chart' }
    >;

    expect(json.dataSource).toBe('Sample ECommerce');
    expect(json.config).toEqual({ actions: { downloadCsv: { enabled: true } } });
    expect(json.highlightSelectionDisabled).toBe(true);
  });
});

describe('translateWidgetToJSON — pivot round-trip', () => {
  const pivotTableWidgetJSON: Extract<WidgetJSON, { widgetType: 'pivot' }> = {
    widgetType: 'pivot',
    id: 'w-2',
    title: 'Pivot Widget',
    dataOptions: {
      rows: ['DM.Category.Category'],
      columns: ['DM.Commerce.Gender'],
      values: [{ function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] }],
    },
  };

  it('round-trips pivot widget JSON', () => {
    const fromResult = translateWidgetFromJSON({ data: pivotTableWidgetJSON, context });
    expect(fromResult.success).toBe(true);
    const csdk = getSuccessData(fromResult);

    const toResult = translateWidgetToJSON(csdk);
    expect(toResult.success).toBe(true);
    const json = getSuccessData(toResult) as Extract<WidgetJSON, { widgetType: 'pivot' }>;

    expect(json.widgetType).toBe('pivot');
    expect(json.id).toBe('w-2');
    expect(json.title).toBe('Pivot Widget');
    expect(json.dataOptions.rows).toHaveLength(1);
  });
});

describe('translateWidgetToJSON — text pass-through', () => {
  it('returns text widget JSON with styleOptions', () => {
    const styleOptions = {
      vAlign: 'valign-top',
      bgColor: '#fff',
      html: '<p>hello</p>',
    } as const;
    const result = translateWidgetToJSON({
      widgetType: 'text',
      id: 'w-3',
      styleOptions,
    });
    expect(result.success).toBe(true);
    const json = getSuccessData(result);
    expect(json.widgetType).toBe('text');
    expect(json.id).toBe('w-3');
    expect(json.styleOptions).toEqual(styleOptions);
  });
});

describe('translateWidgetToJSON — unknown widgetType', () => {
  it('returns error for unknown widgetType', () => {
    const result = translateWidgetToJSON({ widgetType: 'unknown', id: 'w-x' } as never);
    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toMatch(/Unknown widgetType/);
  });
});
