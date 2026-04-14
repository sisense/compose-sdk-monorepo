import * as DM from '@models/sample-ecommerce';
import { measureFactory } from '@sisense/sdk-data';
import type { CustomVisualizationProps } from '@sisense/sdk-ui';

import { DataOptions, StyleOptions } from './types.js';

export const chartProps: CustomVisualizationProps<DataOptions, StyleOptions> = {
  dataSource: DM.DataSource,
  dataOptions: {
    category: [{ column: DM.Category.Category }],
    value: [{ column: measureFactory.sum(DM.Commerce.Revenue) }],
  },
  styleOptions: {
    headerBackgroundColor: '#1976d2',
    headerTextColor: '#ffffff',
    cellPadding: 4,
    fontSize: 14,
  },
  filters: [],
  highlights: [],
};
