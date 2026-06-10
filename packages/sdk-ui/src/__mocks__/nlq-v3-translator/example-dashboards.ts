import type { DashboardJSON } from '@/modules/analytics-composer/index-node.js';

import { SAMPLE_ECOMMERCE_DATA_SOURCE_TITLE, SAMPLE_WIDGET_CONFIG } from './example-widgets.js';

/**
 * ECommerce overview dashboard — column chart + pivot table with a year filter.
 */
export const SAMPLE_ECOMMERCE_DASHBOARD_OVERVIEW: DashboardJSON = {
  id: 'dashboard-overview',
  title: 'ECommerce Overview',
  defaultDataSource: SAMPLE_ECOMMERCE_DATA_SOURCE_TITLE,
  layoutOptions: {
    widgetsPanel: {
      columns: [
        {
          widthPercentage: 100,
          rows: [
            {
              cells: [
                { widgetId: 'widget-col-chart', widthPercentage: 50 },
                { widgetId: 'widget-pivot', widthPercentage: 50 },
              ],
            },
          ],
        },
      ],
    },
  },
  config: {
    toolbar: { visible: true },
    filtersPanel: { visible: true, collapsedInitially: false },
  },
  styleOptions: {
    backgroundColor: '#f8f9fa',
    dividerLineWidth: 1,
    dividerLineColor: '#e0e0e0',
  },
  widgetsOptions: {
    'widget-col-chart': {
      filtersOptions: { applyMode: 'filter', shouldAffectFilters: true },
    },
    'widget-pivot': {
      filtersOptions: { applyMode: 'highlight', shouldAffectFilters: false },
    },
  },
  filters: [
    {
      function: 'filterFactory.members',
      args: ['DM.Commerce.Date.Years', ['2013-01-01T00:00:00']],
    },
  ],
  widgets: [
    {
      widgetType: 'chart',
      id: 'widget-col-chart',
      title: 'Revenue by Month',
      description: 'Monthly revenue breakdown by gender',
      dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE_TITLE,
      config: SAMPLE_WIDGET_CONFIG,
      highlightSelectionDisabled: true,
      chartType: 'column',
      dataOptions: {
        category: ['DM.Commerce.Date.Months'],
        value: [
          {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Revenue', 'Total Revenue'],
          },
        ],
        breakBy: ['DM.Commerce.Gender'],
      },
      styleOptions: {
        legend: { enabled: true, position: 'bottom' },
      },
    },
    {
      widgetType: 'pivot',
      id: 'widget-pivot',
      title: 'Revenue by Category × Gender',
      description: 'Pivot table with grand totals',
      dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE_TITLE,
      config: SAMPLE_WIDGET_CONFIG,
      dataOptions: {
        rows: ['DM.Category.Category'],
        columns: ['DM.Commerce.Gender'],
        values: [
          {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Revenue', 'Total Revenue'],
          },
        ],
        grandTotals: { rows: true, columns: true },
      },
      styleOptions: {
        alternatingRowsColor: true,
        alternatingColumnsColor: false,
      },
    },
  ],
};

/**
 * Multi-chart dashboard — line chart + bar chart + indicator, no dashboard-level filter.
 */
export const SAMPLE_ECOMMERCE_DASHBOARD_MULTI_CHART: DashboardJSON = {
  id: 'dashboard-multi-chart',
  title: 'Sales Overview',
  defaultDataSource: SAMPLE_ECOMMERCE_DATA_SOURCE_TITLE,
  config: {
    toolbar: { visible: true },
  },
  styleOptions: {
    backgroundColor: '#ffffff',
    dividerLineWidth: 2,
  },
  layoutOptions: {
    widgetsPanel: {
      columns: [
        {
          widthPercentage: 100,
          rows: [
            {
              cells: [
                { widgetId: 'widget-line', widthPercentage: 100 },
                { widgetId: 'widget-bar', widthPercentage: 100 },
                { widgetId: 'widget-indicator', widthPercentage: 100 },
              ],
            },
          ],
        },
      ],
    },
  },
  widgetsOptions: {
    'widget-line': {
      filtersOptions: { applyMode: 'filter' },
    },
  },
  widgets: [
    {
      widgetType: 'chart',
      id: 'widget-line',
      title: 'Revenue Trend',
      dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE_TITLE,
      chartType: 'line',
      dataOptions: {
        category: [{ column: 'DM.Commerce.Date.Months', dateFormat: 'yy-MM' }],
        value: [
          {
            column: {
              function: 'measureFactory.sum',
              args: ['DM.Commerce.Revenue', 'Revenue'],
            },
            trend: { modelType: 'advancedSmoothing' },
            forecast: { modelType: 'auto', forecastHorizon: 6 },
          },
        ],
        breakBy: [],
      },
    },
    {
      widgetType: 'chart',
      id: 'widget-bar',
      title: 'Revenue by Category',
      dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE_TITLE,
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
    },
    {
      widgetType: 'chart',
      id: 'widget-indicator',
      title: 'Total Revenue',
      dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE_TITLE,
      chartType: 'indicator',
      dataOptions: {
        value: [
          {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Revenue', 'Total Revenue'],
          },
        ],
        secondary: [],
        min: [],
        max: [],
      },
    },
  ],
};
