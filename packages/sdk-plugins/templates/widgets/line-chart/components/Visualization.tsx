import type { CustomVisualization, CustomVisualizationProps } from '@sisense/sdk-ui';
import { LineChart } from '@sisense/sdk-ui';

import { DataOptions, StyleOptions } from '../types.js';

export type VisualizationProps = CustomVisualizationProps<DataOptions, StyleOptions>;

export const Visualization: CustomVisualization<VisualizationProps> = (props) => {
  return (
    <LineChart
      dataSet={props.dataSource}
      dataOptions={{
        category: props.dataOptions.category ?? [],
        value: props.dataOptions.value ?? [],
        breakBy: props.dataOptions.breakBy ?? [],
      }}
      filters={props.filters}
      styleOptions={{
        ...props.styleOptions,
      }}
    />
  );
};
