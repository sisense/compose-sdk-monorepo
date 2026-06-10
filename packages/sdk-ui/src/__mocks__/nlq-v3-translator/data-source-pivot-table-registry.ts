import type { PivotTableInput } from '@/modules/analytics-composer/index-node.js';

import { SAMPLE_ECOMMERCE_DATA_SOURCE, SAMPLE_ECOMMERCE_TABLES } from './data-schemas.js';
import {
  SAMPLE_ECOMMERCE_PIVOT_TABLE,
  SAMPLE_ECOMMERCE_PIVOT_TABLE_STYLED,
} from './example-pivot-tables.js';

export const DATA_SOURCE_PIVOT_TABLE_REGISTRY: Record<string, Record<string, PivotTableInput>> = {
  'Sample ECommerce': {
    'Basic (Category × Gender)': {
      data: SAMPLE_ECOMMERCE_PIVOT_TABLE,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Styled (Years × Gender)': {
      data: SAMPLE_ECOMMERCE_PIVOT_TABLE_STYLED,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
  },
};
