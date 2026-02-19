import { ChartProps } from '@/props';

/** Function to check if we should wait for sisense context for rendering the chart */
export const shouldSkipSisenseContextWaiting = (props: ChartProps) => {
  const { dataSet } = props;
  // check if complete dataset
  return !!dataSet && typeof dataSet !== 'string' && 'rows' in dataSet && 'columns' in dataSet;
};
