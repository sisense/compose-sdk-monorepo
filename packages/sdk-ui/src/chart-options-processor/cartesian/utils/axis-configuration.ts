import { isDatetime } from '@sisense/sdk-data';
import { ChartType, CompleteThemeSettings } from '../../../types';
import { CartesianChartData } from '../../../chart-data/types';
import { CartesianChartDataOptionsInternal } from '../../../chart-data-options/types';
import { StackableChartDesignOptions } from '../../translations/design-options';
import { ChartDesignOptions } from '../../translations/types';
import {
  getXAxisSettings,
  getYAxisSettings,
  Axis,
  getXAxisDatetimeSettings,
  getCategoricalCompareValue,
  AxisSettings,
} from '../../translations/axis-section';
import {
  determineYAxisOptions,
  autoCalculateYAxisMinMax,
  addStackingIfSpecified,
  AxisClipped,
} from '../../translations/translations-to-highcharts';
import { applyNumberFormatToPlotBands, getCategoriesIndexMapAndPlotBands } from '../../plot-bands';

/**
 * Configuration for axis setup
 */
interface AxisConfig {
  chartData: CartesianChartData;
  chartType: ChartType;
  chartDesignOptions: ChartDesignOptions;
  dataOptions: CartesianChartDataOptionsInternal;
  themeSettings?: CompleteThemeSettings;
  dateFormatter?: (date: Date, format: string) => string;
}

/**
 * Result of axis configuration
 */
interface AxisConfigResult {
  xAxisSettings: AxisSettings[];
  yAxisSettings: AxisSettings[];
  axisClipped: AxisClipped[];
  yAxisSide: number[];
  yAxisChartType: (string | undefined)[];
  yTreatNullDataAsZeros: boolean[];
  yConnectNulls: boolean[];
  xAxisOrientation: 'horizontal' | 'vertical';
  categories: string[];
  indexMap: number[];
  plotBands: any[];
  continuousDatetimeXAxis: boolean;
  stacking?: string;
  showTotal?: boolean;
}

/**
 * Determine if the chart uses continuous datetime X-axis
 */
function determineContinuousDatetimeXAxis(dataOptions: CartesianChartDataOptionsInternal): boolean {
  return (
    (dataOptions.x.length === 1 &&
      dataOptions.x[0].continuous &&
      isDatetime(dataOptions.x[0].column.type)) ||
    false
  );
}

/**
 * Determine X-axis orientation based on chart type and Y-axis types
 */
function determineXAxisOrientation(
  chartType: ChartType,
  yAxisChartType: (string | undefined)[],
): 'horizontal' | 'vertical' {
  return chartType === 'bar' || yAxisChartType.includes('bar') ? 'vertical' : 'horizontal';
}

/**
 * Configure chart axes for cartesian charts
 */
export function configureAxes(config: AxisConfig): AxisConfigResult {
  const { chartData, chartType, chartDesignOptions, dataOptions, themeSettings, dateFormatter } =
    config;

  // Determine continuous datetime X-axis
  const continuousDatetimeXAxis = determineContinuousDatetimeXAxis(dataOptions);

  // Determine Y-axis options
  const [yAxisSide, yAxisChartType, yTreatNullDataAsZeros, yConnectNulls] = determineYAxisOptions(
    chartData,
    dataOptions,
  );

  // Determine X-axis orientation
  const xAxisOrientation = determineXAxisOrientation(chartType, yAxisChartType);

  // Get categories, index map, and plot bands
  const { categoriesCapacity } = chartDesignOptions.dataLimits;
  const { categories, indexMap, plotBands } = applyNumberFormatToPlotBands(
    dataOptions,
    getCategoriesIndexMapAndPlotBands(
      {
        ...chartData,
        xValues: chartData.xValues.slice(0, categoriesCapacity),
      },
      dataOptions,
      chartDesignOptions,
      continuousDatetimeXAxis,
    ),
  );

  // Configure X-axis settings
  const xAxisSettings = continuousDatetimeXAxis
    ? getXAxisDatetimeSettings(
        chartDesignOptions.xAxis,
        dataOptions.x[0],
        chartData.xValues.map(getCategoricalCompareValue),
        dateFormatter,
      )
    : getXAxisSettings(
        chartDesignOptions.xAxis,
        chartDesignOptions.x2Axis,
        categories,
        plotBands,
        xAxisOrientation,
        dataOptions,
        chartType,
      );

  // Calculate Y-axis min/max values
  const yAxisMinMax = autoCalculateYAxisMinMax(
    chartType,
    chartData,
    chartDesignOptions,
    yAxisSide,
    yTreatNullDataAsZeros,
    0,
  );

  // Calculate Y2-axis min/max if needed
  const y2AxisMinMax = yAxisSide.some((v) => v === 1)
    ? autoCalculateYAxisMinMax(
        chartType,
        chartData,
        chartDesignOptions,
        yAxisSide,
        yTreatNullDataAsZeros,
        1,
      )
    : undefined;

  // Configure stacking
  const { stacking, showTotal } = addStackingIfSpecified(
    chartType,
    chartDesignOptions as StackableChartDesignOptions,
  );

  // Handle polar chart Y-axis adjustments
  let yAxis: Axis | undefined = chartDesignOptions.yAxis;
  if ('polarType' in chartDesignOptions) {
    // Polar charts on the Analytics tab do not allow a y-axis title to be set
    yAxis = {
      ...chartDesignOptions.yAxis,
      titleEnabled: false,
      title: null,
    };
  }

  // Configure Y-axis settings
  const [yAxisSettings, axisClipped] = getYAxisSettings(
    yAxis,
    chartDesignOptions.y2Axis,
    yAxisMinMax,
    y2AxisMinMax,
    showTotal,
    (chartDesignOptions as StackableChartDesignOptions).totalLabelRotation ?? 0,
    dataOptions,
    stacking,
    themeSettings,
  );

  return {
    xAxisSettings,
    yAxisSettings,
    axisClipped,
    yAxisSide,
    yAxisChartType,
    yTreatNullDataAsZeros,
    yConnectNulls,
    xAxisOrientation,
    categories,
    indexMap,
    plotBands,
    continuousDatetimeXAxis,
    stacking,
    showTotal,
  };
}

export type { AxisConfig, AxisConfigResult };
