import React from 'react';

import type { Attribute } from '@sisense/sdk-data';
import type { CustomVisualization, CustomVisualizationProps } from '@sisense/sdk-ui';
import { LineChart } from '@sisense/sdk-ui';

import { DataOptions, StyleOptions } from '../types.js';

export type LineChartProps = CustomVisualizationProps<DataOptions, StyleOptions>;

export const Chart: CustomVisualization<LineChartProps> = (props) => {
  return (
    <LineChart
      dataSet={props.dataSource}
      dataOptions={{
        category: props.dataOptions.categories?.map((d) => d.column as Attribute) ?? [],
        value: props.dataOptions.values?.map((d) => d.column) ?? [],
        breakBy: props.dataOptions.breakBy?.map((d) => d.column as Attribute) ?? [],
      }}
      filters={props.filters}
      styleOptions={{
        ...props.styleOptions,
      }}
    />
  );
};
