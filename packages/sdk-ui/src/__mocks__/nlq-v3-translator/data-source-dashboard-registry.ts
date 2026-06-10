import type { DashboardInput } from '@/modules/analytics-composer/index-node.js';

import { SAMPLE_ECOMMERCE_DATA_SOURCE, SAMPLE_ECOMMERCE_TABLES } from './data-schemas.js';
import {
  SAMPLE_ECOMMERCE_DASHBOARD_MULTI_CHART,
  SAMPLE_ECOMMERCE_DASHBOARD_OVERVIEW,
} from './example-dashboards.js';

export const DATA_SOURCE_DASHBOARD_REGISTRY: Record<string, Record<string, DashboardInput>> = {
  'Sample ECommerce': {
    'ECommerce Overview': {
      data: SAMPLE_ECOMMERCE_DASHBOARD_OVERVIEW,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Multi-Chart Dashboard': {
      data: SAMPLE_ECOMMERCE_DASHBOARD_MULTI_CHART,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
  },
};
