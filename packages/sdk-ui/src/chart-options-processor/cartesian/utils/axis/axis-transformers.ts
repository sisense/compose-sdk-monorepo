import flow from 'lodash-es/flow';

import { prepareStackLabels } from '@/chart-options-processor/stack-labels';
import { isPolar } from '@/chart-options-processor/translations/types';

import {
  CartesianChartDataOptionsInternal,
  ChartDataOptionsInternal,
} from '../../../../chart-data-options/types';
import {
  ChartType,
  CompleteNumberFormatConfig,
  CompleteThemeSettings,
  TotalLabels,
} from '../../../../types';
import { Stacking } from '../../../chart-options-service';
import { stackTotalFontStyleDefault } from '../../../defaults/cartesian';
import { AxisSettings } from '../../../translations/axis-section';
import {
  applyFormatPlainText,
  getCompleteNumberFormatConfig,
} from '../../../translations/number-format-config';

/**
 * Configuration interface for stacking transformer
 */
export interface StackingConfig {
  stacking?: Stacking;
  totalLabels?: TotalLabels;
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
 * @param config - Stacking configuration containing stacking type, totalLabels options and formatting options
 * @returns A function that transforms basic Y-axis settings to include stacking support
 *
 * @example
 * ```typescript
 * // Apply stacking enhancements to basic Y-axis
 * const stackedYAxis = flow(
 *   getYAxisSettings,
 *   withStacking({ stacking: 'normal', totalLabels: { enabled: true}, totalLabelRotation: 0, dataOptions, themeSettings }),
 * )(axis, axis2, axisMinMax, axis2MinMax, dataOptions, themeSettings);
 * ```
 */
export const withStacking =
  (config: StackingConfig) =>
  (axisSettings: AxisSettings[]): AxisSettings[] => {
    const { stacking, totalLabels = { enabled: false }, dataOptions, themeSettings } = config;

    if (!totalLabels.enabled && !stacking) {
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
        stackLabels: totalLabels.enabled
          ? {
              ...axisSettings.stackLabels,
              ...prepareStackLabels(totalLabels),
              formatter: getStackingLabelsFormatter(numberFormatConfig, 'normal', true),
              style: {
                ...stackTotalFontStyleDefault,
                ...(themeSettings ? { color: themeSettings.typography.primaryTextColor } : null),
              },
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
