import { isDatetime } from '@sisense/sdk-data';

import { ChartType, CompleteThemeSettings, TotalLabels } from '../../../../../../../types';
import { CartesianChartDataOptionsInternal } from '../../../../chart-data-options/types';
import { CartesianChartData } from '../../../../chart-data/types';
import { Stacking } from '../../../chart-options-service';
import {
  applyNumberFormatToPlotBands,
  getCategoriesIndexMapAndPlotBands,
} from '../../../plot-bands';
import {
  Axis,
  AxisMinMax,
  AxisSettings,
  getCategoricalCompareValue,
  PlotBand,
} from '../../../translations/axis-section';
import {
  PolarChartDesignOptions,
  StackableChartDesignOptions,
} from '../../../translations/design-options';
import {
  addStackingIfSpecified,
  autoCalculateYAxisMinMax,
  AxisClipped,
  determineYAxisOptions,
} from '../../../translations/translations-to-highcharts';
import { ChartDesignOptions } from '../../../translations/types';
import {
  getXAxisDatetimeSettings,
  getXAxisSettings,
  getYAxisSettings,
  getYClippings,
  withChartSpecificAxisSettings,
  withPolarSpecificAxisSettings,
  withStacking,
} from './axis-utils';

// Re-export transformer functions for external use
export { withChartSpecificAxisSettings, withPolarSpecificAxisSettings, withStacking };

// ============================================================================
// TYPES
// ============================================================================

/**
 * X-axis orientation type
 */
export type XAxisOrientation = 'horizontal' | 'vertical';

/**
 * Y-axis metadata containing all Y-axis related configuration
 */
export interface YAxisMeta {
  side: number[];
  chartType: (string | undefined)[];
  treatNullAsZero: boolean[];
  connectNulls: boolean[];
}

/**
 * Categories metadata containing categories, index mapping, and plot bands
 */
export interface CategoriesMeta {
  categories: string[];
  indexMap: number[];
  plotBands: PlotBand[];
}

/**
 * Parameters for building X-axis settings
 */
export interface BuildXAxisSettingsParams {
  designOptions: ChartDesignOptions;
  dataOptions: CartesianChartDataOptionsInternal;
  chartData: CartesianChartData;
  categoriesMeta: CategoriesMeta;
  orientation: XAxisOrientation;
  isContinuous: boolean;
  dateFormatter?: (date: Date, format: string) => string;
}

/**
 * Stacking configuration metadata
 */
export interface StackingMeta {
  stacking?: Stacking;
  totalLabels?: TotalLabels;
}

/**
 * Y-axis settings result containing both settings and clipping information
 */
export interface YAxisSettingsResult {
  settings: AxisSettings[];
  clipped: AxisClipped[];
}

// ============================================================================
// PURE BUILDER FUNCTIONS
// ============================================================================

/**
 * Determines if the X-axis should use continuous datetime scale
 *
 * @param xDataOptions - X-axis data options
 * @returns true if continuous datetime X-axis should be used
 */
export const isContinuousDatetimeXAxis = (
  xDataOptions: CartesianChartDataOptionsInternal['x'],
): boolean =>
  xDataOptions.length === 1 &&
  !!xDataOptions[0].continuous &&
  isDatetime(xDataOptions[0].column.type);

/**
 * Builds Y-axis metadata from chart data and options
 *
 * @param chartData - Cartesian chart data
 * @param dataOptions - Chart data options
 * @returns Y-axis metadata object
 */
export const buildYAxisMeta = (
  chartData: CartesianChartData,
  dataOptions: CartesianChartDataOptionsInternal,
): YAxisMeta => {
  const [side, chartType, treatNullAsZero, connectNulls] = determineYAxisOptions(
    chartData,
    dataOptions,
  );
  return {
    side,
    chartType,
    treatNullAsZero,
    connectNulls,
  };
};

/**
 * Determines X-axis orientation based on chart type and Y-axis chart types
 *
 * @param chartType - Main chart type
 * @param yAxisChartTypes - Array of Y-axis chart types
 * @returns X-axis orientation
 */
export const getXAxisOrientation = (
  chartType: ChartType,
  yAxisChartTypes: (string | undefined)[],
): XAxisOrientation =>
  chartType === 'bar' || yAxisChartTypes.includes('bar') ? 'vertical' : 'horizontal';

/**
 * Builds categories metadata including categories, index map, and plot bands
 *
 * @param chartData - Chart data
 * @param dataOptions - Chart data options
 * @param designOptions - Chart design options
 * @param isContinuous - Whether X-axis is continuous
 * @returns Categories metadata object
 */
export const buildCategoriesMeta = (
  chartData: CartesianChartData,
  dataOptions: CartesianChartDataOptionsInternal,
  designOptions: ChartDesignOptions,
  isContinuous: boolean,
): CategoriesMeta => {
  const { categoriesCapacity } = designOptions.dataLimits;
  const limitedChartData = {
    ...chartData,
    xValues: chartData.xValues.slice(0, categoriesCapacity),
  };

  const { categories, indexMap, plotBands } = applyNumberFormatToPlotBands(
    dataOptions,
    getCategoriesIndexMapAndPlotBands(limitedChartData, dataOptions, designOptions, isContinuous),
  );

  return { categories, indexMap, plotBands };
};

/**
 * Builds X-axis settings based on whether it's continuous datetime or categorical
 *
 * @param params - Parameters object containing all required data
 * @param params.designOptions - Chart design options
 * @param params.dataOptions - Chart data options
 * @param params.chartData - Chart data
 * @param params.categoriesMeta - Categories metadata
 * @param params.orientation - X-axis orientation
 * @param params.isContinuous - Whether X-axis is continuous
 * @param params.dateFormatter - Optional date formatter function
 * @returns X-axis settings array
 */
export const buildXAxisSettings = ({
  designOptions,
  dataOptions,
  chartData,
  categoriesMeta,
  orientation,
  isContinuous,
  dateFormatter,
}: BuildXAxisSettingsParams): AxisSettings[] => {
  if (isContinuous) {
    return getXAxisDatetimeSettings(
      designOptions.xAxis,
      dataOptions.x[0],
      chartData.xValues.map(getCategoricalCompareValue),
      dateFormatter,
    );
  } else {
    return getXAxisSettings(
      designOptions.xAxis,
      designOptions.x2Axis,
      categoriesMeta.categories,
      categoriesMeta.plotBands,
      orientation,
      dataOptions,
    );
  }
};

/**
 * Calculates Y-axis min/max values for a specific axis side
 *
 * @param axisIndex - Axis index (0 for left/primary, 1 for right/secondary)
 * @param chartType - Chart type
 * @param chartData - Chart data
 * @param designOptions - Chart design options
 * @param yAxisSide - Array indicating which side each series belongs to
 * @param treatNullAsZero - Array indicating null treatment for each series
 * @returns Axis min/max values
 */
export const buildYAxisMinMax = (
  axisIndex: 0 | 1,
  chartType: ChartType,
  chartData: CartesianChartData,
  designOptions: ChartDesignOptions,
  yAxisSide: number[],
  treatNullAsZero: boolean[],
): AxisMinMax =>
  autoCalculateYAxisMinMax(
    chartType,
    chartData,
    designOptions,
    yAxisSide,
    treatNullAsZero,
    axisIndex,
  );

/**
 * Builds stacking configuration metadata
 *
 * @param chartType - Chart type
 * @param designOptions - Stackable chart design options
 * @returns Stacking metadata
 */
export const buildStackingMeta = (
  chartType: ChartType,
  designOptions: StackableChartDesignOptions,
): StackingMeta => addStackingIfSpecified(chartType, designOptions);

/**
 * Contextless transformer that normalizes Y-axis configuration for polar charts.
 * Disables Y-axis titles which are not meaningful in polar coordinate system.
 *
 * @param designOptions - Polar chart design options to normalize
 * @returns Normalized polar chart design options with Y-axis title disabled
 * @example
 * const normalizedOptions = withYAxisNormalizationForPolar(polarDesignOptions);
 */
export const withYAxisNormalizationForPolar = (
  designOptions: Readonly<PolarChartDesignOptions>,
): PolarChartDesignOptions => {
  return {
    ...designOptions,
    yAxis: {
      ...designOptions.yAxis,
      titleEnabled: false,
      title: null,
    },
  };
};

/**
 * Builds Y-axis settings and clipping information
 *
 * @param yAxis - Primary Y-axis configuration
 * @param y2Axis - Secondary Y-axis configuration
 * @param primaryMinMax - Primary axis min/max values
 * @param secondaryMinMax - Secondary axis min/max values (optional)
 * @param stackingMeta - Stacking configuration
 * @param totalLabelRotation - Total label rotation angle
 * @param dataOptions - Chart data options
 * @param themeSettings - Theme settings (optional)
 * @returns Y-axis settings and clipping information
 */
export const buildYAxisSettings = (
  yAxis: Axis,
  y2Axis: Axis | undefined,
  primaryMinMax: AxisMinMax,
  secondaryMinMax: AxisMinMax | undefined,
  stackingMeta: StackingMeta,
  dataOptions: CartesianChartDataOptionsInternal,
  themeSettings?: CompleteThemeSettings,
): YAxisSettingsResult => {
  const basicSettings = getYAxisSettings(
    yAxis,
    y2Axis,
    primaryMinMax,
    secondaryMinMax,
    dataOptions,
    themeSettings,
  );

  return {
    settings: withStacking({
      stacking: stackingMeta.stacking,
      totalLabels: stackingMeta.totalLabels,
      dataOptions,
      themeSettings,
    })(basicSettings),
    clipped: getYClippings(yAxis, y2Axis, secondaryMinMax),
  };
};

/**
 * Determines if a secondary Y-axis is needed based on Y-axis side configuration
 *
 * @param yAxisSide - Array indicating which side each series belongs to
 * @returns true if secondary Y-axis is needed
 */
export const hasSecondaryYAxis = (yAxisSide: number[]): boolean =>
  yAxisSide.some((side) => side === 1);
