import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  EVENT_PIVOT_ELEMENT_CHANGE,
  type PivotBuilder,
  type PivotTreeNode,
} from '@sisense/sdk-pivot-client';

import type { PivotTableDataOptionsInternal, StyledColumn } from '@/chart-data-options/types';
import { AlertIcon } from '@/common/icons/alert-icon';
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
  /** Allow html in pivot table cells */
  allowHtml?: boolean;
  /** Sanitize html in pivot table cells */
  sanitizeHtml?: boolean;
  /** Whether the pivot table should take the full width of its container */
  isFullWidth?: boolean;
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
  /** The list of image columns */
  imageColumns?: number[];
  /** Boolean flag whether to always show the results per page select */
  alwaysShowResultsPerPage?: boolean;
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
  allowHtml,
  sanitizeHtml,
  onTotalHeightChange,
  onDataPointClick,
  onDataPointContextMenu,
  pageSize,
  onPageSizeChange,
  isFullWidth,
  imageColumns,
  alwaysShowResultsPerPage,
}: PivotRenderOptions): {
  pivotElement: JSX.Element | null;
} {
  const { t } = useTranslation();
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

  const paginationOptions = useMemo(() => {
    return {
      alertIcon: React.createElement(AlertIcon, {
        fill: themeSettings.general.brandColor,
        style: { marginLeft: 7 },
      }),
      notifyLimitsBaseNote: t('pivotTable.limits.baseNote'),
      notifyRowsLimitLabel: t('pivotTable.limits.rowsLimit'),
      notifyColumnsLimitLabel: t('pivotTable.limits.columnsLimit'),
      notifyRowsAndColumnsLimitLabel: t('pivotTable.limits.columnsAndRowsLimit'),
      notifyTooltipStyle: {
        fontFamily: themeSettings.typography.fontFamily,
        color: themeSettings.typography.secondaryTextColor,
        backgroundColor: themeSettings.chart.backgroundColor,
        fontSize: 13,
      },
    };
  }, [themeSettings, t]);

  const props = useMemo(() => {
    if (size) {
      return {
        width: size.width,
        height: size.height,
        isPaginated: true,
        itemsPerPage: pageSize,
        alwaysShowItemsPerPageSelect: alwaysShowResultsPerPage,
        isSelectedMode: true,
        allowHtml,
        isFullWidth,
        sanitizeHtml,
        imageColumns,
        onUpdatePredefinedColumnWidth,
        onItemsPerPageChange: onPageSizeChange,
        onTotalHeightChange,
        onCellClick: handlePivotTableCellClick,
        paginationOptions,
        ...pivotStylingProps,
      };
    }
    return null;
  }, [
    size,
    pageSize,
    allowHtml,
    isFullWidth,
    sanitizeHtml,
    onUpdatePredefinedColumnWidth,
    pivotStylingProps,
    onTotalHeightChange,
    onPageSizeChange,
    handlePivotTableCellClick,
    paginationOptions,
    imageColumns,
    alwaysShowResultsPerPage,
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
