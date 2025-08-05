import { AxisSettings } from '../../translations/axis-section';

/**
 * Apply label positioning adjustments based on spacing calculations
 */
export function applyLabelPositioning(
  xAxisSettings: AxisSettings[],
  yAxisSettings: AxisSettings[],
  rightShift: number,
  topShift: number,
  totalLabelRightSpacing: number,
  totalLabelTopSpacing: number,
): void {
  const ADDITIONAL_SPACING = 15;

  // Apply positioning to Y-axis stack labels
  yAxisSettings.forEach((axis) => {
    if (axis.stackLabels) {
      axis.stackLabels.x = rightShift;
      axis.stackLabels.y = topShift;
    }
  });

  // Apply positioning to X-axis plot band labels
  xAxisSettings.forEach((axis) => {
    axis.plotBands?.forEach((plotBand) => {
      if (plotBand.label) {
        if (plotBand.label.x === undefined) plotBand.label.x = 0;
        plotBand.label.x += totalLabelRightSpacing
          ? totalLabelRightSpacing + ADDITIONAL_SPACING
          : 0;
        if (plotBand.label.y === undefined) plotBand.label.y = 0;
        plotBand.label.y -= totalLabelTopSpacing ? totalLabelTopSpacing + ADDITIONAL_SPACING : 0;
      }
    });
  });
}

/**
 * Determine chart state information
 */
export function determineChartState(
  chartType: string,
  chartDesignOptions: any,
  stacking?: string,
): { treatNullDataAsZeros: boolean; isPolarChart: boolean; polarType?: any } {
  // Change null data to 0 for area stacked charts
  const treatNullDataAsZeros = chartType === 'area' && stacking !== undefined;

  // Determine if it's a polar chart
  let polarType: any = undefined;
  if ('polarType' in chartDesignOptions) {
    polarType = chartDesignOptions.polarType;
  }
  const isPolarChart = Boolean(polarType);

  return {
    treatNullDataAsZeros,
    isPolarChart,
    polarType,
  };
}
