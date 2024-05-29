import { memo, useCallback } from 'react';
import isEqualWith from 'lodash/isEqualWith';
import isFunction from 'lodash/isFunction';
import cloneDeep from 'lodash/cloneDeep';
import Highcharts from '@sisense/sisense-charts';
import HighchartsReact from 'highcharts-react-official';
import { HighchartsEventOptions } from './chart-options-processor/apply-event-handlers';
import {
  HighchartsOptionsInternal,
  HighchartsOptions,
  SeriesType,
} from './chart-options-processor/chart-options-service';
import { usePrevious } from './common/hooks/use-previous';

// TODO: move this import once we decide where to do all our highcharts customizations
import './highcharts-overrides';

type HighchartsReactMemoizedProps = {
  options: HighchartsOptionsInternal;
};

export const HighchartsReactMemoized = memo(
  ({ options }: HighchartsReactMemoizedProps) => {
    const prevOptions = usePrevious(options);
    const onChartCreated = useCallback(
      (chart: Highcharts.Chart) => {
        const chartOptions = options as HighchartsOptions & HighchartsEventOptions;
        // if there are no on click handlers, allow parent to capture events
        if (
          !chartOptions?.plotOptions?.series?.point?.events?.click &&
          !chartOptions?.plotOptions?.series?.point?.events?.contextmenu
        ) {
          chart.container.onclick = null;
        }
      },
      [options],
    );

    const hasMarkers = (series: SeriesType[] | undefined) =>
      series?.some(({ data }) => data.some((dataPoint) => !!dataPoint.marker));

    // changing axis type requires a chart re-initialization
    const isAxisTypeChanged =
      prevOptions?.xAxis &&
      options?.xAxis &&
      prevOptions?.xAxis[0]?.type !== options?.xAxis[0]?.type;

    // changing navigation enablement requires a chart re-initialization
    const isNavigatorStateChanged =
      !!prevOptions && prevOptions?.navigator?.enabled !== options?.navigator?.enabled;

    const isDeselectAllHighlights = hasMarkers(prevOptions?.series) && !hasMarkers(options?.series);

    // changing chart type requires a chart re-initialization
    const isChartTypeChanged = !!prevOptions && prevOptions?.chart?.type !== options?.chart?.type;

    const immutable =
      isAxisTypeChanged || isNavigatorStateChanged || isChartTypeChanged || isDeselectAllHighlights;

    return (
      <HighchartsReact
        highcharts={Highcharts}
        // provides deep copy in order to prevent "options" prop mutation, that leads to an extra rerender of current momoized component
        // See: https://github.com/highcharts/highcharts-react?tab=readme-ov-file#why-highcharts-mutates-my-data
        options={cloneDeep(options)}
        containerProps={{
          style: {
            // Container should inherit parent size for correct chart size calculation by Highcharts
            height: '100%',
            width: '100%',
          },
        }}
        immutable={immutable}
        callback={onChartCreated}
      />
    );
  },
  // A memoization props comparator that performs a deep object comparison instead of using
  // the default comparator based on `Object.is`, which cannot compare different objects
  (prevProps: HighchartsReactMemoizedProps, newProps: HighchartsReactMemoizedProps) => {
    return isEqualWith(prevProps, newProps, (objValue, othValue) => {
      // compares function properties based on their string representations
      return isFunction(objValue) && isFunction(othValue)
        ? objValue.toString() === othValue.toString()
        : undefined;
    });
  },
);
