import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  EVENT_PIVOT_ELEMENT_CHANGE,
  type PivotBuilder,
  type PivotTreeNode,
} from '@sisense/sdk-pivot-client';

import type { PivotTableDataOptionsInternal, StyledColumn } from '@/chart-data-options/types';
import type { ContainerSize } from '@/dynamic-size-container/dynamic-size-container';
import { PivotTableDataPointEventHandler } from '@/props';
import type { CompleteThemeSettings, PivotTableStyleOptions } from '@/types';

import { preparePivotStylingProps } from '../helpers/prepare-pivot-styling-props';
import { useApplyPivotTableCellEvents } from './use-apply-pivot-table-cell-events';

type PivotRenderOptions = {
  /** The pivot builder instance. */
  pivotBuilder: PivotBuilder;
  /** The pivot table data options. */
  dataOptions: PivotTableDataOptionsInternal;
  /** The pivot table style options. */
  styleOptions: PivotTableStyleOptions;
  /** The theme settings. */
  themeSettings: CompleteThemeSettings;
  /** The size of the pivot table container. */
  size: ContainerSize | null;
  /** Callback to handle total height change. */
  onTotalHeightChange?: (totalHeight: number) => void;
  /** Callback to handle data point click. */
  onDataPointClick?: PivotTableDataPointEventHandler;
  /** Callback to handle data point context menu. */
  onDataPointContextMenu?: PivotTableDataPointEventHandler;
  /** The page size */
  pageSize: number;
  /** Callback to handle page size. */
  onPageSizeChange: (newPageSize: number) => void;
};

/**
 * A hook that renders the pivot table.
 */
export function useRenderPivot({
  pivotBuilder,
  dataOptions,
  styleOptions,
  themeSettings,
  size,
  onTotalHeightChange,
  onDataPointClick,
  onDataPointContextMenu,
  pageSize,
  onPageSizeChange,
}: PivotRenderOptions): {
  pivotElement: JSX.Element | null;
} {
  const [pivotElement, setPivotElement] = useState<React.ReactElement | null>(null);

  const { handlePivotTableCellClick } = useApplyPivotTableCellEvents({
    dataOptions,
    onDataPointClick,
    onDataPointContextMenu,
  });
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

  const props = useMemo(() => {
    if (size) {
      return {
        width: size.width,
        height: size.height,
        isPaginated: true,
        itemsPerPage: pageSize,
        isSelectedMode: true,
        onUpdatePredefinedColumnWidth,
        onItemsPerPageChange: onPageSizeChange,
        onTotalHeightChange,
        onCellClick: handlePivotTableCellClick,
        ...pivotStylingProps,
      };
    }
    return null;
  }, [
    size,
    pageSize,
    onUpdatePredefinedColumnWidth,
    pivotStylingProps,
    onTotalHeightChange,
    onPageSizeChange,
    handlePivotTableCellClick,
  ]);

  useEffect(() => {
    pivotBuilder.on(EVENT_PIVOT_ELEMENT_CHANGE, setPivotElement);
    return () => {
      pivotBuilder.off(EVENT_PIVOT_ELEMENT_CHANGE, setPivotElement);
    };
  }, [pivotBuilder]);

  useEffect(() => {
    if (props) {
      pivotBuilder.render(props);
    }
  }, [pivotBuilder, props]);

  return {
    pivotElement,
  };
}
