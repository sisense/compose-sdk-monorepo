/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { isNumber } from '@ethings-os/sdk-data';
import {
  ScatterChartDataOptionsInternal,
  StyledColumn,
  StyledMeasureColumn,
} from '../../chart-data-options/types';
import { SeriesType } from '../chart-options-service';
import { ScatterAxisCategoriesMap, ScatterDataRow, ScatterDataTable } from '../../chart-data/types';
import { MarkerSettings } from './marker-section';
import { ComparableData } from '../../chart-data-processor/table-processor';
import { SeriesPointStructure } from './translations-to-highcharts';
import { getPaletteColor } from '../../chart-data-options/coloring/utils';
import { SeriesWithAlerts, CompleteThemeSettings } from '../../types';
import { DataColorOptions, legendColor } from '../../chart-data/data-coloring';
import { seriesSliceWarning } from '../../utils/data-limit-warning';
import { getDataOptionTitle, isMeasureColumn } from '../../chart-data-options/utils';
import { compareValues, SortDirectionValue } from '../../chart-data-processor/row-comparator';
import { createDataColoringFunction } from '../../chart-data/data-coloring/create-data-coloring-function';
import { ChartDesignOptions } from './types';

const defaultSeriesColor = '#00cee6';

export type ScatterSeriesColor = {
  index: number;
  color: string;
};

export type ScatterSeriesColorsMap = Map<string, ScatterSeriesColor>;
export interface AxisComputedProperties {
  x: number | null;
  y: number | null;
  z: number | null;
  maskedX: string;
  maskedY: string;
  maskedBreakByPoint?: string;
  maskedBreakByColor?: string;
  maskedSize?: string;
  color?: string;
  selected?: boolean;
}

export const handleNumberValue = (cell: ComparableData): number | null => {
  // check rawValue for both undefined and null
  const value = cell.rawValue == null ? Number(cell.displayValue) : Number(cell.rawValue);
  return Number.isNaN(value) || value === undefined ? null : value;
};

const handleSize = (size?: ComparableData): number | null => {
  if (size) {
    return handleNumberValue(size);
  }

  return 1;
};

const getComputedProperties = (
  data: ScatterDataRow,
  categoriesMap: ScatterAxisCategoriesMap,
): AxisComputedProperties => {
  const { xAxis, yAxis, breakByPoint, breakByColor, size } = data;
  const { xCategoriesMap, yCategoriesMap } = categoriesMap;
  const xCategory = xCategoriesMap.get(xAxis.displayValue);
  const yCategory = yCategoriesMap.get(yAxis.displayValue);
  const selected = xAxis.blur || yAxis.blur || breakByPoint?.blur;

  return {
    x: xCategory !== undefined ? xCategory : handleNumberValue(xAxis),
    y: yCategory !== undefined ? yCategory : handleNumberValue(yAxis),
    z: handleSize(size),
    maskedX: xAxis.displayValue,
    maskedY: yAxis.displayValue,
    maskedBreakByPoint: breakByPoint?.displayValue,
    maskedBreakByColor: breakByColor?.displayValue,
    color: breakByColor?.color,
    maskedSize: size?.displayValue,
    selected,
  };
};

/**
 * Fills colors for scatter chart data series.
 *
 * @param data - The scatter chart data table.
 * @param dataOptions - scatter chart data options.
 * @param themeSettings - theme settings.
 * @returns A map of sorted scatter series colors.
 */
const fillColors = (
  data: ScatterDataTable,
  dataOptions?: ScatterChartDataOptionsInternal,
  themeSettings?: CompleteThemeSettings,
): ScatterSeriesColorsMap => {
  const colorsMap = new Map<string, string | undefined>();

  data.forEach((row) => {
    if (row.breakByColor) {
      const { displayValue: text, color } = row.breakByColor;
      if (text && !colorsMap.has(text)) {
        // color preference: (1) color from data, (2) color from seriesToColorMap
        const newColor = color || dataOptions?.seriesToColorMap?.[text];

        colorsMap.set(text, newColor);
      }
    }
  });

  const sortedColorsMap = new Map<string, ScatterSeriesColor>();
  const dataType = isNumber((dataOptions?.breakByColor as StyledColumn)?.column?.type)
    ? 'number'
    : 'string';

  // Creates sorted "colors map" in order to apply default pallete colors over sorted values.
  // This ensures that series array will be generated in correct order
  Array.from(colorsMap)
    .sort(([keyA], [keyB]) => compareValues(keyA, keyB, SortDirectionValue.ASC, dataType))
    .forEach(([key, color], index) => {
      sortedColorsMap.set(key, {
        // applies default color from themeSettings
        color: color ?? getPaletteColor(themeSettings?.palette.variantColors, index),
        index,
      });
    });

  return sortedColorsMap;
};

const fillSeries = (
  colorsMap: ScatterSeriesColorsMap,
  seriesName: string,
  colorOptions?: DataColorOptions,
): SeriesType[] => {
  const seriesMarker: MarkerSettings = {
    enabled: true,
    fillOpacity: 0.7,
    lineWidth: 1,
    states: {
      select: {
        fillOpacity: 0.3,
        lineWidth: 1,
      },
    },
  };

  if (colorsMap.size) {
    return Array.from(colorsMap).map(([key, { index, color }]) => ({
      data: [],
      index,
      marker: seriesMarker,
      name: key,
      showInLegend: true,
      type: 'bubble',
      color,
    }));
  }

  return [
    {
      data: [],
      index: 0,
      marker: seriesMarker,
      name: seriesName,
      showInLegend: !!seriesName,
      type: 'bubble',
      color: legendColor(colorOptions) || defaultSeriesColor,
    },
  ];
};

const getSeriesIndex = (colors: ScatterSeriesColorsMap, maskedBreakByColor?: string): number => {
  const color = colors.get(maskedBreakByColor as string);
  return color ? color.index : 0;
};

const fillSeriesPointsWithColors = (series: SeriesType[], colorOptions: DataColorOptions) => {
  const seriesColoringFunction = createDataColoringFunction({
    getValueFromDataStructure: (seriesValue: SeriesPointStructure) =>
      parseFloat(`${seriesValue.custom?.maskedBreakByColor as string}`),
    applyColorToDataStructure: (seriesValue: SeriesPointStructure, color?: string) => ({
      ...seriesValue,
      color,
    }),
  });

  return series.map((currentSeries) => ({
    ...currentSeries,
    data: seriesColoringFunction(currentSeries.data, colorOptions),
  }));
};

const getColorOptions = (
  breakByColor: StyledColumn | StyledMeasureColumn | undefined,
): DataColorOptions | undefined => {
  if (breakByColor && isMeasureColumn(breakByColor) && breakByColor.color) {
    return breakByColor.color;
  }
  return undefined;
};

/**
 * Fills a series with points based on the provided data.
 *
 * @param series - The array of series to fill with points.
 * @param data - The scatter data table containing the points data.
 * @param categoriesMap - The mapping of categories for the scatter axes.
 * @param colorsMap - The mapping of colors for the scatter series.
 * @returns The updated series with added points.
 */
const fillSeriesWithPoints = (
  series: SeriesType[],
  data: ScatterDataTable,
  categoriesMap: ScatterAxisCategoriesMap,
  colorsMap: ScatterSeriesColorsMap,
) => {
  for (const row of data) {
    const {
      x,
      y,
      z,
      maskedX,
      maskedY,
      maskedBreakByPoint,
      maskedSize,
      color,
      maskedBreakByColor,
      selected,
    }: AxisComputedProperties = getComputedProperties(row, categoriesMap);

    if (x !== null && y !== null) {
      const currentSeries = series[getSeriesIndex(colorsMap, maskedBreakByColor)];

      const bubble: SeriesPointStructure = {
        color: color || currentSeries.color || defaultSeriesColor,
        x,
        y,
        z,
        custom: {
          maskedX,
          maskedY,
          maskedBreakByPoint,
          maskedBreakByColor,
          maskedSize,
        },
        selected,
      };

      currentSeries.data.push(bubble);
    }
  }

  return series;
};

/**
 * Retrieves the name of a single series based on the provided scatter data options.
 *
 * @param dataOptions - data options object.
 * @returns - The name of the single series, or an empty string if no series name is found.
 */
const getSingleSeriesName = (dataOptions?: ScatterChartDataOptionsInternal) => {
  const breakByColor = dataOptions?.breakByColor;
  const breakByPoint = dataOptions?.breakByPoint;
  return (
    (breakByColor && getDataOptionTitle(breakByColor)) ||
    (breakByPoint && getDataOptionTitle(breakByPoint)) ||
    ''
  );
};

const fill = (
  data: ScatterDataTable,
  categoriesMap: ScatterAxisCategoriesMap,
  dataOptions?: ScatterChartDataOptionsInternal,
  themeSettings?: CompleteThemeSettings,
): SeriesType[] => {
  const breakByColor = dataOptions?.breakByColor;
  const seriesName = getSingleSeriesName(dataOptions);
  const colorOptions = getColorOptions(breakByColor);

  const colorsMap =
    breakByColor && !isMeasureColumn(breakByColor)
      ? fillColors(data, dataOptions, themeSettings)
      : new Map();

  let series = fillSeries(colorsMap, seriesName, colorOptions);

  series = fillSeriesWithPoints(series, data, categoriesMap, colorsMap);

  if (colorOptions) {
    series = fillSeriesPointsWithColors(series, colorOptions);
  }

  return series;
};

/**
 * Limits the series quantity by the specified maximum amount (capacity).
 *
 * @param {SeriesType[]} series - The array of series to be limited.
 * @param {number} [seriesCapacity] - The maximum number of series allowed. If not provided, the original array will be returned.
 * @returns {SeriesType[]} - The limited series array based on the specified capacity.
 */
const limitSeriesByCapacity = (series: SeriesType[], seriesCapacity?: number) => {
  if (!seriesCapacity) return series;
  return series.slice(0, seriesCapacity);
};

export const buildScatterSeries = (
  data: ScatterDataTable,
  categoriesMap: ScatterAxisCategoriesMap,
  dataOptions?: ScatterChartDataOptionsInternal,
  designOptions?: ChartDesignOptions,
  themeSettings?: CompleteThemeSettings,
  seriesCapacity?: number,
): SeriesWithAlerts<SeriesType[]> => {
  const alerts: SeriesWithAlerts<SeriesType[]>['alerts'] = [];
  const series = fill(data, categoriesMap, dataOptions, themeSettings).map((seriesItem) => ({
    ...seriesItem,
    dataLabels: designOptions?.seriesLabels,
  }));

  if (seriesCapacity && series.length > seriesCapacity) {
    alerts.push(seriesSliceWarning(series.length, seriesCapacity));

    return {
      series: limitSeriesByCapacity(series, seriesCapacity),
      alerts,
    };
  }

  return { series, alerts };
};
