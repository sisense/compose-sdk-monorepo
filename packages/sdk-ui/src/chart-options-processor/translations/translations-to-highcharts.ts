/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable sonarjs/no-ignored-return */
import { ChartType, ValueToColorMap } from '../../types';
import {
  ChartDataOptionsInternal,
  CategoricalChartDataOptionsInternal,
  CartesianChartDataOptionsInternal,
} from '../../chart-data-options/types';
import {
  SeriesValueData,
  CategoricalSeriesValues,
  ChartData,
  CartesianChartData,
} from '../../chart-data/types';
import { legendColor } from '../../chart-data/data-coloring';
import {
  isPolarChartDesignOptions,
  PolarChartDesignOptions,
  StackableChartDesignOptions,
} from './design-options';
import { AxisMinMax, AxisSettings } from './axis-section';
import { Stacking } from '../chart-options-service';
import { DesignOptions, isPolar } from './types';
import { colorChineseSilver } from '@/chart-data-options/coloring/consts';
import { TranslatableError } from '@/translation/translatable-error';

export type LineType = 'straight' | 'smooth';
export type StackType = 'classic' | 'stacked' | 'stack100';

export type HighchartsType = ChartType | 'spline' | 'areaspline' | 'bubble';
export type HighchartsSeriesValues = {
  name: string;
  data: SeriesPointStructure[];
  levels?: any;
};

export type SeriesPointStructure = {
  name?: string;
  y?: number | null;
  x?: number | null;
  z?: number | null;
  color?: string;
  marker?: {
    enabled?: boolean;
    isIsolatedPoint?: boolean;
    lineColor?: string;
    lineWidth?: number;
  };
  selected?: boolean;
  sliced?: boolean;
  custom?: {
    number1?: number;
    string1?: string;
    level?: number;
    maskedBreakByPoint?: string;
    maskedBreakByColor?: string;
    [k: string]: unknown;
  };
  value?: number | null;
  id?: string;
  drilldown?: string;
  parent?: string;
  // range charts specific
  low?: number | null;
  high?: number | null;
  trend?: {
    min: number;
    max: number;
    median: number;
    average: number;
  };
};

export type AxisClipped = { minClipped: boolean; maxClipped: boolean };

/**
 * Translate public-facing chart type and chart design options to internal highcharts chart type
 *
 * @param chartType - public-facing chart type
 * @param designOptions - public-facing chart design options
 * @returns internal highcharts chart type
 */
export const determineHighchartsChartType = (
  chartType: ChartType,
  designOptions: DesignOptions,
): HighchartsType => {
  if (chartType === 'line' && designOptions.lineType === 'smooth') {
    return 'spline';
  } else if (chartType === 'area' && designOptions.lineType === 'smooth') {
    return 'areaspline';
  } else if (chartType === 'polar') {
    return (designOptions as PolarChartDesignOptions).polarType;
  } else if (chartType === 'scatter') {
    // instead of scatter chart, bubble chart is used so size can be encoded to bubble size
    return 'bubble';
  } else {
    return chartType;
  }
};

export const addStackingIfSpecified = (
  chartType: ChartType,
  designOptions: StackableChartDesignOptions | PolarChartDesignOptions,
): { stacking?: Stacking; showTotal: boolean } => {
  if (
    chartType !== 'area' &&
    chartType !== 'bar' &&
    chartType !== 'column' &&
    chartType !== 'polar'
  ) {
    return { showTotal: false };
  }

  if (chartType === 'polar') {
    if (isPolarChartDesignOptions(designOptions)) {
      return {
        stacking:
          designOptions.polarType === 'column' || designOptions.polarType === 'area'
            ? 'normal'
            : undefined,
        showTotal: false,
      };
    }
    throw new TranslatableError('errors.polarChartDesignOptionsExpected');
  }

  if (isPolarChartDesignOptions(designOptions)) {
    throw new TranslatableError('errors.polarChartDesignOptionsNotExpected');
  }

  const showTotal = designOptions.valueLabel ? designOptions.showTotal || false : false;
  switch (designOptions.stackType) {
    case 'stacked':
      return {
        stacking: 'normal',
        showTotal,
      };
    case 'stack100':
      return {
        stacking: 'percent',
        showTotal,
      };
    default:
      return { showTotal: false };
  }
};

/**
 * In cartesian charts when a chart has only Y columns and since we for each Y column build a separate series
 * to match the legend correctly in order to correctly map x-axis labels
 * This method returns the indexMap for the series with the index
 * for a series with one data, index map has -1 for all x-axis locations except where the series lands
 *
 * @param categories -
 * @param index -
 */
export const indexMapWhenOnlyY = (categories: string[], index: number) =>
  categories.map((c, categoryIndex) => (index === categoryIndex ? 0 : -1));

export const formatSeriesContinuousXAxis = (
  series: CategoricalSeriesValues,
  indexMap: number[],
  treatNullDataAsZeros: boolean,
  interval: number,
  maxCategories: number,
  dateFormatter: (time: number) => string,
  yAxisSettings: AxisSettings,
  axisClipped: AxisClipped,
): HighchartsSeriesValues => {
  const input = formatData(series, treatNullDataAsZeros);
  const { title, ...seriesWithoutTitle } = series;
  return {
    ...seriesWithoutTitle,
    name: title ?? series.name,

    data: translateNumbersContinuousXAxis(
      input,
      indexMap,
      interval,
      maxCategories,
      treatNullDataAsZeros,
      dateFormatter,
      yAxisSettings,
      axisClipped,
    ),
  };
};

const adjustAxis = (yAxisSettings: AxisSettings, axisClipped: AxisClipped) => {
  if (!axisClipped.minClipped && yAxisSettings?.min && yAxisSettings?.min > 0) {
    yAxisSettings.min = 0;
  }
  if (!axisClipped.maxClipped && yAxisSettings?.max && yAxisSettings?.max < 0) {
    yAxisSettings.max = 0;
  }
};

const translateNumbersContinuousXAxis = (
  input: SeriesValueData[],
  indexMap: number[],
  interval: number,
  maxCategories: number,
  treatNullDataAsZeros: boolean,
  dateFormatter: (time: number) => string,
  yAxisSettings: AxisSettings,
  axisClipped: AxisClipped,
): SeriesPointStructure[] => {
  // eslint-disable-next-line sonarjs/prefer-immediate-return
  const seriesData = indexMap.map((index: number, indexOfIndex: number): SeriesPointStructure => {
    if (index < 0) {
      return { y: null };
    }
    const { value, blur, color, rawValue, xValue, xDisplayValue, xCompareValue } = input[index];
    const shouldShowIsolatedPoint = isIsolatedPoint(input, indexMap, index, indexOfIndex);
    const hasMarker = shouldShowIsolatedPoint || blur;
    const marker = {
      enabled: !blur,
      isIsolatedPoint: shouldShowIsolatedPoint,
    };

    const x = xCompareValue ? (xCompareValue[0] as number) : NaN;
    return {
      x,
      y: value,
      selected: !!blur,
      ...(hasMarker && { marker }),
      ...(color && { color }),
      custom: { rawValue, xValue, xDisplayValue: xDisplayValue || xValue },
    };
  });

  const seriesDataWithNulls: SeriesPointStructure[] = [];
  let nextTick = -1;
  const halfInterval = interval / 2.0;

  let addedTickCount = 0;
  seriesData.forEach((s) => {
    if (s.x && nextTick === -1) {
      nextTick = s.x + halfInterval;
    }

    if (s.x && s.x > nextTick) {
      let missingTicks = Math.round((s.x - (nextTick - halfInterval)) / interval);
      while (missingTicks > 0) {
        addedTickCount++;
        if (addedTickCount > maxCategories) break;
        const ticValue = s.x - interval * missingTicks;
        seriesDataWithNulls.push({
          custom: { xDisplayValue: dateFormatter(ticValue) },
          x: ticValue,
          y: treatNullDataAsZeros ? 0 : null,
        });
        if (treatNullDataAsZeros && yAxisSettings?.min && yAxisSettings?.min > 0) {
          adjustAxis(yAxisSettings, axisClipped);
        }

        missingTicks--;
        nextTick += interval;
      }
    }
    seriesDataWithNulls.push(s);
    if (s.x) {
      nextTick = s.x + interval + halfInterval;
    } else {
      // if null data then just increment
      nextTick += interval;
    }
  });

  return seriesDataWithNulls;
};

export const formatSeries = (
  series: CategoricalSeriesValues,
  indexMap: number[],
  treatNullDataAsZeros: boolean,
  categories?: string[],
  categoryColors?: string[],
  convertValuesToAbsolute?: boolean,
): HighchartsSeriesValues => {
  const input = formatData(series, treatNullDataAsZeros, convertValuesToAbsolute);
  const { title, ...seriesWithoutTitle } = series;
  return {
    ...seriesWithoutTitle,
    name: title ?? series.name,
    data: translateNumbersToSeriesPointStructure(input, indexMap, categories, categoryColors),
  };
};

const isIsolatedPoint = (
  input: SeriesValueData[],
  indexMap: number[],
  index: number,
  indexOfIndex: number,
) => {
  const prevIsNull =
    indexOfIndex === 0 ||
    indexMap[indexOfIndex - 1] < 0 ||
    isNaN(input[indexMap[indexOfIndex - 1]].value);
  const nextIsNull =
    indexOfIndex + 1 === indexMap.length ||
    indexMap[indexOfIndex + 1] < 0 ||
    isNaN(input[indexMap[indexOfIndex + 1]].value);
  return prevIsNull && nextIsNull;
};

const formatData = (
  seriesValues: CategoricalSeriesValues,
  treatNullDataAsZeros: boolean,
  convertValuesToAbsolute?: boolean,
): SeriesValueData[] =>
  seriesValues.data.map(({ value, ...restData }) => ({
    value:
      treatNullDataAsZeros && Number.isNaN(value)
        ? 0
        : convertValuesToAbsolute
        ? Math.abs(value)
        : value,
    ...restData,
  }));

const translateNumbersToSeriesPointStructure = (
  input: SeriesValueData[],
  indexMap: number[],
  categories?: string[],
  categoryColors?: string[],
): SeriesPointStructure[] => {
  const hasHighlighted = input.some((v) => v.blur !== undefined);

  return indexMap.map((index: number, indexOfIndex: number): SeriesPointStructure => {
    if (index < 0) {
      return { y: null };
    }

    const { value, blur, color, rawValue, xValue } = input[index];
    if (categories) {
      return {
        name: categories[index],
        y: value,
        color: color ?? categoryColors?.[index],
        ...(hasHighlighted && !blur && { selected: true }),
        custom: { rawValue, xValue },
      };
    } else {
      const shouldShowIsolatedPoint = isIsolatedPoint(input, indexMap, index, indexOfIndex);
      const hasMarker = shouldShowIsolatedPoint || hasHighlighted;
      const marker = {
        enabled: !blur,
        isIsolatedPoint: shouldShowIsolatedPoint,
      };
      return {
        y: isNaN(+value) ? value : +value,
        selected: !!blur,
        ...(hasMarker && { marker }),
        ...(color && { color }),
        custom: { rawValue, xValue },
      };
    }
  });
};

/**
 * Adds extra space to the min and max values to display totals
 *
 * @param min
 * @param max
 * @param minPadding
 * @returns {{min: number, max: number}}
 */
const addPaddingForValueLabels = (min: number, max: number, minPadding = 0.1) => {
  const range = Math.abs(max - min);
  const shift = (range * minPadding) / 2;

  return {
    min: min < 0 ? min - shift : min,
    max: max >= 0 ? max + shift : max,
  };
};

export const adjustMinMaxWhenInvalid = (explicitAxis: AxisMinMax, autoMinMax: AxisMinMax) => {
  const adjustedAutoMinMax = { ...autoMinMax };
  // adjust so that min will not greater or equal to max
  if (explicitAxis.min && explicitAxis.min >= adjustedAutoMinMax.max) {
    adjustedAutoMinMax.max = explicitAxis.min * (explicitAxis.min >= 0 ? 2 : 0.5);
  }
  if (explicitAxis.max && explicitAxis.max <= adjustedAutoMinMax.min) {
    adjustedAutoMinMax.min = explicitAxis.max * (explicitAxis.max >= 0 ? 0.5 : 2);
  }
  return adjustedAutoMinMax;
};

export const adjustMinWhenColumnBar = (chartType: ChartType, autoMinMax: AxisMinMax) => {
  const adjustedAutoMinMax = { ...autoMinMax };

  // only adjust min to zero when data are positive values
  if (adjustedAutoMinMax.min <= 0) {
    return adjustedAutoMinMax;
  }

  // for column or bar, auto min is always zero
  if (chartType === 'column' || chartType === 'bar') {
    adjustedAutoMinMax.min = 0;
  }
  return adjustedAutoMinMax;
};

export const autoCalculateYAxisMinMax = (
  chartType: ChartType,
  chartData: CartesianChartData,
  designOptions: DesignOptions,
  yAxisSide: number[],
  yTreatNullDataAsZeros: boolean[],
  side: number,
) => {
  const adjustedSeries = chartData.series
    .map((series, index) => ({
      ...series,
      data: series.data.map(({ value, ...restData }) => ({
        value: isNaN(value) && yTreatNullDataAsZeros[index] ? 0 : value,
        ...restData,
      })),
    }))
    .filter((s, index) => yAxisSide[index] === side);
  const { stacking } = addStackingIfSpecified(
    chartType,
    designOptions as StackableChartDesignOptions,
  );
  const yAxis =
    side === 0
      ? (designOptions.yAxis as AxisMinMax)
      : (designOptions.y2Axis as AxisMinMax) || {
          min: undefined,
          max: undefined,
        };
  const isStackingPolar =
    isPolar(chartType) && (designOptions as PolarChartDesignOptions).polarType !== 'line';

  if (stacking === 'percent') {
    return { min: 0, max: 100 };
  }
  if (stacking === 'normal' || isStackingPolar) {
    // find plus and minus per category then find min max overall
    const axisPlusMinus = Array.from(Array(chartData.xValues.length), () => ({
      plus: 0,
      minus: 0,
    }));

    const stackedPlusMinusByCategory = adjustedSeries.reduce((axisPlusMinus, series) => {
      series.data.forEach(({ value }, index) => {
        if (value < 0) {
          axisPlusMinus[index].minus += value || 0;
        } else {
          axisPlusMinus[index].plus += value || 0;
        }
      });
      return axisPlusMinus;
    }, axisPlusMinus);

    let axisMinMax = stackedPlusMinusByCategory.reduce(
      (axisMinMax, stackedPlusMinus) => {
        return {
          min: Math.min(axisMinMax.min, stackedPlusMinus.minus),
          max: Math.max(axisMinMax.max, stackedPlusMinus.plus),
        };
      },
      { min: Number.MAX_VALUE, max: Number.MIN_VALUE },
    );

    // adjust so that min will not greater than max
    axisMinMax = adjustMinMaxWhenInvalid(yAxis, axisMinMax);

    // set min to zero for bar and column charts
    axisMinMax = adjustMinWhenColumnBar(chartType, axisMinMax);

    // add padding for value labels
    if (designOptions.valueLabel) {
      axisMinMax = addPaddingForValueLabels(
        yAxis.min || axisMinMax.min,
        yAxis.max || axisMinMax.max,
      );
    }

    return axisMinMax;
  }

  let axisMinMax = adjustedSeries.reduce(
    (axisMinMax, series) => {
      const filteredData = series.data.map(({ value }) => value).filter((d) => !isNaN(d));
      return {
        min: Math.min(axisMinMax.min, ...filteredData),
        max: Math.max(axisMinMax.max, ...filteredData),
      };
    },
    { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY },
  );

  // adjust so that min will not greater than max
  axisMinMax = adjustMinMaxWhenInvalid(yAxis, axisMinMax);

  // set min to zero for bar and column charts
  axisMinMax = adjustMinWhenColumnBar(chartType, axisMinMax);

  return axisMinMax;
};

export const determineYAxisOptions = (
  chartData: ChartData,
  dataOptions: ChartDataOptionsInternal,
): [number[], (HighchartsType | undefined)[], boolean[], boolean[]] => {
  if (chartData.type !== 'cartesian') {
    return [[], [], [], []];
  }
  // Determine whether the Y value is on the left side or right side
  let yAxisSide: number[] = [];
  let yAxisChartType: (HighchartsType | undefined)[] = [];

  const cartesianDataOptions = dataOptions as CartesianChartDataOptionsInternal;
  let yTreatNullDataAsZeros = cartesianDataOptions.y.map(
    ({ treatNullDataAsZeros }) => !!treatNullDataAsZeros,
  );
  let yConnectNulls = cartesianDataOptions.y.map(({ connectNulls }) => !!connectNulls);
  if (cartesianDataOptions.breakBy.length === 0) {
    // handle a special case when there is no break by and no y values
    if (cartesianDataOptions.y.length === 0) {
      return [[0], [undefined], [false], [false]];
    }

    // Each Y value has individual axis setting, 0 is on left axis, 1 is on right axis
    yAxisSide = cartesianDataOptions.y.map(({ showOnRightAxis }) => (showOnRightAxis ? 1 : 0));
    // SeriesChartType is only respected if multiple Y values enabled.
    let ignoreSeriesChartType = cartesianDataOptions.y.length <= 1;
    if (!ignoreSeriesChartType) {
      let numEnabled = 0;
      cartesianDataOptions.y.map(({ enabled }) => {
        if (enabled) {
          numEnabled += 1;
        }
        // This line is needed so Typescript doesn't complain.
        return null;
      });
      if (numEnabled <= 1) {
        ignoreSeriesChartType = true;
      }
    }
    yAxisChartType = cartesianDataOptions.y.map(({ chartType }) => {
      if (!chartType || chartType === 'auto' || ignoreSeriesChartType) {
        return undefined;
      }
      return chartType;
    });
  } else {
    // Each series has same value of these measure options (only one measure allowed)
    const onRightAxis = cartesianDataOptions.y[0]?.showOnRightAxis ? 1 : 0;
    yAxisSide = chartData.series.map(() => onRightAxis);
    yAxisChartType = chartData.series.map(() => undefined);
    yTreatNullDataAsZeros = chartData.series.map(() => yTreatNullDataAsZeros[0]);
    yConnectNulls = chartData.series.map(() => yConnectNulls[0]);
  }
  return [yAxisSide, yAxisChartType, yTreatNullDataAsZeros, yConnectNulls];
};

export const getColorSetting = (
  dataOptions: CartesianChartDataOptionsInternal | CategoricalChartDataOptionsInternal,
  key: string,
) => {
  if (dataOptions.breakBy.length === 0) {
    // handle a special case when there is no break by and no y values
    if (dataOptions.y.length === 0) {
      return colorChineseSilver;
    }
    const colorOpts = dataOptions.y.find((v) => v.column.name === key)?.color;
    return legendColor(colorOpts);
  } else {
    return (dataOptions.seriesToColorMap as ValueToColorMap)?.[key];
  }
};
