import { StackableChartDesignOptions } from '@/chart-options-processor/translations/design-options';

// Rotation angle thresholds for total label spacing calculations
const LABEL_ROTATION_THRESHOLD = {
  HORIZONTAL: 20, // Labels are nearly horizontal
  DIAGONAL: 70, // Labels are diagonal
  VERTICAL: 110, // Labels are nearly vertical
  INVERTED_DIAGONAL: 160, // Labels are inverted diagonal
} as const;

// Rotation calculation constants
const ROTATION_CALCULATION = {
  FULL_ROTATION: 180, // Full rotation angle for modulo calculation
} as const;

// Bar chart specific spacing values
enum BarTotalLabelHorizontalSpacing {
  Small = 15,
  Medium = 25,
  Large = 40,
}

/**
 * Calculate spacing for bar chart total labels based on rotation.
 * Bar charts only use horizontal spacing as they have vertical orientation.
 */
export function getBarChartSpacingForTotalLabels(chartDesignOptions: StackableChartDesignOptions): {
  rightSpacing: number;
  topSpacing: number;
} {
  let rightSpacing = 0;
  const topSpacing = 0; // Bar charts don't use top spacing for total labels

  if (chartDesignOptions.totalLabels?.enabled && chartDesignOptions.stackType === 'stack100') {
    const rotation =
      Math.abs(chartDesignOptions.totalLabels.rotation || 0) % ROTATION_CALCULATION.FULL_ROTATION;

    if (rotation < LABEL_ROTATION_THRESHOLD.HORIZONTAL) {
      rightSpacing = BarTotalLabelHorizontalSpacing.Large;
    } else if (rotation < LABEL_ROTATION_THRESHOLD.DIAGONAL) {
      rightSpacing = BarTotalLabelHorizontalSpacing.Medium;
    } else if (rotation < LABEL_ROTATION_THRESHOLD.VERTICAL) {
      rightSpacing = BarTotalLabelHorizontalSpacing.Small;
    } else if (rotation < LABEL_ROTATION_THRESHOLD.INVERTED_DIAGONAL) {
      rightSpacing = BarTotalLabelHorizontalSpacing.Medium;
    } else {
      rightSpacing = BarTotalLabelHorizontalSpacing.Large;
    }
  }

  return { rightSpacing, topSpacing };
}
