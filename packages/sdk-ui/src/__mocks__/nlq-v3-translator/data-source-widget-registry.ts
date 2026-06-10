import type { WidgetInput } from '@/modules/analytics-composer/index-node.js';

import {
  CERTIFIED_DATA_MODEL_FOR_AI_DATA_SOURCE,
  CERTIFIED_DATA_MODEL_FOR_AI_TABLES,
  SAMPLE_ECOMMERCE_DATA_SOURCE,
  SAMPLE_ECOMMERCE_TABLES,
} from './data-schemas.js';
import {
  CERTIFIED_DATA_MODEL_FOR_AI_TOP_10_ACCOUNTS_BY_DEPLOYMENTS_COUNT_BAR_CHART_WIDGET,
  SAMPLE_ECOMMERCE_COLUMN_CHART_WIDGET,
  SAMPLE_ECOMMERCE_LINE_CHART_WIDGET,
  SAMPLE_ECOMMERCE_PIE_CHART_WIDGET,
  SAMPLE_ECOMMERCE_PIVOT_TABLE_WIDGET,
  SAMPLE_ECOMMERCE_PIVOT_TABLE_WIDGET_STYLED,
  SAMPLE_ECOMMERCE_TABLE_CHART_WIDGET,
  SAMPLE_ECOMMERCE_TEXT_WIDGET,
} from './example-widgets.js';

export const DATA_SOURCE_WIDGET_REGISTRY: Record<string, Record<string, WidgetInput>> = {
  'Sample ECommerce': {
    'Column Chart Widget': {
      data: SAMPLE_ECOMMERCE_COLUMN_CHART_WIDGET,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Line Chart Widget': {
      data: SAMPLE_ECOMMERCE_LINE_CHART_WIDGET,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Pie Chart Widget': {
      data: SAMPLE_ECOMMERCE_PIE_CHART_WIDGET,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Pivot Widget': {
      data: SAMPLE_ECOMMERCE_PIVOT_TABLE_WIDGET,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Pivot Widget (Styled)': {
      data: SAMPLE_ECOMMERCE_PIVOT_TABLE_WIDGET_STYLED,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Table Widget': {
      data: SAMPLE_ECOMMERCE_TABLE_CHART_WIDGET,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Text Widget': {
      data: SAMPLE_ECOMMERCE_TEXT_WIDGET,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
  },
  certified_data_model_for_ai: {
    'Top 10 Accounts by Deployments Count Bar Chart': {
      data: CERTIFIED_DATA_MODEL_FOR_AI_TOP_10_ACCOUNTS_BY_DEPLOYMENTS_COUNT_BAR_CHART_WIDGET,
      context: {
        dataSource: CERTIFIED_DATA_MODEL_FOR_AI_DATA_SOURCE,
        tables: CERTIFIED_DATA_MODEL_FOR_AI_TABLES,
      },
    },
  },
};
