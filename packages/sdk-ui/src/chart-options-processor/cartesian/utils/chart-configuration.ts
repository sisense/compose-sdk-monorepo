import { ChartDesignOptions } from '@/chart-options-processor/translations/types';

import { AxisSettings } from '../../translations/axis-section';

/**
 * Configuration for Y-axis label positioning adjustments
 */
type YAxisLabelPositioningConfig = {
  readonly rightShift: number;
  readonly topShift: number;
};

/**
 * Configuration for X-axis label positioning adjustments
 */
type XAxisLabelPositioningConfig = {
  readonly totalLabelRightSpacing: number;
  readonly totalLabelTopSpacing: number;
};

/**
 * Higher-order function to apply stack label positioning to a Y-axis settings object
 */
const withStackLabelPositioning =
  (rightShift: number, topShift: number) =>
  (axis: AxisSettings): AxisSettings => {
    if (!axis.stackLabels) {
      return axis;
    }

    return {
      ...axis,
      stackLabels: {
        ...axis.stackLabels,
        x: (axis.stackLabels.x ?? 0) + rightShift,
        y: (axis.stackLabels.y ?? 0) + topShift,
      },
    };
  };

/**
 * Higher-order function to apply plot band label positioning to an X-axis settings object
 */
const withPlotBandLabelPositioning =
  (totalLabelRightSpacing: number, totalLabelTopSpacing: number) =>
  (axis: AxisSettings): AxisSettings => {
    if (!axis.plotBands?.length) {
      return axis;
    }

    const ADDITIONAL_SPACING = 15;

    const updatedPlotBands = axis.plotBands.map((plotBand) => {
      if (!plotBand.label) {
        return plotBand;
      }

      const currentX = plotBand.label.x ?? 0;
      const currentY = plotBand.label.y ?? 0;

      const xAdjustment = totalLabelRightSpacing ? totalLabelRightSpacing + ADDITIONAL_SPACING : 0;

      const yAdjustment = totalLabelTopSpacing ? totalLabelTopSpacing + ADDITIONAL_SPACING : 0;

      return {
        ...plotBand,
        label: {
          ...plotBand.label,
          x: currentX + xAdjustment,
          y: currentY - yAdjustment,
        },
      };
    });

    return {
      ...axis,
      plotBands: updatedPlotBands,
    };
  };

/**
 * Higher-order function for Y-axis label positioning adjustments.
 * Returns a function that transforms Y-axis settings without mutating the input parameters.
 *
 * @example
 * const positionYAxisLabels = withYAxisLabelPositioning({ rightShift: 10, topShift: 20 });
 * const updatedSettings = positionYAxisLabels(yAxisSettings);
 */
export function withYAxisLabelPositioning(
  config: YAxisLabelPositioningConfig,
): (yAxisSettings: AxisSettings[]) => AxisSettings[] {
  return (yAxisSettings: AxisSettings[]) =>
    yAxisSettings.map(withStackLabelPositioning(config.rightShift, config.topShift));
}

/**
 * Higher-order function for X-axis label positioning adjustments.
 * Returns a function that transforms X-axis settings without mutating the input parameters.
 *
 * @example
 * const positionXAxisLabels = withXAxisLabelPositioning({ totalLabelRightSpacing: 15, totalLabelTopSpacing: 25 });
 * const updatedSettings = positionXAxisLabels(xAxisSettings);
 */
export function withXAxisLabelPositioning(
  config: XAxisLabelPositioningConfig,
): (xAxisSettings: AxisSettings[]) => AxisSettings[] {
  return (xAxisSettings: AxisSettings[]) =>
    xAxisSettings.map(
      withPlotBandLabelPositioning(config.totalLabelRightSpacing, config.totalLabelTopSpacing),
    );
}

/**
 * Determine chart state information
 */
export function determineChartState(
  chartType: string,
  chartDesignOptions: ChartDesignOptions,
  stacking?: string,
): { treatNullDataAsZeros: boolean; isPolarChart: boolean; polarType?: any } {
  // Change null data to 0 for area stacked charts
  const treatNullDataAsZeros = chartType === 'area' && stacking !== undefined;

  // Determine if it's a polar chart
  const polarType = 'polarType' in chartDesignOptions ? chartDesignOptions.polarType : undefined;

  const isPolarChart = Boolean(polarType);

  return {
    treatNullDataAsZeros,
    isPolarChart,
    polarType,
  };
}
