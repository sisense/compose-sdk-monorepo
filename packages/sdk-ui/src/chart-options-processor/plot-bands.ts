/* eslint-disable sonarjs/no-ignored-return */
import {
  CartesianChartDataOptionsInternal,
  ChartDataOptionsInternal,
} from '../chart-data-options/types';
import { isNumber } from '@sisense/sdk-data';
import { ChartData, CartesianChartData, CategoricalXValues } from '../chart-data/types';
import { onlyY, onlyYAndSeries } from '../chart-data/utils';
import { PlotBand, getCategoricalCompareValue } from './translations/axis-section';
import { StackableChartDesignOptions } from './translations/design-options';
import {
  applyFormatPlainText,
  getCompleteNumberFormatConfig,
} from './translations/number-format-config';
import { DesignOptions } from './translations/types';
import { getDataOptionTitle } from '../chart-data-options/utils';

type CategoryIndexMapPlotBands = {
  categories: string[];
  indexMap: number[];
  plotBands: PlotBand[];
};

export const applyNumberFormatToPlotBands = (
  chartDataOptions: ChartDataOptionsInternal,
  categoryIndexMapPlotBands: CategoryIndexMapPlotBands,
): CategoryIndexMapPlotBands => {
  const cartesianChartDataOptions = chartDataOptions as CartesianChartDataOptionsInternal;
  if (cartesianChartDataOptions.x.length !== 2) {
    return categoryIndexMapPlotBands;
  }
  const { categories, indexMap, plotBands } = categoryIndexMapPlotBands;
  const x1 = cartesianChartDataOptions.x[1];
  const x2 = cartesianChartDataOptions.x[0];

  const x1NumberFormatConfig = getCompleteNumberFormatConfig(x1?.numberFormatConfig);
  const x2NumberFormatConfig = getCompleteNumberFormatConfig(x2?.numberFormatConfig);

  // Category is x1
  let newCategories: string[] = categories;
  if (x1 && isNumber(x1.type)) {
    newCategories = categories.map((category: string) => {
      return applyFormatPlainText(x1NumberFormatConfig, parseFloat(category));
    });
  }

  // PlotBand is x2
  let newPlotBands: PlotBand[] = plotBands;
  if (x2 && isNumber(x2.type)) {
    newPlotBands = plotBands.map((plotBand: PlotBand) => {
      const text = applyFormatPlainText(x2NumberFormatConfig, parseFloat(plotBand.text));
      return { ...plotBand, text };
    });
  }

  return { categories: newCategories, indexMap, plotBands: newPlotBands };
};

/**
 * When no X columns on a chart and it's not stacked the x-axis categories are taken from
 * Y column titles
 *
 * @param dataOptions -
 * @param designOptions -
 */
const takeCategoriesFromYColumns = (
  dataOptions: CartesianChartDataOptionsInternal,
  designOptions: DesignOptions,
): boolean => {
  const { stackType } = designOptions as StackableChartDesignOptions;

  return stackType === 'classic' && (onlyY(dataOptions) || onlyYAndSeries(dataOptions));
};

/**
 * With one axis there is an xValue per tic and no plot bands
 * The tic index equals xValue index
 * For more than two xAxisCount is not allowed by UI
 * however code below treats this as single XAxis
 *
 * @param data -
 */
const takeCategoriesFromXValues = (data: ChartData): boolean => {
  const { xValues, xAxisCount } = data as CartesianChartData;

  return xAxisCount !== 2 || xValues.length === 0;
};

const noPlotBandsSection = (
  xValues: CategoricalXValues[],
  categories: string[],
): CategoryIndexMapPlotBands => {
  return {
    plotBands: [],
    indexMap: xValues.map((s, i) => i),
    categories,
  };
};

/**
 * This method returns three arrays to create chart options
 * categories - values to display on the bottom X1 axis
 * indexMap - tic index to xValue index
 * plotBands - information to create plot bands for X2 axis
 *
 * @param data -
 * @param dataOptions -
 * @param designOptions -
 * @param continuousDatetimeXAxis -
 */
export const getCategoriesIndexMapAndPlotBands = (
  data: ChartData,
  dataOptions: CartesianChartDataOptionsInternal,
  designOptions: DesignOptions,
  continuousDatetimeXAxis: boolean,
  // eslint-disable-next-line max-params
): CategoryIndexMapPlotBands => {
  const x2PanelIndex = 0;
  const xAxisIndex = 1;
  const { xValues } = data as CartesianChartData;
  const { y } = dataOptions;

  // chart only contains values and no categories
  if (takeCategoriesFromYColumns(dataOptions, designOptions)) {
    return noPlotBandsSection(
      xValues,
      y.map((yValue) => getDataOptionTitle(yValue)),
    );
  }

  // chart has one continuous datetime axis
  if (continuousDatetimeXAxis) {
    return noPlotBandsSection(
      xValues,
      xValues.map(getCategoricalCompareValue).map((v) => `${v}`),
    );
  }

  // chart is not a two category axes chart
  if (takeCategoriesFromXValues(data)) {
    return noPlotBandsSection(
      xValues,
      xValues.map((xAxisValue) => xAxisValue.xValues[0]),
    );
  }

  // when there are two xAxes, null categories (tics) are
  // added to create plot bands, one plot band per X2 xValue.
  // The adding of null categories (tics) requires an indexMap
  // to map a xValue index to a tic index.
  const indexMap: number[] = [];
  const plotBands: PlotBand[] = [];
  const categories: string[] = [];
  let prevX2Value = xValues[0].xValues[x2PanelIndex];
  let from = -0.5;
  xValues.map((xAxisValue, index) => {
    const x1Value = xAxisValue.xValues[xAxisIndex];
    const x2Value = xAxisValue.xValues[x2PanelIndex];
    if (x2Value !== prevX2Value) {
      indexMap.push(-1);
      const to = indexMap.length - 1;
      categories.push(' ');
      plotBands.push({ text: prevX2Value, from: from, to: to });
      from = to;
      prevX2Value = x2Value;
    }
    indexMap.push(index);
    categories.push(x1Value);
    return xAxisValue.xValues[xAxisIndex];
  });
  const lastXIndex = xValues.length - 1;
  const lastX2 = xValues[lastXIndex].xValues[x2PanelIndex];
  plotBands.push({
    text: lastX2,
    from: from,
    to: indexMap.length - 0.5,
  });
  return { categories, indexMap, plotBands };
};
