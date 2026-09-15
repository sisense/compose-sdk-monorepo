import { type JaqlDataSourceForDto } from '@sisense/sdk-data';

import {
  MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
} from '../../__mocks__/mock-data-sources.js';
import type { NormalizedTable } from '../../types.js';
import {
  asFilterRelations,
  getErrors,
  getSuccessData,
} from '../shared/utils/translation-helpers.js';
import type { DashboardJSON } from '../types.js';
import { translateDashboardFromJSON } from './translate-dashboard-from-json.js';

const ecommerceContext = {
  dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
};

const context = [ecommerceContext];

const MOCK_DATA_SOURCE_SAMPLE_RETAIL: JaqlDataSourceForDto = {
  title: 'Sample Retail',
  address: 'LocalHost',
  id: 'localhost_aSampleIAAaRetail',
  live: false,
};

const MOCK_NORMALIZED_TABLES_SAMPLE_RETAIL: NormalizedTable[] = [
  {
    name: 'Store',
    columns: [
      {
        name: 'Region',
        dataType: 'text',
        expression: '[Store.Region]',
        description: 'Store.Region',
      },
      {
        name: 'Sales',
        dataType: 'numeric',
        expression: '[Store.Sales]',
        description: 'Store.Sales',
      },
    ],
  },
];

const retailContext = {
  dataSource: MOCK_DATA_SOURCE_SAMPLE_RETAIL,
  tables: MOCK_NORMALIZED_TABLES_SAMPLE_RETAIL,
};

const simpleDashboardJSON: DashboardJSON = {
  id: 'dash-1',
  title: 'Test Dashboard',
  widgets: [
    {
      widgetType: 'chart',
      id: 'w-1',
      title: 'Revenue by Year',
      chartType: 'column',
      dataOptions: {
        category: ['DM.Commerce.Date.Years'],
        value: [{ function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] }],
        breakBy: [],
      },
    },
    {
      widgetType: 'pivot',
      id: 'w-2',
      title: 'Revenue by Category',
      dataOptions: {
        rows: ['DM.Category.Category'],
        columns: ['DM.Commerce.Gender'],
        values: [
          { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
        ],
      },
    },
  ],
};

describe('translateDashboardFromJSON', () => {
  it('translates a dashboard with chart + pivot widgets', () => {
    const result = translateDashboardFromJSON({ data: simpleDashboardJSON, context });
    expect(result.success).toBe(true);
    const dashboard = getSuccessData(result);
    expect(dashboard.widgets).toHaveLength(2);
    expect(dashboard.title).toBe('Test Dashboard');
    expect(dashboard.id).toBe('dash-1');
  });

  it('promotes widget id from JSON', () => {
    const result = translateDashboardFromJSON({ data: simpleDashboardJSON, context });
    const dashboard = getSuccessData(result);
    expect(dashboard.widgets[0].id).toBe('w-1');
    expect(dashboard.widgets[1].id).toBe('w-2');
  });

  it('allows dashboard without id', () => {
    const noIdDashboard: DashboardJSON = {
      ...simpleDashboardJSON,
      id: undefined,
    };
    const result = translateDashboardFromJSON({ data: noIdDashboard, context });
    expect(result.success).toBe(true);
    expect(getSuccessData(result).id).toBeUndefined();
  });

  it('fails when a widget has no id', () => {
    const noIdDashboard = {
      ...simpleDashboardJSON,
      widgets: [{ ...simpleDashboardJSON.widgets[0], id: undefined }],
    } as unknown as DashboardJSON;
    const result = translateDashboardFromJSON({ data: noIdDashboard, context });
    expect(result.success).toBe(false);
    expect(getErrors(result)[0]).toMatch(/id is required/i);
  });

  it('maps layoutOptions, config, defaultDataSource, styleOptions, and widgetsOptions', () => {
    const withExtras: DashboardJSON = {
      ...simpleDashboardJSON,
      layoutOptions: {
        widgetsPanel: {
          columns: [
            {
              widthPercentage: 100,
              rows: [{ cells: [{ widgetId: 'w-1', widthPercentage: 100 }] }],
            },
          ],
        },
      },
      config: { toolbar: { visible: true } },
      defaultDataSource: 'Sample ECommerce',
      styleOptions: { dividerLineWidth: 2 },
      widgetsOptions: {
        'w-1': { filtersOptions: { applyMode: 'highlight' } },
      },
    };
    const result = translateDashboardFromJSON({ data: withExtras, context });
    const dashboard = getSuccessData(result);
    expect(dashboard.layoutOptions).toEqual(withExtras.layoutOptions);
    expect(dashboard.config).toEqual(withExtras.config);
    expect(dashboard.defaultDataSource).toBe('Sample ECommerce');
    expect(dashboard.styleOptions).toEqual(withExtras.styleOptions);
    expect(dashboard.widgetsOptions).toEqual(withExtras.widgetsOptions);
  });

  it('translates dashboard-level filters', () => {
    const withFilters: DashboardJSON = {
      ...simpleDashboardJSON,
      filters: [
        {
          function: 'filterFactory.members',
          args: ['DM.Commerce.Date.Years', ['2013-01-01T00:00:00']],
        },
      ],
    };
    const result = translateDashboardFromJSON({ data: withFilters, context });
    expect(result.success).toBe(true);
    const dashboard = getSuccessData(result);
    expect(dashboard.filters).toBeDefined();
    expect(Array.isArray(dashboard.filters) ? dashboard.filters : []).toHaveLength(1);
  });

  it('preserves both relation trees when two consecutive filter tiles are FilterRelations', () => {
    const withTwoRelationTiles: DashboardJSON = {
      ...simpleDashboardJSON,
      filters: [
        {
          function: 'filterFactory.logic.or',
          args: [
            { function: 'filterFactory.members', args: ['DM.Commerce.Condition', ['New']] },
            { function: 'filterFactory.members', args: ['DM.Country.Country', ['United States']] },
          ],
        },
        {
          function: 'filterFactory.logic.or',
          args: [
            { function: 'filterFactory.members', args: ['DM.Brand.Brand', ['Brand A']] },
            {
              function: 'filterFactory.members',
              args: ['DM.Commerce.Date.Years', ['2013-01-01T00:00:00']],
            },
          ],
        },
      ],
    };
    const result = translateDashboardFromJSON({ data: withTwoRelationTiles, context });
    expect(result.success).toBe(true);
    const relations = asFilterRelations(getSuccessData(result).filters);
    expect(relations.operator).toBe('AND');
    expect(asFilterRelations(relations.left).operator).toBe('OR');
    expect(asFilterRelations(relations.right).operator).toBe('OR');
  });

  it('preserves a relation tree from an earlier tile when a later tile is a plain filter', () => {
    const relationThenPlain: DashboardJSON = {
      ...simpleDashboardJSON,
      filters: [
        {
          function: 'filterFactory.logic.or',
          args: [
            { function: 'filterFactory.members', args: ['DM.Commerce.Condition', ['New']] },
            { function: 'filterFactory.members', args: ['DM.Country.Country', ['United States']] },
          ],
        },
        {
          function: 'filterFactory.members',
          args: ['DM.Commerce.Date.Years', ['2013-01-01T00:00:00']],
        },
      ],
    };
    const result = translateDashboardFromJSON({ data: relationThenPlain, context });
    expect(result.success).toBe(true);
    const relations = asFilterRelations(getSuccessData(result).filters);
    expect(asFilterRelations(relations.left).operator).toBe('OR');
  });

  it('fails when widgets is not an array', () => {
    const malformedDashboard = {
      ...simpleDashboardJSON,
      widgets: { widgetType: 'chart', id: 'w-1' },
    };
    const result = translateDashboardFromJSON({
      data: malformedDashboard as unknown as DashboardJSON,
      context,
    });
    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].path).toBe('widgets');
    expect(result.errors[0].message).toMatch(/Expected widgets to be an array/i);
  });

  it('fails if a widget translation fails', () => {
    const badDashboard: DashboardJSON = {
      ...simpleDashboardJSON,
      widgets: [
        {
          widgetType: 'chart',
          id: 'bad',
          chartType: 'not-a-valid-chart-type',
          dataOptions: { category: [], value: [], breakBy: [] },
        },
      ],
    };
    const result = translateDashboardFromJSON({ data: badDashboard, context });
    expect(result.success).toBe(false);
    expect(getErrors(result).length).toBeGreaterThan(0);
  });

  it('correctly sets widgetType on translated widgets', () => {
    const result = translateDashboardFromJSON({ data: simpleDashboardJSON, context });
    const dashboard = getSuccessData(result);
    expect(dashboard.widgets[0].widgetType).toBe('chart');
    expect(dashboard.widgets[1].widgetType).toBe('pivot');
  });

  it('includes widget path when a widget dataOptions item is invalid', () => {
    const dashboardWithTypo: DashboardJSON = {
      id: 'dashboard-overview',
      title: 'ECommerce Overview',
      widgets: [
        {
          widgetType: 'chart',
          id: 'widget-col-chart',
          title: 'Revenue by Month',
          chartType: 'column',
          dataOptions: {
            category: ['DM.Commerce.Date.Monthss'],
            value: [
              { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
            ],
            breakBy: [],
          },
        },
        {
          widgetType: 'pivot',
          id: 'widget-pivot',
          title: 'Revenue by Category × Gender',
          dataOptions: {
            rows: ['DM.Category.Category'],
            columns: ['DM.Commerce.Gender'],
            values: [
              { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
            ],
          },
        },
      ],
    };

    const result = translateDashboardFromJSON({ data: dashboardWithTypo, context });
    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.errors).toHaveLength(1);
    const error = result.errors[0];
    expect(error.path).toBe('widgets[0].dataOptions.category[0]');
    expect(error.message).toMatch(/Invalid date level 'Monthss'/);
  });

  it('reports widgets[n].id path when widget id is missing', () => {
    const dashboardMissingWidgetId = {
      id: 'dashboard-overview',
      title: 'ECommerce Overview',
      widgets: [
        {
          widgetType: 'chart',
          title: 'Revenue by Month',
          chartType: 'column',
          dataOptions: {
            category: ['DM.Commerce.Date.Months'],
            value: [
              { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
            ],
            breakBy: [],
          },
        },
      ],
    } as unknown as DashboardJSON;

    const result = translateDashboardFromJSON({ data: dashboardMissingWidgetId, context });
    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.errors[0].path).toBe('widgets[0].id');
    expect(result.errors[0].message).toMatch(/id is required/i);
  });

  describe('multi-datasource dashboards', () => {
    const multiSourceDashboardJSON: DashboardJSON = {
      id: 'dash-multi',
      title: 'Multi-Source Dashboard',
      defaultDataSource: 'Sample ECommerce',
      filters: [
        {
          function: 'filterFactory.members',
          args: ['DM.Commerce.Date.Years', ['2013-01-01T00:00:00']],
        },
      ],
      widgets: [
        {
          widgetType: 'chart',
          id: 'w-ecommerce',
          title: 'Revenue by Year',
          dataSource: 'Sample ECommerce',
          chartType: 'column',
          dataOptions: {
            category: ['DM.Commerce.Date.Years'],
            value: [
              { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
            ],
            breakBy: [],
          },
        },
        {
          widgetType: 'pivot',
          id: 'w-retail',
          title: 'Sales by Region',
          dataSource: 'Sample Retail',
          dataOptions: {
            rows: ['DM.Store.Region'],
            values: [{ function: 'measureFactory.sum', args: ['DM.Store.Sales', 'Total Sales'] }],
          },
        },
      ],
    };

    it('resolves each widget against its own data source', () => {
      const result = translateDashboardFromJSON({
        data: multiSourceDashboardJSON,
        context: [ecommerceContext, retailContext],
      });
      expect(result.success).toBe(true);
      const dashboard = getSuccessData(result);
      expect(dashboard.widgets).toHaveLength(2);
      expect(dashboard.widgets[0].id).toBe('w-ecommerce');
      expect(dashboard.widgets[1].id).toBe('w-retail');
    });

    it('resolves dashboard-level filters against the defaultDataSource context', () => {
      const result = translateDashboardFromJSON({
        data: multiSourceDashboardJSON,
        context: [ecommerceContext, retailContext],
      });
      expect(result.success).toBe(true);
      const dashboard = getSuccessData(result);
      expect(dashboard.filters).toBeDefined();
      expect(Array.isArray(dashboard.filters) ? dashboard.filters : []).toHaveLength(1);
    });

    it('produces a clear error when a widget data source matches no supplied context', () => {
      const dashboardWithUnknownSource: DashboardJSON = {
        ...simpleDashboardJSON,
        widgets: [
          {
            widgetType: 'chart',
            id: 'w-1',
            title: 'Revenue by Year',
            dataSource: 'Unknown Source',
            chartType: 'column',
            dataOptions: {
              category: ['DM.Commerce.Date.Years'],
              value: [
                { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
              ],
              breakBy: [],
            },
          },
        ],
      };

      const result = translateDashboardFromJSON({
        data: dashboardWithUnknownSource,
        context: [ecommerceContext],
      });
      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].path).toBe('widgets[0]');
      expect(result.errors[0].message).toMatch(
        /No data schema context found for data source 'Unknown Source'/,
      );
    });

    it('produces a clear error when dashboard filters have no defaultDataSource and multiple contexts are ambiguous', () => {
      const result = translateDashboardFromJSON({
        data: { ...multiSourceDashboardJSON, defaultDataSource: undefined },
        context: [ecommerceContext, retailContext],
      });
      expect(result.success).toBe(false);
      if (result.success) return;

      const filterError = result.errors.find((error) => error.path === 'filters[0]');
      expect(filterError).toBeDefined();
      expect(filterError?.message).toMatch(/no unambiguous default context/i);
    });

    it('resolves a filter tile tagged with a non-default data source', () => {
      const dashboardWithTaggedFilter: DashboardJSON = {
        ...multiSourceDashboardJSON,
        filters: [
          ...multiSourceDashboardJSON.filters!,
          {
            dataSource: 'Sample Retail',
            filter: {
              function: 'filterFactory.members',
              args: ['DM.Store.Region', ['West']],
            },
          },
        ],
      };

      const result = translateDashboardFromJSON({
        data: dashboardWithTaggedFilter,
        context: [ecommerceContext, retailContext],
      });
      expect(result.success).toBe(true);
      const dashboard = getSuccessData(result);
      expect(dashboard.filters).toBeDefined();
      expect(Array.isArray(dashboard.filters) ? dashboard.filters : []).toHaveLength(2);
    });

    it('produces a clear error when a tagged filter data source matches no supplied context', () => {
      const dashboardWithBadTaggedFilter: DashboardJSON = {
        ...multiSourceDashboardJSON,
        filters: [
          {
            dataSource: 'Unknown Source',
            filter: {
              function: 'filterFactory.members',
              args: ['DM.Store.Region', ['West']],
            },
          },
        ],
      };

      const result = translateDashboardFromJSON({
        data: dashboardWithBadTaggedFilter,
        context: [ecommerceContext, retailContext],
      });
      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].path).toBe('filters[0]');
      expect(result.errors[0].message).toMatch(
        /No data schema context found for data source 'Unknown Source'/,
      );
    });

    it('produces a clear error instead of picking an arbitrary context when two contexts share a data source title', () => {
      const dashboardTargetingDuplicatedTitle: DashboardJSON = {
        ...simpleDashboardJSON,
        defaultDataSource: 'Sample ECommerce',
      };
      // Two distinct contexts that happen to share the same dataSource.title — must be treated
      // as ambiguous (never silently resolved to whichever one happens to be found first).
      const duplicateTitleContexts = [
        ecommerceContext,
        { ...ecommerceContext, tables: retailContext.tables },
      ];

      const result = translateDashboardFromJSON({
        data: dashboardTargetingDuplicatedTitle,
        context: duplicateTitleContexts,
      });
      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.errors.length).toBeGreaterThan(0);
      expect(
        result.errors.some((error) => error.message.includes("data source 'Sample ECommerce'")),
      ).toBe(true);
    });
  });
});
