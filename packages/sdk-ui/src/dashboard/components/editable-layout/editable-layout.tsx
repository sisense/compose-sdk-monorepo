import styled from '@emotion/styled';
import isNumber from 'lodash-es/isNumber';
import isUndefined from 'lodash-es/isUndefined';
import { DndContext, DragEndEvent, pointerWithin } from '@dnd-kit/core';

import { WidgetsPanelLayout } from '@/models';
import { WidgetProps } from '@/props';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Widget } from '@/widgets/widget';
import { ResizableRow } from './components/resizable-row';
import { ResizableColumns } from './components/resizable-columns';
import { updateLayoutAfterDragAndDrop, updateLayoutWidths, updateRowHeight } from './helpers';
import { useSyncedState } from '@/common/hooks/use-synced-state';
import { CellDropOverlay } from './components/cell-drop-overlay';
import { RowDropOverlay } from './components/row-drop-overlay';
import { DraggableWidgetWrapper } from './components/draggable-widget-wrapper';
import { getDraggingWidgetId, isEditableLayoutDragData, isEditableLayoutDropData } from './utils';
import {
  MAX_ROW_HEIGHT,
  MIN_CELL_WIDTH_PERCENTAGE,
  MIN_COL_WIDTH_PERCENTAGE,
  MIN_ROW_HEIGHT,
  WIDGET_HEADER_HEIGHT,
} from '@/dashboard/components/editable-layout/const';

const Wrapper = styled.div`
  overflow: hidden;
`;

const Cell = styled.div<{
  height?: string | number;
  isDragging: boolean;
  isDropping: boolean;
}>`
  overflow: hidden;
  position: relative;
  transition: transform 0.3s ease;
  opacity: ${({ isDragging }) => (isDragging ? 0.7 : 1)};
  transform: scale(${({ isDropping }) => (isDropping ? 0.9 : 1)});
  height: ${({ height }) =>
    isUndefined(height)
      ? 'auto'
      : isNumber(height)
      ? `calc(${height}px + 32px)`
      : `calc(${height} + 32px)`};
`;

const ColumnInner = styled.div`
  height: 100%;
`;

/**
 * Props for the {@link EditableLayout} component.
 *
 * @internal
 */
export interface EditableLayoutProps {
  /**
   * An object defining how the widgets should be laid out.
   */
  layout: WidgetsPanelLayout;

  /**
   * A list of widget props to render.
   */
  widgets: WidgetProps[];

  /**
   * A callback function that is called when the layout changes.
   */
  onLayoutChange?: (layout: WidgetsPanelLayout) => void;
}

/**
 * A React used to render a layout of widgets that can resize and rearrange their positions using drag-and-drop.
 *
 * @param props - {@link EditableLayoutProps}
 * @internal
 */
export const EditableLayout = ({ layout, widgets, onLayoutChange }: EditableLayoutProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggingWidgetId, setDraggingWidgetId] = useState<string | null>(null);
  const [internalLayout, setInternalLayout] = useSyncedState<WidgetsPanelLayout>(layout);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setIsDragging(false);
      setDraggingWidgetId(null);

      const dragData = event.active.data.current;
      const dropData = event.over?.data.current;
      if (
        internalLayout &&
        isEditableLayoutDragData(dragData) &&
        isEditableLayoutDropData(dropData)
      ) {
        const changedLayout = updateLayoutAfterDragAndDrop(internalLayout, dragData, dropData);
        onLayoutChange?.(changedLayout);
        setInternalLayout(changedLayout);
      }
    },
    [internalLayout, setInternalLayout, onLayoutChange],
  );

  const colWidths = useMemo(
    () => internalLayout.columns.map((c) => c.widthPercentage),
    [internalLayout],
  );

  useEffect(() => {
    // Dispatch a resize event to trigger Highcharts to recalculate chart sizes
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
  }, [internalLayout]);

  const onColumnWidthsChange = useCallback(
    (widths: number[]) => {
      const changedLayout = updateLayoutWidths(internalLayout, widths);
      onLayoutChange?.(changedLayout);
      setInternalLayout(changedLayout);
    },
    [internalLayout, onLayoutChange, setInternalLayout],
  );

  const onRowHeightChange = useCallback(
    (height: number, columnIndex: number, rowIndex: number) => {
      const changedLayout = updateRowHeight(
        internalLayout,
        height - WIDGET_HEADER_HEIGHT,
        columnIndex,
        rowIndex,
      );
      onLayoutChange?.(changedLayout);
      setInternalLayout(changedLayout);
    },
    [internalLayout, setInternalLayout, onLayoutChange],
  );

  const onCellWidthChange = useCallback(
    (widths: number[], columnIndex: number, rowIndex: number) => {
      const changedLayout = updateLayoutWidths(internalLayout, widths, columnIndex, rowIndex);
      onLayoutChange?.(changedLayout);
      setInternalLayout(changedLayout);
    },
    [internalLayout, setInternalLayout, onLayoutChange],
  );

  return (
    <Wrapper>
      <DndContext
        collisionDetection={pointerWithin}
        onDragStart={(event) => {
          setDraggingWidgetId(getDraggingWidgetId(event));
          setIsDragging(true);
        }}
        onDragEnd={handleDragEnd}
      >
        <ResizableColumns
          widths={colWidths}
          minColWidth={MIN_COL_WIDTH_PERCENTAGE}
          onWidthsChange={onColumnWidthsChange}
        >
          {internalLayout.columns.map((column, columnIndex) => (
            <ColumnInner key={columnIndex}>
              {column.rows?.map((row, rowIndex) => {
                const rowWidths = row.cells.map((sb) => sb.widthPercentage);
                return (
                  <ResizableRow
                    key={`${columnIndex},${rowIndex}`}
                    id={`${columnIndex},${rowIndex}`}
                    height={parseInt(`${row.cells[0]?.height ?? 0}`) + WIDGET_HEADER_HEIGHT}
                    minHeight={MIN_ROW_HEIGHT}
                    maxHeight={MAX_ROW_HEIGHT}
                    onHeightChange={(height) => onRowHeightChange(height, columnIndex, rowIndex)}
                  >
                    {isDragging && (
                      <RowDropOverlay
                        id={`${columnIndex}-${rowIndex}`}
                        columnIndex={columnIndex}
                        rowIndex={rowIndex}
                      />
                    )}
                    <ResizableColumns
                      widths={rowWidths}
                      minColWidth={MIN_CELL_WIDTH_PERCENTAGE}
                      onWidthsChange={(widths) => onCellWidthChange(widths, columnIndex, rowIndex)}
                    >
                      {row.cells.map((subcell) => {
                        const widgetProps = widgets.find((w) => w.id === subcell.widgetId);
                        if (
                          widgetProps?.widgetType === 'pivot' &&
                          subcell.height &&
                          widgetProps?.styleOptions?.isAutoHeight
                        ) {
                          widgetProps.styleOptions.isAutoHeight = false;
                        }
                        return (
                          <DraggableWidgetWrapper
                            key={`${subcell.widgetId}`}
                            id={`${subcell.widgetId}`}
                            data={{
                              columnIndex,
                              rowIndex: rowIndex,
                              widgetId: subcell.widgetId,
                            }}
                          >
                            <Cell
                              height={subcell.height}
                              isDragging={draggingWidgetId === subcell.widgetId}
                              isDropping={isDragging && draggingWidgetId !== subcell.widgetId}
                            >
                              {widgetProps && <Widget {...widgetProps} />}
                            </Cell>
                            {isDragging && draggingWidgetId !== subcell.widgetId && (
                              <CellDropOverlay
                                id={`${subcell.widgetId}`}
                                widgetId={subcell.widgetId}
                                columnIndex={columnIndex}
                                rowIndex={rowIndex}
                              />
                            )}
                          </DraggableWidgetWrapper>
                        );
                      })}
                    </ResizableColumns>
                  </ResizableRow>
                );
              })}
              {isDragging && (
                <RowDropOverlay id={`${columnIndex}`} columnIndex={columnIndex} isLastRow={true} />
              )}
            </ColumnInner>
          ))}
        </ResizableColumns>
      </DndContext>
    </Wrapper>
  );
};
