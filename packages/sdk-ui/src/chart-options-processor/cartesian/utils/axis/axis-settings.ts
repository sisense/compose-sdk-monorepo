import {
  xAxisDefaults,
  yAxisDefaults,
  fontStyleDefault,
  lineColorDefault,
  stackTotalFontStyleDefault,
} from '../../../defaults/cartesian';
import merge from 'deepmerge';
import {
  applyFormatPlainText,
  getCompleteNumberFormatConfig,
} from '../../../translations/number-format-config';
import { isNumber } from '@ethings-os/sdk-data';
import {
  ChartDataOptionsInternal,
  CartesianChartDataOptionsInternal,
} from '../../../../chart-data-options/types';
import { CompleteNumberFormatConfig, CompleteThemeSettings } from '../../../../types';
import { AxisClipped } from '../../../translations/translations-to-highcharts';
import {
  Axis,
  AxisMinMax,
  AxisOrientation,
  AxisSettings,
  PlotBand,
  AxisPlotLine,
} from '../../../translations/axis-section';

/**
 * Builds X-axis settings for categorical axes
 *
 * @param axis - Primary X-axis configuration
 * @param axis2 - Secondary X-axis configuration (optional)
 * @param categories - Array of category labels
 * @param plotBands - Array of plot band configurations
 * @param xAxisOrientation - X-axis orientation ('horizontal' or 'vertical')
 * @param dataOptions - Chart data options
 * @returns Array of X-axis settings
 */
export const getXAxisSettings = (
  axis: Axis,
  axis2: Axis | undefined,
  categories: string[],
  plotBands: PlotBand[],
  xAxisOrientation: AxisOrientation,
  dataOptions: ChartDataOptionsInternal,
): AxisSettings[] => {
  const plotBandsSettings = (plotBands || []).map((p) => ({
    isPlotBand: true,
    from: p.from,
    to: p.to,
    label: {
      text: p.text,
      y: -5,
      style: {
        ...fontStyleDefault,
        width: '70px',
        textOverflow: 'ellipsis',
      },
      ...(xAxisOrientation === 'vertical' && {
        align: 'right',
        x: 5,
        textAlign: 'left',
        y: 0,
      }),
    },
  }));
  const plotLinesArray: AxisPlotLine[] = (plotBands || [])
    .filter((p) => p.from > 0)
    .map((p) => ({
      color: '#C0D0E0',
      dashStyle: 'shortDot',
      width: 1,
      value: p.from,
    }));
  const cartesianDataOptions = dataOptions as CartesianChartDataOptionsInternal;
  const x1 = cartesianDataOptions.x[cartesianDataOptions.x.length - 1];

  let array: AxisSettings[] = [
    merge(xAxisDefaults, {
      type: axis.type,
      title: {
        enabled: axis.enabled && axis.titleEnabled,
        text: axis.title,
      },
      gridLineDashStyle: 'Dot',
      gridLineWidth: axis.enabled && axis.gridLine ? 1 : 0, // 0 to disable the grid line
      gridLineColor: lineColorDefault,
      tickWidth: 0,
      lineColor: lineColorDefault,
      lineWidth: 1,
      labels: {
        enabled: axis.enabled && axis.labels,
        style: fontStyleDefault,
        formatter: function () {
          const that: { value: string } = this as unknown as { value: string };
          if (!x1 || !isNumber(x1?.column.type) || isNaN(parseFloat(that.value))) {
            return that.value;
          }
          return applyFormatPlainText(
            getCompleteNumberFormatConfig(x1?.numberFormatConfig),
            parseFloat(that.value),
          );
        },
      },
      min: axis.min,
      max: axis.max,
      tickInterval: axis.tickInterval,
      categories,
      plotBands: plotBandsSettings,
      plotLines: plotLinesArray,
      tickmarkPlacement: 'on',
    }),
  ];
  if (axis2) {
    // X2 doesn't have gridLine, labels, min, max and tickInterval
    array = array.concat(
      merge(xAxisDefaults, {
        title: {
          enabled: axis2.enabled && axis2.titleEnabled,
          text: axis2.title,
        },
        categories,
        opposite: true,
        gridLineWidth: 0,
        tickWidth: 0,
        lineWidth: 0,
      }),
    );
  }
  return array;
};

/**
 * Creates Y-axis clipping information for cartesian charts.
 *
 * @param axis - Primary Y-axis configuration
 * @param axis2 - Secondary Y-axis configuration (optional)
 * @param axis2MinMax - Min/max values for secondary axis (optional)
 * @returns Array of axis clipping information
 */
export const getYClippings = (
  axis: Axis,
  axis2: Axis | undefined,
  axis2MinMax: AxisMinMax | undefined,
): AxisClipped[] => {
  const axisClipped = [
    { minClipped: !!(axis.enabled && axis.min), maxClipped: !!(axis.enabled && axis.max) },
  ];

  if (axis2MinMax) {
    axisClipped.push({
      minClipped: !!(axis2?.enabled && axis2.min),
      maxClipped: !!(axis2?.enabled && axis2.max),
    });
  }

  return axisClipped;
};

/**
 * Creates basic Y-axis settings configuration for cartesian charts.
 * This function provides core Y-axis functionality without stacking-specific features.
 * Use the withStacking transformer to add stacking capabilities when needed.
 *
 * @param axis - Primary Y-axis configuration
 * @param axis2 - Secondary Y-axis configuration (optional)
 * @param axisMinMax - Min/max values for primary axis
 * @param axis2MinMax - Min/max values for secondary axis (optional)
 * @param dataOptions - Chart data options
 * @param themeSettings - Theme settings for styling (optional)
 * @returns Array of basic axis settings
 */
export const getYAxisSettings = (
  axis: Axis,
  axis2: Axis | undefined,
  axisMinMax: AxisMinMax,
  axis2MinMax: AxisMinMax | undefined,
  dataOptions: ChartDataOptionsInternal,
  themeSettings?: CompleteThemeSettings,
): AxisSettings[] => {
  const cartesianChartDataOptions: CartesianChartDataOptionsInternal =
    dataOptions as CartesianChartDataOptionsInternal;
  const y1NumberFormatConfig = getCompleteNumberFormatConfig(
    cartesianChartDataOptions.y.find(({ showOnRightAxis }) => !showOnRightAxis)?.numberFormatConfig,
  );
  const y2NumberFormatConfig = getCompleteNumberFormatConfig(
    cartesianChartDataOptions.y.find(({ showOnRightAxis }) => showOnRightAxis)?.numberFormatConfig,
  );

  function getLabelsFormatter(numberFormatConfig: CompleteNumberFormatConfig) {
    return function (this: { value: number }) {
      return applyFormatPlainText(numberFormatConfig, this.value);
    };
  }

  const array: AxisSettings[] = [
    merge(yAxisDefaults, {
      type: axis.type,
      title: { enabled: axis.enabled && axis.titleEnabled, text: axis.title },
      gridLineDashStyle: 'Dot',
      gridLineWidth: axis.enabled && axis.gridLine ? 1 : 0, // 0 to disable the grid line
      gridLineColor: lineColorDefault,
      tickWidth: 0,
      lineColor: lineColorDefault,
      lineWidth: 1,
      labels: {
        enabled: axis.enabled && axis.labels,
        style: fontStyleDefault,
        formatter: getLabelsFormatter(y1NumberFormatConfig),
      },
      startOnTick: axis.enabled && axis.min ? false : true,
      ...(axis.min && { minPadding: 0 }),
      ...(axis.max && { maxPadding: 0 }),
      min: axis.enabled ? axis.min ?? axisMinMax.min : null,
      max: axis.enabled ? axis.max ?? axisMinMax.max : null,
      tickInterval: axis.enabled ? axis.tickInterval : null,
      stackLabels: {
        enabled: false,
        formatter: getLabelsFormatter(y1NumberFormatConfig),
        style: {
          ...stackTotalFontStyleDefault,
          ...(themeSettings ? { color: themeSettings.typography.primaryTextColor } : null),
        },
        rotation: 0,
      },
    }),
  ];

  if (axis2MinMax) {
    const axis2MinMaxOptions = {
      startOnTick: axis2?.enabled && axis2.min ? false : true,
      min: axis2?.enabled ? axis2.min || axis2MinMax.min : null,
      max: axis2?.enabled ? axis2.max || axis2MinMax.max : null,
    };

    const axis2OtherOptions = axis2?.enabled
      ? {
          opposite: true,
          gridLineWidth: 0,
          title: {
            enabled: axis2.enabled && axis2.titleEnabled,
            text: axis2.title,
          },
          labels: {
            enabled: axis2.enabled && axis2.labels,
            style: fontStyleDefault,
            formatter: getLabelsFormatter(y2NumberFormatConfig),
          },
          tickInterval: axis2.enabled ? axis2.tickInterval : null,
          stackLabels: {
            enabled: false,
            formatter: getLabelsFormatter(y2NumberFormatConfig),
            style: {
              ...stackTotalFontStyleDefault,
              ...(themeSettings ? { color: themeSettings.typography.primaryTextColor } : null),
            },
            rotation: 0,
          },
        }
      : ({ visible: false } as AxisSettings);

    array.push(
      merge(yAxisDefaults, {
        ...axis2MinMaxOptions,
        ...axis2OtherOptions,
      } as AxisSettings),
    );
  }

  return array;
};
