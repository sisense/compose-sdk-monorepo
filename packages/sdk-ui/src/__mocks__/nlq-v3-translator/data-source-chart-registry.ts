import { ChartInput } from '@/modules/analytics-composer/index-node.js';

import { SAMPLE_ECOMMERCE_DATA_SOURCE, SAMPLE_ECOMMERCE_TABLES } from './data-schemas.js';
import {
  SAMPLE_ECOMMERCE_AREA_CHART,
  SAMPLE_ECOMMERCE_AREAMAP_CHART,
  SAMPLE_ECOMMERCE_BAR_CHART,
  SAMPLE_ECOMMERCE_BOXPLOT_CHART,
  SAMPLE_ECOMMERCE_CALENDAR_HEATMAP_CHART,
  SAMPLE_ECOMMERCE_COLUMN_CHART,
  SAMPLE_ECOMMERCE_COLUMN_CHART_BY_AGE,
  SAMPLE_ECOMMERCE_COMBO_CHART,
  SAMPLE_ECOMMERCE_FUNNEL_CHART,
  SAMPLE_ECOMMERCE_INDICATOR_CHART,
  SAMPLE_ECOMMERCE_LINE_CHART,
  SAMPLE_ECOMMERCE_PIE_CHART,
  SAMPLE_ECOMMERCE_POLAR_CHART,
  SAMPLE_ECOMMERCE_SCATTER_CHART,
  SAMPLE_ECOMMERCE_SCATTERMAP_CHART,
  SAMPLE_ECOMMERCE_STREAMGRAPH_CHART,
  SAMPLE_ECOMMERCE_SUNBURST_CHART,
  SAMPLE_ECOMMERCE_TABLE_CHART,
  SAMPLE_ECOMMERCE_TREEMAP_CHART,
} from './example-charts.js';

export const DATA_SOURCE_CHART_REGISTRY: Record<string, Record<string, ChartInput>> = {
  'Sample ECommerce': {
    'Column Chart': {
      data: SAMPLE_ECOMMERCE_COLUMN_CHART,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Column Chart by Age': {
      data: SAMPLE_ECOMMERCE_COLUMN_CHART_BY_AGE,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Line Chart': {
      data: SAMPLE_ECOMMERCE_LINE_CHART,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Bar Chart': {
      data: SAMPLE_ECOMMERCE_BAR_CHART,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Pie Chart': {
      data: SAMPLE_ECOMMERCE_PIE_CHART,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Area Chart': {
      data: SAMPLE_ECOMMERCE_AREA_CHART,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Scatter Chart': {
      data: SAMPLE_ECOMMERCE_SCATTER_CHART,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Combo Chart': {
      data: SAMPLE_ECOMMERCE_COMBO_CHART,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Funnel Chart': {
      data: SAMPLE_ECOMMERCE_FUNNEL_CHART,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Treemap Chart': {
      data: SAMPLE_ECOMMERCE_TREEMAP_CHART,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Polar Chart': {
      data: SAMPLE_ECOMMERCE_POLAR_CHART,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Streamgraph Chart': {
      data: SAMPLE_ECOMMERCE_STREAMGRAPH_CHART,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Sunburst Chart': {
      data: SAMPLE_ECOMMERCE_SUNBURST_CHART,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    Table: {
      data: SAMPLE_ECOMMERCE_TABLE_CHART,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    Indicator: {
      data: SAMPLE_ECOMMERCE_INDICATOR_CHART,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Boxplot Chart': {
      data: SAMPLE_ECOMMERCE_BOXPLOT_CHART,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Areamap Chart': {
      data: SAMPLE_ECOMMERCE_AREAMAP_CHART,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Scattermap Chart': {
      data: SAMPLE_ECOMMERCE_SCATTERMAP_CHART,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Calendar Heatmap': {
      data: SAMPLE_ECOMMERCE_CALENDAR_HEATMAP_CHART,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
  },
};
