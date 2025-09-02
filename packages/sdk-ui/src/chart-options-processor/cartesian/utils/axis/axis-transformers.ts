import {
  applyFormatPlainText,
  getCompleteNumberFormatConfig,
} from '../../../translations/number-format-config';
import { stackTotalFontStyleDefault } from '../../../defaults/cartesian';
import { Stacking } from '../../../chart-options-service';
import {
  ChartDataOptionsInternal,
  CartesianChartDataOptionsInternal,
} from '../../../../chart-data-options/types';
import { ChartType, CompleteNumberFormatConfig, CompleteThemeSettings } from '../../../../types';
import { AxisSettings } from '../../../translations/axis-section';
import { isPolar } from '@/chart-options-processor/translations/types';
import flow from 'lodash-es/flow';

/**
 * Configuration interface for stacking transformer
 */
export interface StackingConfig {
  stacking?: Stacking;
  showTotal?: boolean;
  totalLabelRotation?: number;
  dataOptions: ChartDataOptionsInternal;
  themeSettings?: CompleteThemeSettings;
}

/**
 * Transformer to apply top title positioning for polar charts
 * Places the axis title at the top center of the chart
 *
 * @param axisSettings - Array of axis settings to transform
 * @returns Transformed axis settings with top title positioning
 */
const withTopTitle = (axisSettings: AxisSettings[]): AxisSettings[] => {
  return axisSettings.map((axis) => ({
    ...axis,
    title: {
      ...axis.title,
      textAlign: 'center',
      align: 'high',
      y: -25,
    },
  }));
};

/**
 * Transformer to remove label rotation for polar charts
 * Sets rotation to 0 for better readability in polar charts
 *
 * @param axisSettings - Array of axis settings to transform
 * @returns Transformed axis settings without label rotation
 */
const withoutLabelsRotation = (axisSettings: AxisSettings[]): AxisSettings[] => {
  return axisSettings.map((axis) => ({
    ...axis,
    labels: {
      ...axis.labels,
      rotation: 0,
    },
  }));
};

/**
 * Transformer that combines polar-specific axis transformations
 * Applies both top title positioning and removes label rotation
 */
export const withPolarSpecificAxisSettings = flow(withTopTitle, withoutLabelsRotation);

/**
 * Transformer that applies stacking-specific enhancements to Y-axis settings.
 * This transformer adds stacking-related properties (stack labels, total labels, formatting)
 * to basic Y-axis settings for stackable charts.
 *
 * @param config - Stacking configuration containing stacking type, showTotal, rotation, and formatting options
 * @returns A function that transforms basic Y-axis settings to include stacking support
 *
 * @example
 * ```typescript
 * // Apply stacking enhancements to basic Y-axis
 * const stackedYAxis = flow(
 *   getYAxisSettings,
 *   withStacking({ stacking: 'normal', showTotal: true, totalLabelRotation: 0, dataOptions, themeSettings }),
 * )(axis, axis2, axisMinMax, axis2MinMax, dataOptions, themeSettings);
 * ```
 */
export const withStacking =
  (config: StackingConfig) =>
  (axisSettings: AxisSettings[]): AxisSettings[] => {
    const {
      stacking,
      showTotal = false,
      totalLabelRotation = 0,
      dataOptions,
      themeSettings,
    } = config;

    if (!showTotal && !stacking) {
      return axisSettings;
    }

    const cartesianChartDataOptions: CartesianChartDataOptionsInternal =
      dataOptions as CartesianChartDataOptionsInternal;
    const y1NumberFormatConfig = getCompleteNumberFormatConfig(
      cartesianChartDataOptions.y.find(({ showOnRightAxis }) => !showOnRightAxis)
        ?.numberFormatConfig,
    );
    const y2NumberFormatConfig = getCompleteNumberFormatConfig(
      cartesianChartDataOptions.y.find(({ showOnRightAxis }) => showOnRightAxis)
        ?.numberFormatConfig,
    );

    function getStackingLabelsFormatter(
      numberFormatConfig: CompleteNumberFormatConfig,
      stackingType?: Stacking,
      isTotal = false,
    ) {
      return function (this: { value: string | number; total?: number }) {
        const numericValue = typeof this.value === 'number' ? this.value : parseFloat(this.value);
        const valueToFormat = isTotal ? this.total || numericValue : numericValue;
        const formattedValue = applyFormatPlainText(numberFormatConfig, valueToFormat);
        return stackingType === 'percent' ? `${formattedValue}%` : formattedValue;
      };
    }

    return axisSettings.map((axisSettings, index) => {
      const isSecondaryAxis = index === 1;
      const numberFormatConfig = isSecondaryAxis ? y2NumberFormatConfig : y1NumberFormatConfig;

      return {
        ...axisSettings,
        labels: stacking
          ? {
              ...axisSettings.labels,
              formatter: getStackingLabelsFormatter(numberFormatConfig, stacking),
            }
          : axisSettings.labels,
        stackLabels: showTotal
          ? {
              ...axisSettings.stackLabels,
              enabled: true,
              formatter: getStackingLabelsFormatter(numberFormatConfig, 'normal', true),
              style: {
                ...stackTotalFontStyleDefault,
                ...(themeSettings ? { color: themeSettings.typography.primaryTextColor } : null),
              },
              rotation: totalLabelRotation,
              crop: true,
              allowOverlap: false,
              labelrank: 99999,
            }
          : axisSettings.stackLabels,
      };
    });
  };

/**
 * Applies chart-specific axis settings to the axis settings array
 *
 * @param chartType - Chart type
 * @param axisSettings - Array of axis settings
 * @returns Array of axis settings with chart-specific settings applied
 */
export const withChartSpecificAxisSettings =
  (chartType: ChartType) =>
  (axisSettings: AxisSettings[]): AxisSettings[] => {
    if (isPolar(chartType)) {
      return withPolarSpecificAxisSettings(axisSettings);
    }
    return axisSettings;
  };
