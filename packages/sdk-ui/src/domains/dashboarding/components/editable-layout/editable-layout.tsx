import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DndContext, DragEndEvent, pointerWithin } from '@dnd-kit/core';
import flow from 'lodash-es/flow';
import isNumber from 'lodash-es/isNumber';
import isUndefined from 'lodash-es/isUndefined';

import { WIDGET_HEADER_HEIGHT } from '@/domains/dashboarding/components/editable-layout/const';
import { WidgetsPanelLayout } from '@/domains/dashboarding/dashboard-model';
import { withOptionallyDisabledAutoHeight } from '@/domains/dashboarding/utils';
import { Widget } from '@/domains/widgets/components/widget';
import { WidgetProps } from '@/domains/widgets/components/widget/types';
import { withHeaderMenuItem } from '@/domains/widgets/helpers/header-menu-utils';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import styled from '@/infra/styled';
import { useSyncedState } from '@/shared/hooks/use-synced-state';
import { composeTitleHandlers } from '@/shared/utils/combine-handlers';
import type { RenderTitleHandler } from '@/types';

import { CellDropOverlay } from './components/cell-drop-overlay';
import { DraggableWidgetWrapper } from './components/draggable-widget-wrapper';
import { EditableLayoutRow } from './components/editable-layout-row';
import { ResizableColumns } from './components/resizable-columns';
import { RowDropOverlay } from './components/row-drop-overlay';
import {
  deleteWidgetFromLayout,
  distributeEqualWidthInRow,
  getColumnMaxWidths,
  getColumnMinWidths,
  updateLayoutAfterDragAndDrop,
  updateLayoutWidths,
  updateRowHeight,
} from './helpers';
import { getDraggingWidgetId, isEditableLayoutDragData, isEditableLayoutDropData } from './utils';

/**
 * Adds the drag-handle renderTitle handler before the widget's existing one.
 * Order matters: drag handle runs first so the title area is wrapped for DnD.
 * @param withDragHandle - The renderTitle handler to add before the widget's existing one.
 * @returns A function that adds the drag-handle renderTitle handler before the widget's existing one.
 */
const withDragHandleInTitle =
  (withDragHandle: RenderTitleHandler) =>
  (props: Readonly<WidgetProps>): WidgetProps => {
    const existingHeader = props.styleOptions?.header;
    const styleOptions = {
      ...props.styleOptions,
      header: {
        ...(existingHeader ?? {}),
        renderTitle: composeTitleHandlers(withDragHandle, existingHeader?.renderTitle),
      },
    };
    return { ...props, styleOptions } as WidgetProps;
  };

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

  /**
   * The configuration for the editable layout.
   */
  config?: {
    /**
     * Flag indicating whether the drag handle icon is visible.
     *
     * @default true
     */
    showDragHandleIcon?: boolean;
  };
}

/**
 * A React used to render a layout of widgets that can resize and rearrange their positions using drag-and-drop.
 *
 * @param props - {@link EditableLayoutProps}
 * @internal
 */
export const EditableLayout = ({
  layout,
  widgets,
  onLayoutChange,
  config,
}: EditableLayoutProps) => {
  const { themeSettings } = useThemeContext();
  const { t } = useTranslation();
  const { showDragHandleIcon = true } = useMemo(() => config ?? {}, [config]);

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

  const onCellDelete = useCallback(
    (columnIndex: number, rowIndex: number, widgetId: string) => {
      const changedLayout = deleteWidgetFromLayout(internalLayout, columnIndex, rowIndex, widgetId);
      onLayoutChange?.(changedLayout);
      setInternalLayout(changedLayout);
    },
    [internalLayout, setInternalLayout, onLayoutChange],
  );

  const onCellDistributeEqualWidth = useCallback(
    (columnIndex: number, rowIndex: number) => {
      const changedLayout = distributeEqualWidthInRow(internalLayout, columnIndex, rowIndex);
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
        <ResizableColumns widths={colWidths} onWidthsChange={onColumnWidthsChange}>
          {internalLayout.columns.map((column, columnIndex) => (
            <ColumnInner key={columnIndex}>
              {column.rows?.map((row, rowIndex) => {
                const visibleCells = row.cells.filter((c) => !c.hidden);
                const skipRow = visibleCells.length === 0;
                const equalWidthCells = visibleCells.length < row.cells.length;
                const rowWidths = visibleCells.map((sb) =>
                  equalWidthCells ? 100 / visibleCells.length : sb.widthPercentage,
                );

                if (skipRow) {
                  return null;
                }

                return (
                  <EditableLayoutRow
                    row={row}
                    widgets={widgets}
                    onHeightChange={(height) => onRowHeightChange(height, columnIndex, rowIndex)}
                    key={`${columnIndex},${rowIndex}`}
                    id={`${columnIndex},${rowIndex}`}
                  >
                    {(isAutoHeightRow) => (
                      <>
                        {isDragging && (
                          <RowDropOverlay
                            id={`${columnIndex}-${rowIndex}`}
                            columnIndex={columnIndex}
                            rowIndex={rowIndex}
                          />
                        )}

                        <ResizableColumns
                          disableResize={equalWidthCells}
                          widths={rowWidths}
                          minColWidths={getColumnMinWidths(row)}
                          maxColWidths={getColumnMaxWidths(row)}
                          onWidthsChange={(widths) =>
                            onCellWidthChange(widths, columnIndex, rowIndex)
                          }
                        >
                          {visibleCells.map((subcell) => {
                            const foundWidgetProps = widgets.find((w) => w.id === subcell.widgetId);
                            if (!foundWidgetProps) {
                              return null;
                            }

                            const widgetProps = !isAutoHeightRow
                              ? withOptionallyDisabledAutoHeight(foundWidgetProps, true)
                              : foundWidgetProps;

                            return (
                              <DraggableWidgetWrapper
                                key={`${subcell.widgetId}`}
                                id={`${subcell.widgetId}`}
                                data={{
                                  columnIndex,
                                  rowIndex: rowIndex,
                                  widgetId: subcell.widgetId,
                                }}
                                dragHandleOptions={{
                                  icon: {
                                    visible: showDragHandleIcon,
                                    color: themeSettings.widget.header.titleTextColor,
                                  },
                                }}
                              >
                                {(withDragHandle) => (
                                  <>
                                    <Cell
                                      height={isAutoHeightRow ? 'auto' : subcell.height}
                                      isDragging={draggingWidgetId === subcell.widgetId}
                                      isDropping={
                                        isDragging && draggingWidgetId !== subcell.widgetId
                                      }
                                    >
                                      {(() => {
                                        const customizedProps = flow(
                                          withHeaderMenuItem({
                                            id: 'editable-layout-delete',
                                            caption: t('widgetHeader.menu.deleteWidget'),
                                            onClick: () =>
                                              onCellDelete(columnIndex, rowIndex, subcell.widgetId),
                                          }),
                                          withHeaderMenuItem({
                                            id: 'editable-layout-distribute',
                                            caption: t('widgetHeader.menu.distributeEqualWidth'),
                                            onClick: () =>
                                              onCellDistributeEqualWidth(columnIndex, rowIndex),
                                          }),
                                          withDragHandleInTitle(withDragHandle),
                                        )(widgetProps);
                                        return <Widget {...customizedProps} />;
                                      })()}
                                    </Cell>
                                    {isDragging && draggingWidgetId !== subcell.widgetId && (
                                      <CellDropOverlay
                                        id={`${subcell.widgetId}`}
                                        widgetId={subcell.widgetId}
                                        columnIndex={columnIndex}
                                        rowIndex={rowIndex}
                                      />
                                    )}
                                  </>
                                )}
                              </DraggableWidgetWrapper>
                            );
                          })}
                        </ResizableColumns>
                      </>
                    )}
                  </EditableLayoutRow>
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
