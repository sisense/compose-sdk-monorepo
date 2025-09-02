import { AxisSettings } from '@/chart-options-processor/translations/axis-section';
import { BuildContext } from '../../../../types';
import {
  applyFormatPlainText,
  getCompleteNumberFormatConfig,
} from '@/chart-options-processor/translations/number-format-config';
import { CompleteNumberFormatConfig } from '@/types';
import { stackTotalFontStyleDefault } from '@/chart-options-processor/defaults/cartesian';
import { Stacking } from '@/chart-options-processor/chart-options-service';
import { StackableChartTypes } from '../../types';

/**
 * Stacking configuration metadata
 */
interface StackingMeta {
  stacking?: Stacking;
  showTotal?: boolean;
}

/**
 * Builds stacking configuration metadata from stackable design options.
 * This is a simplified version that doesn't depend on chart type since all
 * stackable chart types (bar, column, area) use identical stacking logic.
 *
 * @param stackableOptions - Stackable chart design options
 * @returns Stacking metadata containing stacking type and showTotal flag
 */
const buildStackingMeta = (
  stackableOptions: BuildContext<StackableChartTypes>['designOptions'],
): StackingMeta => {
  const showTotal = stackableOptions.valueLabel ? stackableOptions.showTotal || false : false;

  switch (stackableOptions.stackType) {
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
 * Functional transformer that applies stacking-specific Y-axis enhancements.
 * This transformer adds stacking-related properties (stack labels, total labels, formatting)
 * to basic Y-axis settings for stackable charts (bar, column, area).
 *
 * This version is chart-type independent since all stackable chart types use identical stacking logic.
 *
 * @param ctx - Build context containing chart data, options, and configuration
 * @returns A function that transforms basic Y-axis settings to include stacking support
 *
 * @example
 * ```typescript
 * // Apply stacking enhancements to basic Y-axis
 * const basicYAxisSettings = getBasicYAxisSettings(ctx);
 * const stackedYAxis = withStacking(ctx)(basicYAxisSettings);
 * ```
 */
export const withStacking =
  (ctx: BuildContext<StackableChartTypes>) =>
  (basicYAxisSettings: AxisSettings[]): AxisSettings[] => {
    // Extract stacking options - no chart type needed since logic is identical for all stackable charts
    const stackableOptions = ctx.designOptions;

    // Build stacking metadata (chart-type independent)
    const stackingMeta: StackingMeta = buildStackingMeta(stackableOptions);
    const { stacking, showTotal = false } = stackingMeta;
    const totalLabelRotation = stackableOptions.totalLabelRotation ?? 0;

    // Early return if no stacking features are needed
    if (!showTotal && !stacking) {
      return basicYAxisSettings;
    }

    // Get number format configs for primary and secondary axes
    const cartesianDataOptions = ctx.dataOptions;
    const y1NumberFormatConfig = getCompleteNumberFormatConfig(
      cartesianDataOptions.y.find(({ showOnRightAxis }) => !showOnRightAxis)?.numberFormatConfig,
    );
    const y2NumberFormatConfig = getCompleteNumberFormatConfig(
      cartesianDataOptions.y.find(({ showOnRightAxis }) => showOnRightAxis)?.numberFormatConfig,
    );

    /**
     * Creates formatter function for stacking labels with proper number formatting
     */
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

    // Apply stacking-specific enhancements to each axis
    return basicYAxisSettings.map((axisSettings, index) => {
      const isSecondaryAxis = index === 1;
      const numberFormatConfig = isSecondaryAxis ? y2NumberFormatConfig : y1NumberFormatConfig;

      return {
        ...axisSettings,
        // Apply stacking-specific axis label formatting
        labels: stacking
          ? {
              ...axisSettings.labels,
              formatter: getStackingLabelsFormatter(numberFormatConfig, stacking),
            }
          : axisSettings.labels,
        // Apply stack labels configuration matching legacy functionality exactly
        stackLabels: showTotal
          ? {
              ...axisSettings.stackLabels,
              enabled: true,
              formatter: getStackingLabelsFormatter(numberFormatConfig, 'normal', true),
              style: {
                ...stackTotalFontStyleDefault,
                ...(ctx.extraConfig.themeSettings
                  ? { color: ctx.extraConfig.themeSettings.typography.primaryTextColor }
                  : null),
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
