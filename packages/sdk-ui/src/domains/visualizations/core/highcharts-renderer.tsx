import { useCallback, useMemo } from 'react';

import Highcharts from '@sisense/sisense-charts';
import HighchartsReact from 'highcharts-react-official';
import cloneDeep from 'lodash-es/cloneDeep';

import { usePrevious } from '@/shared/hooks/use-previous';

import { HighchartsEventOptions } from './chart-options-processor/apply-event-handlers';
import {
  HighchartsOptions,
  HighchartsOptionsInternal,
  SeriesType,
} from './chart-options-processor/chart-options-service';
import { applyHighchartOverrides } from './highcharts-overrides';

// TODO: move this function call once we decide where to do all our highcharts customizations
applyHighchartOverrides();

type HighchartsRendererProps = {
  options: HighchartsOptionsInternal;
};

type DataLabelsStyleSnapshot = {
  backgroundColor?: unknown;
  borderColor?: unknown;
};

function getDataLabelsStyleSnapshot(
  options: HighchartsOptionsInternal | undefined,
): DataLabelsStyleSnapshot | undefined {
  if (!options) {
    return undefined;
  }

  const plotSeriesDataLabels = options.plotOptions?.series?.dataLabels;
  const seriesDataLabels = options.series?.[0]?.dataLabels;
  const dataLabels =
    seriesDataLabels && typeof seriesDataLabels === 'object'
      ? seriesDataLabels
      : plotSeriesDataLabels && typeof plotSeriesDataLabels === 'object'
      ? plotSeriesDataLabels
      : undefined;

  if (!dataLabels) {
    return undefined;
  }

  return {
    backgroundColor: dataLabels.backgroundColor,
    borderColor: dataLabels.borderColor,
  };
}

function isDataLabelsStyleChanged(
  prevOptions: HighchartsOptionsInternal | undefined,
  nextOptions: HighchartsOptionsInternal | undefined,
): boolean {
  if (!prevOptions) {
    return false;
  }

  return (
    JSON.stringify(getDataLabelsStyleSnapshot(prevOptions)) !==
    JSON.stringify(getDataLabelsStyleSnapshot(nextOptions))
  );
}

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

  const isCategoriesLengthChanged =
    !!prevOptions &&
    (prevOptions?.xAxis?.[0]?.categories?.length ?? 0) !==
      (options?.xAxis?.[0]?.categories?.length ?? 0);

  const isSeriesDataLengthChanged =
    !!prevOptions &&
    (prevOptions?.series ?? []).some(
      (prevSeries, index) =>
        (prevSeries?.data?.length ?? 0) !== (options?.series?.[index]?.data?.length ?? 0),
    );

  const isSeriesCountChanged =
    !!prevOptions && (prevOptions?.series?.length ?? 0) !== (options?.series?.length ?? 0);

  const immutable =
    isAxisTypeChanged ||
    isNavigatorStateChanged ||
    isChartTypeChanged ||
    isDeselectAllHighlights ||
    isCategoriesLengthChanged ||
    isSeriesDataLengthChanged ||
    isSeriesCountChanged ||
    isDataLabelsStyleChanged(prevOptions, options);

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
