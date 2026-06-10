import * as DM from '@models/sample-ecommerce';
import { measureFactory } from '@sisense/sdk-data';
import type { CustomVisualizationProps } from '@sisense/sdk-ui';

import { DataOptions, StyleOptions } from './types.js';

export const devPreviewProps: CustomVisualizationProps<DataOptions, StyleOptions> = {
  dataSource: DM.DataSource,
  dataOptions: {
    category: [{ column: DM.Commerce.AgeRange }],
    value: [{ column: measureFactory.sum(DM.Commerce.Revenue) }],
  },
  filters: [],
  highlights: [],
  styleOptions: {},
};
