import flow from 'lodash-es/flow';

import {
  CartesianChartData,
  SeriesValueData,
} from '@/domains/visualizations/core/chart-data/types.js';

import { getCartesianChartData } from '../../../helpers/data.js';

/**
 * Transformer type for CartesianChartData.
 * Follows the transformer pattern: pure, immutable transformation.
 */
type CartesianChartDataTransformer = (input: Readonly<CartesianChartData>) => CartesianChartData;

/**
 * Normalizes streamgraph series data by replacing null/NaN values with zeros.
 *
 * Highcharts' streamgraph geometry assumes a continuous stack at every category.
 * Missing data points (null or NaN) would introduce gaps in the stream, breaking
 * the continuous flow. This transformer ensures all data holes are implicitly set
 * to 0 to provide continuous flow without breaks.
 *
 * @param chartData - The cartesian chart data to normalize
 * @returns A new cartesian chart data with normalized series values
 */
const withNormalizedStreamgraphSeries: CartesianChartDataTransformer = (
  chartData: Readonly<CartesianChartData>,
): CartesianChartData => {
  const normalizeValue = (value: number): number => {
    // Handle NaN values (which are technically numbers but represent missing data)
    if (typeof value === 'number' && Number.isNaN(value)) {
      return 0;
    }
    // Handle null/undefined (defensive check for runtime data)
    if (value == null) {
      return 0;
    }
    return value;
  };

  const normalizeDataPoint = (point: Readonly<SeriesValueData>): SeriesValueData => {
    const normalizedValue = normalizeValue(point.value);
    return {
      ...point,
      value: normalizedValue,
    };
  };

  return {
    ...chartData,
    series: chartData.series.map((series) => ({
      ...series,
      data: series.data.map(normalizeDataPoint),
    })),
  };
};

/**
 * Get streamgraph chart data with normalized series values.
 *
 * Composes the base cartesian chart data loader with the streamgraph-specific
 * normalization transformer to ensure continuous flow.
 */
export const getStreamgraphChartData = flow(getCartesianChartData, withNormalizedStreamgraphSeries);
