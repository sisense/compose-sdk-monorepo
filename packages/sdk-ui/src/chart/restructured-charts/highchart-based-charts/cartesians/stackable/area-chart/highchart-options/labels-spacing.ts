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

// Area chart specific spacing values (vertical spacing is used for areas like columns)
enum AreaTotalLabelVerticalSpacing {
  Small = 10,
  Medium = 30,
  Large = 40,
}

/**
 * Calculate spacing for area chart total labels based on rotation.
 */
export function getAreaChartSpacingForTotalLabels(
  chartDesignOptions: StackableChartDesignOptions,
): {
  rightSpacing: number;
  topSpacing: number;
} {
  const rightSpacing = 0; // Area charts don't use right spacing for total labels
  let topSpacing = 0;

  if (chartDesignOptions.totalLabels?.enabled && chartDesignOptions.stackType === 'stack100') {
    const rotation =
      Math.abs(chartDesignOptions.totalLabels.rotation || 0) % ROTATION_CALCULATION.FULL_ROTATION;

    if (rotation < LABEL_ROTATION_THRESHOLD.HORIZONTAL) {
      topSpacing = AreaTotalLabelVerticalSpacing.Small;
    } else if (rotation < LABEL_ROTATION_THRESHOLD.DIAGONAL) {
      topSpacing = AreaTotalLabelVerticalSpacing.Medium;
    } else if (rotation < LABEL_ROTATION_THRESHOLD.VERTICAL) {
      topSpacing = AreaTotalLabelVerticalSpacing.Large;
    } else if (rotation < LABEL_ROTATION_THRESHOLD.INVERTED_DIAGONAL) {
      topSpacing = AreaTotalLabelVerticalSpacing.Medium;
    } else {
      topSpacing = AreaTotalLabelVerticalSpacing.Small;
    }
  }

  return { rightSpacing, topSpacing };
}
