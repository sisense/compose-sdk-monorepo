import {
  MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
} from '../../__mocks__/mock-data-sources.js';
import { getSuccessData } from '../shared/utils/translation-helpers.js';
import type { DashboardJSON, WidgetJSON } from '../types.js';
import { translateDashboardFromJSON } from './translate-dashboard-from-json.js';
import { translateDashboardToJSON } from './translate-dashboard-to-json.js';

const context = {
  dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
};

const dashboardJSON: DashboardJSON = {
  id: 'dash-1',
  title: 'ECommerce Overview',
  filters: [
    {
      function: 'filterFactory.members',
      args: ['DM.Commerce.Date.Years', ['2013-01-01T00:00:00']],
    },
  ],
  widgets: [
    {
      widgetType: 'chart',
      id: 'w-col',
      title: 'Revenue by Month',
      chartType: 'column',
      dataOptions: {
        category: ['DM.Commerce.Date.Years'],
        value: [{ function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] }],
        breakBy: ['DM.Commerce.Gender'],
      },
    },
    {
      widgetType: 'pivot',
      id: 'w-pivot',
      title: 'Revenue by Category',
      dataOptions: {
        rows: ['DM.Category.Category'],
        columns: ['DM.Commerce.Gender'],
        values: [
          { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
        ],
        grandTotals: { rows: true, columns: true },
      },
    },
  ],
};

describe('translateDashboardToJSON — round-trip', () => {
  it('preserves dashboard id, title, and widget count', () => {
    const fromResult = translateDashboardFromJSON({ data: dashboardJSON, context });
    expect(fromResult.success).toBe(true);
    const dashboardProps = getSuccessData(fromResult);

    const toResult = translateDashboardToJSON(dashboardProps);
    expect(toResult.success).toBe(true);
    const roundTripped = getSuccessData(toResult);

    expect(roundTripped.id).toBe('dash-1');
    expect(roundTripped.title).toBe('ECommerce Overview');
    expect(roundTripped.widgets).toHaveLength(2);
  });

  it('preserves widget ids, widgetTypes, and titles', () => {
    const dashboardProps = getSuccessData(
      translateDashboardFromJSON({ data: dashboardJSON, context }),
    );
    const roundTripped = getSuccessData(translateDashboardToJSON(dashboardProps));

    const col = roundTripped.widgets[0] as Extract<WidgetJSON, { widgetType: 'chart' }>;
    expect(col.widgetType).toBe('chart');
    expect(col.id).toBe('w-col');
    expect(col.title).toBe('Revenue by Month');
    expect(col.chartType).toBe('column');

    const pivot = roundTripped.widgets[1] as Extract<WidgetJSON, { widgetType: 'pivot' }>;
    expect(pivot.widgetType).toBe('pivot');
    expect(pivot.id).toBe('w-pivot');
    expect(pivot.title).toBe('Revenue by Category');
    expect(pivot.dataOptions.rows).toHaveLength(1);
  });

  it('round-trips dashboard-level filters', () => {
    const dashboardProps = getSuccessData(
      translateDashboardFromJSON({ data: dashboardJSON, context }),
    );
    const roundTripped = getSuccessData(translateDashboardToJSON(dashboardProps));
    expect(roundTripped.filters).toBeDefined();
    expect(roundTripped.filters).toHaveLength(1);
  });

  it('handles empty widgets array', () => {
    const result = translateDashboardToJSON({ id: 'empty-dash', widgets: [], title: 'Empty' });
    expect(result.success).toBe(true);
    const json = getSuccessData(result);
    expect(json.id).toBe('empty-dash');
    expect(json.widgets).toHaveLength(0);
    expect(json.title).toBe('Empty');
  });

  it('round-trips dashboard layout, config, defaultDataSource, styleOptions, and widgetsOptions', () => {
    const dashboardProps = getSuccessData(
      translateDashboardFromJSON({ data: dashboardJSON, context }),
    );
    const enriched = {
      ...dashboardProps,
      layoutOptions: {
        widgetsPanel: {
          columns: [
            {
              widthPercentage: 100,
              rows: [{ cells: [{ widgetId: 'w-col', widthPercentage: 100 }] }],
            },
          ],
        },
      },
      config: { toolbar: { visible: false } },
      defaultDataSource: {
        title: 'Sample ECommerce',
        type: 'elasticube' as const,
        id: 'ds-id',
      },
      styleOptions: { backgroundColor: '#eee' },
      widgetsOptions: {
        'w-col': {
          filtersOptions: { applyMode: 'filter' as const, shouldAffectFilters: false },
        },
      },
    };

    const roundTripped = getSuccessData(translateDashboardToJSON(enriched));

    expect(roundTripped.layoutOptions).toEqual(enriched.layoutOptions);
    expect(roundTripped.config).toEqual(enriched.config);
    expect(roundTripped.defaultDataSource).toBe('Sample ECommerce');
    expect(roundTripped.styleOptions).toEqual(enriched.styleOptions);
    expect(roundTripped.widgetsOptions).toEqual({
      'w-col': { filtersOptions: { applyMode: 'filter', shouldAffectFilters: false } },
    });
  });
});
