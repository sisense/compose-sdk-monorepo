import { useCallback, useMemo, useEffect } from 'react';
import type { PivotBuilder, PivotTreeNode } from '@sisense/sdk-pivot-client';
import type { CompleteThemeSettings, PivotTableStyleOptions } from '@/types';
import type { PivotTableDataOptions, StyledColumn } from '@/chart-data-options/types';
import type { ContainerSize } from '@/dynamic-size-container/dynamic-size-container';
import { preparePivotStylingProps } from '../helpers/prepare-pivot-styling-props';

const DEFAULT_TABLE_ROWS_PER_PAGE = 25 as const;

type PivotRenderOptions = {
  /** Reference to the pivot table container. */
  nodeRef: React.RefObject<HTMLDivElement>;
  /** The pivot builder instance. */
  pivotBuilder: PivotBuilder;
  /** The pivot table data options. */
  dataOptions: PivotTableDataOptions;
  /** The pivot table style options. */
  styleOptions: PivotTableStyleOptions;
  /** The theme settings. */
  themeSettings: CompleteThemeSettings;
  /** The size of the pivot table container. */
  size: ContainerSize | null;
  /** Callback to handle total height change. */
  onTotalHeightChange?: (totalHeight: number) => void;
};

/**
 * A hook that renders the pivot table.
 */
export function useRenderPivot({
  nodeRef,
  pivotBuilder,
  dataOptions,
  styleOptions,
  themeSettings,
  size,
  onTotalHeightChange,
}: PivotRenderOptions): void {
  const onUpdatePredefinedColumnWidth = useCallback(
    (horizontalLastLevelsNodes: Array<PivotTreeNode>, resizedColumnWidth?: Array<number>) => {
      const dataOptionsFlatten = [
        ...(dataOptions.rows ? dataOptions.rows : []),
        ...(dataOptions.columns ? dataOptions.columns : []),
        ...(dataOptions.values ? dataOptions.values : []),
      ];

      const dataOptionsWidths = dataOptionsFlatten.map((i) => (i as StyledColumn)?.width);

      if (resizedColumnWidth) {
        const [nodeIndex, newWidth] = resizedColumnWidth;
        const node = horizontalLastLevelsNodes[nodeIndex];
        if (node && typeof node.jaqlIndex !== 'undefined') {
          dataOptionsWidths[node.jaqlIndex] = newWidth;
        }
      }

      const predefinedColumnWidth: Array<Array<number | undefined>> = [];
      horizontalLastLevelsNodes.forEach((columnNode, columnIndex) => {
        if (
          typeof columnNode.jaqlIndex !== 'undefined' &&
          typeof dataOptionsWidths[columnNode.jaqlIndex] !== 'undefined'
        ) {
          predefinedColumnWidth.push([
            columnIndex,
            dataOptionsWidths[columnNode.jaqlIndex] as number,
          ]);
        }
      });

      return predefinedColumnWidth;
    },
    [dataOptions],
  );

  const pivotStylingProps = useMemo(
    () => preparePivotStylingProps(styleOptions, themeSettings),
    [styleOptions, themeSettings],
  );

  const { rowsPerPage = DEFAULT_TABLE_ROWS_PER_PAGE } = styleOptions;

  const props = useMemo(() => {
    if (size) {
      return {
        width: size.width,
        height: size.height,
        isPaginated: true,
        itemsPerPage: rowsPerPage,
        isSelectedMode: true,
        onUpdatePredefinedColumnWidth,
        onTotalHeightChange,
        ...pivotStylingProps,
      };
    }
    return null;
  }, [size, rowsPerPage, onUpdatePredefinedColumnWidth, pivotStylingProps, onTotalHeightChange]);

  useEffect(() => {
    if (nodeRef.current && props) {
      const isPivotRendered = !!nodeRef.current.children.length;
      if (!isPivotRendered) {
        pivotBuilder.render(nodeRef.current, props);
      } else {
        pivotBuilder.updateProps(props);
      }
    }
  }, [nodeRef, pivotBuilder, props]);
}
