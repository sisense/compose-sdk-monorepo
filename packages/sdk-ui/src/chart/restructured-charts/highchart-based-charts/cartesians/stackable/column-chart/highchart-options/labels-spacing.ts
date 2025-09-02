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

// Column chart specific spacing values (vertical spacing is used for columns)
enum ColumnTotalLabelVerticalSpacing {
  Small = 10,
  Medium = 30,
  Large = 40,
}

/**
 * Calculate spacing for column chart total labels based on rotation.
 * Column charts only use top spacing as they have horizontal orientation.
 */
export function getColumnChartSpacingForTotalLabels(
  chartDesignOptions: StackableChartDesignOptions,
): {
  rightSpacing: number;
  topSpacing: number;
} {
  const rightSpacing = 0; // Column charts don't use right spacing for total labels
  let topSpacing = 0;

  if (chartDesignOptions.showTotal && chartDesignOptions.stackType === 'stack100') {
    const rotation =
      Math.abs(chartDesignOptions.totalLabelRotation || 0) % ROTATION_CALCULATION.FULL_ROTATION;

    if (rotation < LABEL_ROTATION_THRESHOLD.HORIZONTAL) {
      topSpacing = ColumnTotalLabelVerticalSpacing.Small;
    } else if (rotation < LABEL_ROTATION_THRESHOLD.DIAGONAL) {
      topSpacing = ColumnTotalLabelVerticalSpacing.Medium;
    } else if (rotation < LABEL_ROTATION_THRESHOLD.VERTICAL) {
      topSpacing = ColumnTotalLabelVerticalSpacing.Large;
    } else if (rotation < LABEL_ROTATION_THRESHOLD.INVERTED_DIAGONAL) {
      topSpacing = ColumnTotalLabelVerticalSpacing.Medium;
    } else {
      topSpacing = ColumnTotalLabelVerticalSpacing.Small;
    }
  }

  return { rightSpacing, topSpacing };
}
