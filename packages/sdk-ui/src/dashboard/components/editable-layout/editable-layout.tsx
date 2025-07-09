import styled from '@emotion/styled';
import isNumber from 'lodash-es/isNumber';
import isUndefined from 'lodash-es/isUndefined';
import { DndContext, DragEndEvent, pointerWithin } from '@dnd-kit/core';
import { MouseEvent } from 'react';

import { WidgetsPanelLayout } from '@/models';
import { WidgetProps } from '@/props';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Widget } from '@/widgets/widget';
import { ResizableRow } from './components/resizable-row';
import { ResizableColumns } from './components/resizable-columns';
import {
  deleteWidgetFromLayout,
  distributeEqualWidthInRow,
  getRowHeight,
  getRowMinHeight,
  getRowMaxHeight,
  getColumnMinWidths,
  getColumnMaxWidths,
  updateLayoutAfterDragAndDrop,
  updateLayoutWidths,
  updateRowHeight,
} from './helpers';
import { useSyncedState } from '@/common/hooks/use-synced-state';
import { CellDropOverlay } from './components/cell-drop-overlay';
import { RowDropOverlay } from './components/row-drop-overlay';
import { DraggableWidgetWrapper } from './components/draggable-widget-wrapper';
import {
  composeToolbarHandlers,
  composeTitleHandlers,
  getDraggingWidgetId,
  isEditableLayoutDragData,
  isEditableLayoutDropData,
} from './utils';
import { WIDGET_HEADER_HEIGHT } from '@/dashboard/components/editable-layout/const';
import { useThemeContext } from '@/theme-provider';
import { useMenu } from '@/common/hooks/use-menu';
import { MenuItemSection } from '@/types';
import { useTranslation } from 'react-i18next';
import { MenuButton } from '@/common/components/menu/menu-button';

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
  const { openMenu } = useMenu();
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

  const addWidgetContextMenu = useCallback(
    (columnIndex: number, rowIndex: number, widgetId: string) => {
      return (onRefresh: () => void, defaultToolbar: JSX.Element) => {
        const handleMenuClick = (event: MouseEvent<HTMLButtonElement>) => {
          event.stopPropagation();

          const menuItems: MenuItemSection[] = [
            {
              items: [
                {
                  caption: t('widgetHeader.menu.deleteWidget'),
                  onClick: () => onCellDelete(columnIndex, rowIndex, widgetId),
                },
                {
                  caption: t('widgetHeader.menu.distributeEqualWidth'),
                  onClick: () => onCellDistributeEqualWidth(columnIndex, rowIndex),
                },
              ],
            },
          ];

          openMenu({
            position: {
              left: event.clientX,
              top: event.clientY,
            },
            alignment: {
              horizontal: 'right',
            },
            itemSections: menuItems,
          });
        };

        return (
          <div className="csdk-flex csdk-items-center">
            {defaultToolbar}
            <MenuButton
              color={themeSettings.widget.header.titleTextColor}
              onClick={handleMenuClick}
              ariaLabel={'widget menu'}
            />
          </div>
        );
      };
    },
    [
      onCellDelete,
      onCellDistributeEqualWidth,
      openMenu,
      themeSettings.widget.header.titleTextColor,
      t,
    ],
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
                const rowWidths = row.cells.map((sb) => sb.widthPercentage);
                return (
                  <ResizableRow
                    key={`${columnIndex},${rowIndex}`}
                    id={`${columnIndex},${rowIndex}`}
                    height={getRowHeight(row, widgets) + WIDGET_HEADER_HEIGHT}
                    minHeight={getRowMinHeight(row)}
                    maxHeight={getRowMaxHeight(row)}
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
                      minColWidths={getColumnMinWidths(row)}
                      maxColWidths={getColumnMaxWidths(row)}
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
                          widgetProps && (
                            <DraggableWidgetWrapper
                              key={`${subcell.widgetId}`}
                              id={`${subcell.widgetId}`}
                              data={{
                                columnIndex,
                                rowIndex: rowIndex,
                                widgetId: subcell.widgetId,
                              }}
                              dragHandleOptions={{
                                icon:
                                  widgetProps.widgetType === 'text'
                                    ? { visible: false }
                                    : {
                                        visible: showDragHandleIcon,
                                        color: themeSettings.widget.header.titleTextColor,
                                      },
                              }}
                            >
                              {(withDragHandle) => (
                                <>
                                  <Cell
                                    height={subcell.height}
                                    isDragging={draggingWidgetId === subcell.widgetId}
                                    isDropping={isDragging && draggingWidgetId !== subcell.widgetId}
                                  >
                                    {widgetProps.widgetType === 'text' ? (
                                      withDragHandle(<Widget {...widgetProps} />)
                                    ) : (
                                      <Widget
                                        {...{
                                          ...widgetProps,
                                          styleOptions: {
                                            ...widgetProps?.styleOptions,
                                            header: {
                                              ...widgetProps?.styleOptions?.header,
                                              renderTitle: composeTitleHandlers(
                                                withDragHandle,
                                                widgetProps?.styleOptions?.header?.renderTitle,
                                              ),
                                              renderToolbar: composeToolbarHandlers(
                                                widgetProps?.styleOptions?.header?.renderToolbar,
                                                addWidgetContextMenu(
                                                  columnIndex,
                                                  rowIndex,
                                                  subcell.widgetId,
                                                ),
                                              ),
                                            },
                                          },
                                        }}
                                      />
                                    )}
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
                          )
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
