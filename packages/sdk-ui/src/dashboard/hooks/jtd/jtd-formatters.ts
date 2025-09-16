import type { JaqlPanel, PivotDataNode, PivotTreeNode } from '@sisense/sdk-pivot-client';
import { UserType } from '@sisense/sdk-pivot-client';
import type {
  CellFormattingResult,
  CustomDataCellFormatter,
  CustomHeaderCellFormatter,
} from '@/pivot-table/formatters/types';
import { JtdConfig, JtdDrillTarget, JtdPivotDrillTarget } from '@/widget-by-id/types';
import { AnyColumn } from '@/chart-data-options/types';

// Type guard to check if a drill target has pivot dimensions
function isPivotDrillTarget(target: JtdDrillTarget): target is JtdPivotDrillTarget {
  return 'pivotDimensions' in target;
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
    const hasMatchingDrillTarget = jtdConfig.drillTargets.some((target) => {
      if (!isPivotDrillTarget(target) || !target.pivotDimensions) {
        return false;
      }
      return target.pivotDimensions.some((dim: string) => dim === id);
    });

    if (!hasMatchingDrillTarget) {
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
 * @param jtdConfig - JTD configuration containing drill targets
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
    // Skip totals and subtotals - they shouldn't look like hyperlinks
    if (
      cell.userType === UserType.SUB_TOTAL ||
      cell.userType === UserType.GRAND_TOTAL ||
      cell.userType === UserType.CORNER
    ) {
      return; // Return void for cells that shouldn't be formatted
    }

    // Check if jaqlPanelItem instanceId matches any drill target
    const hasMatchingDrillTarget = jtdConfig.drillTargets.some((target) => {
      if (!isPivotDrillTarget(target) || !target.pivotDimensions) {
        return false;
      }
      return target.pivotDimensions.some((dim: string) => dim === id);
    });

    if (!hasMatchingDrillTarget) {
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
