import { type JaqlPanel, UserType } from '@sisense/sdk-pivot-query-client';
import type { PivotDataNode, PivotTreeNode } from '@sisense/sdk-pivot-ui';

import type {
  CellFormattingResult,
  CustomDataCellFormatter,
  CustomHeaderCellFormatter,
} from '@/domains/visualizations/components/pivot-table/formatters/types';
import { AnyColumn } from '@/domains/visualizations/core/chart-data-options/types';
import { PivotTableDataPoint } from '@/types';

import { JtdConfig, JtdTarget, JtdTargetInner, PivotDimId } from './jtd-types.js';

// Type guard to check if a jump target has pivot dimensions (for backward compatibility)
function isPivotJumpTarget(
  target: JtdTargetInner,
): target is JtdTarget & { pivotDimensions?: PivotDimId[] } {
  return 'pivotDimensions' in target && Array.isArray(target.pivotDimensions);
}

/**
 * Core business logic for determining JTD actionability
 * @param jtdConfig - The JTD configuration
 * @param hasMatchingTarget - Whether a matching target was found
 * @returns Object with actionable status and matching target
 * @internal
 */
function getJtdActionabilityResult(
  jtdConfig: JtdConfig,
  matchingTarget?: JtdTarget,
): { isActionable: boolean; matchingTarget?: JtdTarget } {
  if (!jtdConfig.enabled || jtdConfig.jumpTargets.length === 0) {
    return { isActionable: false };
  }

  if (matchingTarget) {
    return { isActionable: true, matchingTarget };
  }

  // Check if dimension-specific targets exist
  const hasAnyPivotTargets = jtdConfig.jumpTargets.some(
    (target) =>
      isPivotJumpTarget(target) && target.pivotDimensions && target.pivotDimensions.length > 0,
  );

  if (hasAnyPivotTargets) {
    // If we have dimension-specific targets but none match, not actionable
    return { isActionable: false };
  } else {
    // No dimension-specific targets configured - use first available target (fallback behavior)
    return {
      isActionable: true,
      matchingTarget: jtdConfig.jumpTargets[0],
    };
  }
}

/**
 * Check if a formatter cell ID is actionable for JTD
 * Used by hyperlink formatters with cell IDs like "rows.0", "columns.1", "values.2"
 *
 * @param jtdConfig - The JTD configuration
 * @param cellId - The cell ID from formatters (e.g., "rows.0")
 * @returns Object with actionable status and matching target
 * @internal
 */
export function getPivotFormatterCellActionability(
  jtdConfig: JtdConfig,
  cellId: string,
): { isActionable: boolean; matchingTarget?: JtdTarget } {
  // Early exit for empty cell ID
  if (!cellId) {
    return { isActionable: false };
  }

  // Find matching pivot target by direct cell ID matching
  const matchingTarget = jtdConfig.jumpTargets.find((target) => {
    if (!isPivotJumpTarget(target) || !target.pivotDimensions) {
      return false;
    }
    return target.pivotDimensions.includes(cellId as PivotDimId);
  });

  return getJtdActionabilityResult(jtdConfig, matchingTarget);
}

/**
 * Find all matching jump targets for a pivot point
 * Used internally to support both single and multiple target scenarios
 *
 * @param jtdConfig - The JTD configuration
 * @param pivotPoint - The pivot data point from click handlers
 * @returns Array of matching targets
 * @internal
 */
function findAllMatchingPivotTargets(
  jtdConfig: JtdConfig,
  pivotPoint: PivotTableDataPoint,
): JtdTarget[] {
  // Only data cells should be clickable, not headers or totals
  if (!pivotPoint.isDataCell || pivotPoint.isCaptionCell) {
    return [];
  }

  const entries = pivotPoint.entries || { rows: [], columns: [], values: [] };

  // Extract dimension ID with priority: values > columns > rows
  // Generate the dimension ID based on the array position (e.g., "values.0", "columns.1", "rows.2")
  let targetDimensionId: string | undefined;
  if (entries.values?.length) {
    targetDimensionId = `values.${entries.values.length - 1}`;
  } else if (entries.columns?.length) {
    targetDimensionId = `columns.${entries.columns.length - 1}`;
  } else if (entries.rows?.length) {
    targetDimensionId = `rows.${entries.rows.length - 1}`;
  }

  if (!targetDimensionId) {
    return [];
  }

  // Find all matching targets by direct ID matching
  return jtdConfig.jumpTargets.filter((target) => {
    if (!isPivotJumpTarget(target) || !target.pivotDimensions) {
      return false;
    }

    // Direct ID matching - the targetDimensionId should match pivotDimensions
    return target.pivotDimensions.includes(targetDimensionId as PivotDimId);
  });
}

/**
 * Check if a click handler pivot point is actionable for JTD
 * Used by click handlers with pivot data points containing custom dimension IDs
 *
 * @param jtdConfig - The JTD configuration
 * @param pivotPoint - The pivot data point from click handlers
 * @returns Object with actionable status and matching target
 * @internal
 */
export function isPivotClickHandlerActionable(
  jtdConfig: JtdConfig,
  pivotPoint: PivotTableDataPoint,
): { isActionable: boolean; matchingTarget?: JtdTarget } {
  if (!jtdConfig.enabled || jtdConfig.jumpTargets.length === 0) {
    return { isActionable: false };
  }

  const matchingTargets = findAllMatchingPivotTargets(jtdConfig, pivotPoint);

  return {
    isActionable: matchingTargets.length > 0,
    matchingTarget: matchingTargets[0], // Return first target when match found
  };
}

/**
 * Find all actionable jump targets for a pivot point (for right-click menus)
 * Used by right-click handlers that need to show multiple targets
 *
 * @param jtdConfig - The JTD configuration
 * @param pivotPoint - The pivot data point from click handlers
 * @returns Object with actionable status and all matching targets
 * @internal
 *
 * @example
 * ```typescript
 * // Usage in right-click menu handler for pivot tables
 * const onPivotRightClick = (pivotPoint: PivotTableDataPoint) => {
 *   const { isActionable, matchingTargets } = findAllActionablePivotTargets(jtdConfig, pivotPoint);
 *
 *   if (!isActionable) {
 *     return; // No menu - headers are not clickable or no valid targets
 *   }
 *
 *   // Only valid targets are returned:
 *   // - Targets with matching pivot dimensions for this cell
 *   // - NEVER targets with non-matching pivot dimensions
 *   const menuItems = matchingTargets.map(target => ({
 *     caption: target.caption,
 *     onClick: () => handleJumpToDashboard(target, pivotPoint)
 *   }));
 *
 *   openContextMenu({ items: menuItems });
 * };
 * ```
 */
export function getPivotTargetActionability(
  jtdConfig: JtdConfig,
  pivotPoint: PivotTableDataPoint,
): { isActionable: boolean; matchingTargets: JtdTarget[] } {
  if (!jtdConfig.enabled || jtdConfig.jumpTargets.length === 0) {
    return { isActionable: false, matchingTargets: [] };
  }

  const matchingTargets = findAllMatchingPivotTargets(jtdConfig, pivotPoint);

  return {
    isActionable: matchingTargets.length > 0,
    matchingTargets,
  };
}

/**
 * Creates a data cell formatter that applies hyperlink styling for JTD navigation
 *
 * @param hyperlinkColor - The color to use for hyperlink text (uses theme's hyperlinkColor
 * @returns Data cell formatter function
 * @internal
 */
export function createJtdHyperlinkDataCellFormatter(
  hyperlinkColor: string,
  jtdConfig: JtdConfig,
): CustomDataCellFormatter {
  return (
    cell: PivotDataNode,
    jaqlPanelItem: JaqlPanel,
    dataOption: AnyColumn,
    id: string,
  ): CellFormattingResult | void => {
    if (!dataOption) {
      return;
    }

    // Use formatter-specific logic to determine if cell should be actionable
    const { isActionable } = getPivotFormatterCellActionability(jtdConfig, id);

    if (!isActionable) {
      return;
    }

    // Return formatting information instead of mutating the cell
    return {
      style: {
        color: hyperlinkColor,
        cursor: 'pointer',
      },
    };
  };
}

/**
 * Creates a header cell formatter that applies hyperlink styling for JTD navigation
 *
 * @param hyperlinkColor - The color to use for hyperlink text (uses theme's hyperlinkColor or defaults to DEFAULT_HYPERLINK_COLOR)
 * @param jtdConfig - JTD configuration containing jump targets
 * @returns A header cell formatter that applies hyperlink styling to matching header cells
 */
export function createJtdHyperlinkHeaderCellFormatter(
  hyperlinkColor: string,
  jtdConfig: JtdConfig,
): CustomHeaderCellFormatter {
  return (
    cell: PivotTreeNode,
    jaqlPanelItem: JaqlPanel | undefined,
    dataOption?: AnyColumn,
    id?: string,
  ): CellFormattingResult | void => {
    if (!dataOption) {
      return;
    }
    if (!jaqlPanelItem) {
      return;
    }
    if (jaqlPanelItem.panel === 'measures') {
      return;
    }
    if (!id) {
      return;
    }
    // Skip totals and subtotals - they shouldn't look like hyperlinks
    if (
      cell.userType === UserType.SUB_TOTAL ||
      cell.userType === UserType.GRAND_TOTAL ||
      cell.userType === UserType.CORNER
    ) {
      return; // Return void for cells that shouldn't be formatted
    }

    // Use formatter-specific logic to determine if cell should be actionable
    const { isActionable } = getPivotFormatterCellActionability(jtdConfig, id);

    if (!isActionable) {
      return;
    }
    // Return formatting information instead of mutating the cell
    return {
      style: {
        color: hyperlinkColor,
        cursor: 'pointer',
      },
    };
  };
}
