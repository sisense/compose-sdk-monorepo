import { useCallback, useMemo } from 'react';

import Highcharts from '@sisense/sisense-charts';
import HighchartsReact from 'highcharts-react-official';
import cloneDeep from 'lodash-es/cloneDeep';

import { HighchartsEventOptions } from './chart-options-processor/apply-event-handlers';
import {
  HighchartsOptions,
  HighchartsOptionsInternal,
  SeriesType,
} from './chart-options-processor/chart-options-service';
import { usePrevious } from './common/hooks/use-previous';
import { applyHighchartOverrides } from './highcharts-overrides';

// TODO: move this function call once we decide where to do all our highcharts customizations
applyHighchartOverrides();

type HighchartsRendererProps = {
  options: HighchartsOptionsInternal;
};

const defaultContainerProps = {
  style: {
    // Container should inherit parent size for correct chart size calculation by Highcharts
    height: '100%',
    width: '100%',
  },
};

/**
 * Renders a Highcharts chart with optimized behavior
 *
 * This component wraps the `HighchartsReact` component and ensures efficient re-renders
 * by detecting key changes that require chart re-initialization.
 * It also handles cases where Highcharts mutates input options by making deep clone.
 */
export const HighchartsRenderer = ({ options }: HighchartsRendererProps) => {
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
    prevOptions?.xAxis && options?.xAxis && prevOptions?.xAxis[0]?.type !== options?.xAxis[0]?.type;

  // changing navigation enablement requires a chart re-initialization
  const isNavigatorStateChanged =
    !!prevOptions && prevOptions?.navigator?.enabled !== options?.navigator?.enabled;

  const isDeselectAllHighlights = hasMarkers(prevOptions?.series) && !hasMarkers(options?.series);

  // changing chart type requires a chart re-initialization
  const isChartTypeChanged = !!prevOptions && prevOptions?.chart?.type !== options?.chart?.type;

  const immutable =
    isAxisTypeChanged || isNavigatorStateChanged || isChartTypeChanged || isDeselectAllHighlights;

  const finalOptions = useMemo(() => {
    // provides deep copy in order to prevent "options" prop mutation, that leads to an extra rerender of current momoized component
    // See: https://github.com/highcharts/highcharts-react?tab=readme-ov-file#why-highcharts-mutates-my-data
    return cloneDeep(options);
  }, [options]);

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={finalOptions}
      containerProps={defaultContainerProps}
      immutable={immutable}
      callback={onChartCreated}
    />
  );
};
