import type { WidgetJSON } from '@/modules/analytics-composer/index-node.js';

import {
  SAMPLE_ECOMMERCE_COLUMN_CHART,
  SAMPLE_ECOMMERCE_LINE_CHART,
  SAMPLE_ECOMMERCE_PIE_CHART,
  SAMPLE_ECOMMERCE_TABLE_CHART,
} from './example-charts.js';
import {
  SAMPLE_ECOMMERCE_PIVOT_TABLE,
  SAMPLE_ECOMMERCE_PIVOT_TABLE_STYLED,
} from './example-pivot-tables.js';

/** Title-only data source reference used in NLQ widget/dashboard JSON examples. */
export const SAMPLE_ECOMMERCE_DATA_SOURCE_TITLE = 'Sample ECommerce';

/** Shared widget header config for NLQ JSON envelope examples. */
export const SAMPLE_WIDGET_CONFIG = {
  actions: { downloadCsv: { enabled: true } },
} as const;

/**
 * Column chart widget — revenue by month with gender breakdown
 */
export const SAMPLE_ECOMMERCE_COLUMN_CHART_WIDGET: Extract<WidgetJSON, { widgetType: 'chart' }> = {
  ...SAMPLE_ECOMMERCE_COLUMN_CHART,
  widgetType: 'chart',
  id: 'widget-column-chart',
  title: 'Revenue by Month',
  description: 'Monthly revenue breakdown by gender',
  dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE_TITLE,
  config: SAMPLE_WIDGET_CONFIG,
  highlightSelectionDisabled: true,
};

/**
 * Line chart widget — revenue trend with forecast
 */
export const SAMPLE_ECOMMERCE_LINE_CHART_WIDGET: Extract<WidgetJSON, { widgetType: 'chart' }> = {
  ...SAMPLE_ECOMMERCE_LINE_CHART,
  widgetType: 'chart',
  id: 'widget-line-chart',
  title: 'Revenue Trend',
  description: 'Monthly revenue with advanced smoothing and 6-month forecast',
  dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE_TITLE,
  config: SAMPLE_WIDGET_CONFIG,
};

/**
 * Pie chart widget — revenue by category
 */
export const SAMPLE_ECOMMERCE_PIE_CHART_WIDGET: Extract<WidgetJSON, { widgetType: 'chart' }> = {
  ...SAMPLE_ECOMMERCE_PIE_CHART,
  widgetType: 'chart',
  id: 'widget-pie-chart',
  title: 'Revenue by Category',
  dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE_TITLE,
};

/**
 * Pivot table widget — revenue by category and gender
 */
export const SAMPLE_ECOMMERCE_PIVOT_TABLE_WIDGET: Extract<WidgetJSON, { widgetType: 'pivot' }> = {
  ...SAMPLE_ECOMMERCE_PIVOT_TABLE,
  widgetType: 'pivot',
  id: 'widget-pivot',
  title: 'Revenue by Category × Gender',
  description: 'Pivot table with grand totals',
  dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE_TITLE,
  config: SAMPLE_WIDGET_CONFIG,
};

/**
 * Styled pivot table widget — revenue by year and gender with currency formatting
 */
export const SAMPLE_ECOMMERCE_PIVOT_TABLE_WIDGET_STYLED: Extract<
  WidgetJSON,
  { widgetType: 'pivot' }
> = {
  ...SAMPLE_ECOMMERCE_PIVOT_TABLE_STYLED,
  widgetType: 'pivot',
  id: 'widget-pivot-styled',
  title: 'Revenue by Year (Currency)',
  description: 'Pivot table with styled columns and currency formatting',
  dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE_TITLE,
  config: SAMPLE_WIDGET_CONFIG,
};

/**
 * Table chart widget — category, age range, and revenue columns
 */
export const SAMPLE_ECOMMERCE_TABLE_CHART_WIDGET: Extract<WidgetJSON, { widgetType: 'chart' }> = {
  ...SAMPLE_ECOMMERCE_TABLE_CHART,
  widgetType: 'chart',
  id: 'widget-table-chart',
  title: 'Revenue by Category & Age Range',
  description: 'Table showing category, age range, and total revenue',
  dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE_TITLE,
  config: SAMPLE_WIDGET_CONFIG,
};

/**
 * Text widget — demonstrates `config` on text widget JSON (no dataSource).
 */
export const SAMPLE_ECOMMERCE_TEXT_WIDGET: Extract<WidgetJSON, { widgetType: 'text' }> = {
  widgetType: 'text',
  id: 'widget-text',
  styleOptions: {
    vAlign: 'valign-top',
    bgColor: '#ffffff',
    html: '<p><strong>ECommerce</strong> dashboard notes</p>',
  },
  config: SAMPLE_WIDGET_CONFIG,
};

export const CERTIFIED_DATA_MODEL_FOR_AI_TOP_10_ACCOUNTS_BY_DEPLOYMENTS_COUNT_BAR_CHART_WIDGET: Extract<
  WidgetJSON,
  { widgetType: 'chart' }
> = {
  widgetType: 'chart',
  id: 'widget-top-10-accounts-by-deployments-count-bar-chart',
  chartType: 'bar',
  dataOptions: {
    category: ['DM.DIM_ACCOUNT.NAME'],
    value: [
      {
        function: 'measureFactory.customFormula',
        args: [
          'Deployments Count',
          '([91A9B-091], [2D7F3-473], [CCF31-AFC],[F8179-9D0])',
          {
            '[91A9B-091]': {
              function: 'measureFactory.countDistinct',
              args: [
                'DM.FACT_CURRENT_DEPLOYMENTS_WITH_CLONES.UNIQUE_DEPLOYMENT_MACHINE_ID',
                '# of unique UNIQUE_DEPLOYMENT_MACHINE_ID (with clones)',
              ],
            },
            '[2D7F3-473]': {
              function: 'filterFactory.members',
              args: ['DM.DIM_ACCOUNT.ACTIVE_CUSTOMER', ['true']],
            },
            '[CCF31-AFC]': {
              function: 'filterFactory.members',
              args: ['DM.DIM_LICENSE.ACTIVE_LICENSE', ['true']],
            },
            '[F8179-9D0]': {
              function: 'filterFactory.members',
              args: ['DM.DIM_DEPLOYMENT.IS_ACTIVE_LAST_30D', ['Yes']],
            },
          },
        ],
      },
    ],
    breakBy: [],
  },
  styleOptions: {
    subtype: 'bar/stacked',
    yAxis: {
      title: {
        enabled: true,
        text: 'Deployments Count',
      },
    },
    xAxis: {
      title: {
        enabled: true,
        text: 'NAME',
      },
    },
  },
  filters: [
    {
      function: 'filterFactory.topRanking',
      args: [
        'DM.DIM_ACCOUNT.ACCOUNT_ID',
        {
          function: 'measureFactory.customFormula',
          args: [
            'Deployments Count',
            '([91A9B-091], [2D7F3-473], [CCF31-AFC],[F8179-9D0])',
            {
              '[91A9B-091]': {
                function: 'measureFactory.countDistinct',
                args: [
                  'DM.FACT_CURRENT_DEPLOYMENTS_WITH_CLONES.UNIQUE_DEPLOYMENT_MACHINE_ID',
                  '# of unique UNIQUE_DEPLOYMENT_MACHINE_ID (with clones)',
                ],
              },
              '[2D7F3-473]': {
                function: 'filterFactory.members',
                args: ['DM.DIM_ACCOUNT.ACTIVE_CUSTOMER', ['true']],
              },
              '[CCF31-AFC]': {
                function: 'filterFactory.members',
                args: ['DM.DIM_LICENSE.ACTIVE_LICENSE', ['true']],
              },
              '[F8179-9D0]': {
                function: 'filterFactory.members',
                args: ['DM.DIM_DEPLOYMENT.IS_ACTIVE_LAST_30D', ['Yes']],
              },
            },
          ],
        },
        10,
      ],
    },
  ],
  title: 'Top 10 accounts by deployments',
};
