import { isLegendOnRight } from '@/chart-options-processor/translations/legend-section';

import { CartesianChartDataOptionsInternal } from '../../../chart-data-options/types';
import { CartesianChartData } from '../../../chart-data/types';
import { ChartType } from '../../../types';
import { StackableChartDesignOptions } from '../../translations/design-options';
import { ChartDesignOptions } from '../../translations/types';

const DEFAULT_CHART_SPACING = 20;

// Rotation angle thresholds for total label spacing calculations
const LABEL_ROTATION_THRESHOLD = {
  HORIZONTAL: 20, // Labels are nearly horizontal
  DIAGONAL: 70, // Labels are diagonal
  VERTICAL: 110, // Labels are nearly vertical
  INVERTED_DIAGONAL: 160, // Labels are inverted diagonal
} as const;

// Axis label spacing constants
const AXIS_LABEL_SPACING = {
  X_AXIS_VERTICAL_RIGHT: 70, // Right spacing when x-axis labels are vertical
  X_AXIS_HORIZONTAL_TOP: 20, // Top spacing when x-axis labels are horizontal
} as const;

// Total label shift constants
const TOTAL_LABEL_SHIFT = {
  TOP_DIVISOR: 2, // Divisor for calculating top shift
  RIGHT_SHIFT: 0.1, // Fixed right shift value
} as const;

// Legend constants
const LEGEND_SETTINGS = {
  RIGHT_MARGIN: 80, // Right margin for legend
} as const;

// Rotation calculation constants
const ROTATION_CALCULATION = {
  FULL_ROTATION: 180, // Full rotation angle for modulo calculation
} as const;

enum TotalLabelVerticalSpacing {
  Small = 10,
  Medium = 30,
  Large = 40,
}

enum TotalLabelHorizontalSpacing {
  Small = 15,
  Medium = 25,
  Large = 40,
}

/**
 * Configuration for chart spacing calculations
 */
interface SpacingConfig {
  chartType: ChartType;
  chartData: CartesianChartData;
  chartDesignOptions: ChartDesignOptions;
  xAxisOrientation: 'horizontal' | 'vertical';
}

/**
 * Result of spacing calculations
 */
interface SpacingResult {
  totalTopSpacing: number;
  totalRightSpacing: number;
  rightShift: number;
  topShift: number;
}

/**
 * Get additional spacing around chart needed for the total labels based on the chart type and design options.
 */
export function getChartSpacingForTotalLabels(
  chartType: ChartType,
  chartDesignOptions: StackableChartDesignOptions,
) {
  let rightSpacing = 0;
  let topSpacing = 0;

  if (chartDesignOptions.totalLabels?.enabled && chartDesignOptions.stackType === 'stack100') {
    const rotation =
      Math.abs(chartDesignOptions.totalLabels.rotation || 0) % ROTATION_CALCULATION.FULL_ROTATION;

    if (chartType === 'bar') {
      if (rotation < LABEL_ROTATION_THRESHOLD.HORIZONTAL) {
        rightSpacing = TotalLabelHorizontalSpacing.Large;
      } else if (rotation < LABEL_ROTATION_THRESHOLD.DIAGONAL) {
        rightSpacing = TotalLabelHorizontalSpacing.Medium;
      } else if (rotation < LABEL_ROTATION_THRESHOLD.VERTICAL) {
        rightSpacing = TotalLabelHorizontalSpacing.Small;
      } else if (rotation < LABEL_ROTATION_THRESHOLD.INVERTED_DIAGONAL) {
        rightSpacing = TotalLabelHorizontalSpacing.Medium;
      } else {
        rightSpacing = TotalLabelHorizontalSpacing.Large;
      }
    }

    if (chartType === 'column' || chartType === 'area') {
      if (rotation < LABEL_ROTATION_THRESHOLD.HORIZONTAL) {
        topSpacing = TotalLabelVerticalSpacing.Small;
      } else if (rotation < LABEL_ROTATION_THRESHOLD.DIAGONAL) {
        topSpacing = TotalLabelVerticalSpacing.Medium;
      } else if (rotation < LABEL_ROTATION_THRESHOLD.VERTICAL) {
        topSpacing = TotalLabelVerticalSpacing.Large;
      } else if (rotation < LABEL_ROTATION_THRESHOLD.INVERTED_DIAGONAL) {
        topSpacing = TotalLabelVerticalSpacing.Medium;
      } else {
        topSpacing = TotalLabelVerticalSpacing.Small;
      }
    }
  }

  return { rightSpacing, topSpacing };
}

/**
 * Get the shift for the total labels based on the chart type and design options.
 */
function getTotalLabelsShift(
  chartType: ChartType,
  chartDesignOptions: StackableChartDesignOptions,
) {
  const { rightSpacing, topSpacing } = getChartSpacingForTotalLabels(chartType, chartDesignOptions);
  let rightShift = 0;
  let topShift = 0;

  if (topSpacing > 0) {
    topShift = -1 * (topSpacing / TOTAL_LABEL_SHIFT.TOP_DIVISOR);
  }
  if (rightSpacing > 0) {
    rightShift = TOTAL_LABEL_SHIFT.RIGHT_SHIFT;
  }

  return { rightShift, topShift };
}

/**
 * Calculate spacing requirements for axis labels
 */
function calculateAxisLabelSpacing(config: SpacingConfig): {
  rightSpacing: number;
  topSpacing: number;
} {
  const { chartData, chartDesignOptions, xAxisOrientation } = config;

  // X-axis label spacing calculations
  const xAxisLabelRightSpacing =
    !isLegendOnRight(chartDesignOptions.legend) &&
    chartData.xAxisCount > 1 &&
    xAxisOrientation === 'vertical'
      ? AXIS_LABEL_SPACING.X_AXIS_VERTICAL_RIGHT
      : 0;

  const xAxisLabelTopSpacing =
    chartData.xAxisCount > 1 && xAxisOrientation === 'horizontal'
      ? AXIS_LABEL_SPACING.X_AXIS_HORIZONTAL_TOP
      : 0;

  return {
    rightSpacing: xAxisLabelRightSpacing,
    topSpacing: xAxisLabelTopSpacing,
  };
}

/**
 * Calculate total label spacing
 */
function calculateTotalLabelSpacing(config: SpacingConfig): {
  rightSpacing: number;
  topSpacing: number;
} {
  const { chartType, chartDesignOptions } = config;
  return getChartSpacingForTotalLabels(
    chartType,
    chartDesignOptions as StackableChartDesignOptions,
  );
}

/**
 * Calculate complete spacing configuration for a cartesian chart
 */
export function calculateChartSpacing(config: SpacingConfig): SpacingResult {
  const axisLabelSpacing = calculateAxisLabelSpacing(config);
  const totalLabelSpacing = calculateTotalLabelSpacing(config);
  const labelShifts = getTotalLabelsShift(
    config.chartType,
    config.chartDesignOptions as StackableChartDesignOptions,
  );

  const totalTopSpacing =
    DEFAULT_CHART_SPACING + totalLabelSpacing.topSpacing + axisLabelSpacing.topSpacing;
  const totalRightSpacing =
    DEFAULT_CHART_SPACING + totalLabelSpacing.rightSpacing + axisLabelSpacing.rightSpacing;

  return {
    totalTopSpacing,
    totalRightSpacing,
    rightShift: labelShifts.rightShift,
    topShift: labelShifts.topShift,
  };
}

/**
 * Get additional legend settings based on the chart type and data options
 */
export function getAdditionalLegendSettings(
  chartType: ChartType,
  dataOptions: CartesianChartDataOptionsInternal,
  chartDesignOptions: ChartDesignOptions,
): { margin?: number } | undefined {
  if (
    chartType === 'bar' &&
    dataOptions.x.length > 1 &&
    isLegendOnRight(chartDesignOptions.legend)
  ) {
    return { margin: chartDesignOptions.legend?.margin ?? LEGEND_SETTINGS.RIGHT_MARGIN };
  }
  return undefined;
}

export type { SpacingConfig, SpacingResult };
