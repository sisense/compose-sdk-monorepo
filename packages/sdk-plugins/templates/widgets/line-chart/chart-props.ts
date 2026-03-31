import * as DM from '@models/sample-ecommerce';
import { measureFactory } from '@sisense/sdk-data';
import type { CustomVisualizationProps } from '@sisense/sdk-ui';

import { DataOptions, StyleOptions } from './types.js';

export const chartProps: CustomVisualizationProps<DataOptions, StyleOptions> = {
  dataSource: DM.DataSource,
  dataOptions: {
    categories: [{ column: DM.Commerce.AgeRange }],
    values: [{ column: measureFactory.sum(DM.Commerce.Revenue) }],
    breakBy: [{ column: DM.Commerce.Condition }],
  },
  filters: [],
  highlights: [],
  styleOptions: {
    subtype: 'line/spline',
    line: {
      width: 3,
    },
    legend: {
      enabled: true,
      verticalAlign: 'top',
    },
  },
};
