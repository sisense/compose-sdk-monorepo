import { MouseEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DndContext, DragEndEvent, pointerWithin } from '@dnd-kit/core';
import isNumber from 'lodash-es/isNumber';
import isUndefined from 'lodash-es/isUndefined';

import { WIDGET_HEADER_HEIGHT } from '@/domains/dashboarding/components/editable-layout/const';
import { WidgetsPanelLayout } from '@/domains/dashboarding/dashboard-model';
import { withOptionallyDisabledAutoHeight } from '@/domains/dashboarding/utils';
import { Widget } from '@/domains/widgets/components/widget';
import { useMenu } from '@/infra/contexts/menu-provider/hooks/use-menu';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import styled from '@/infra/styled';
import { WidgetProps } from '@/props';
import { MenuButton } from '@/shared/components/menu/menu-button';
import { useSyncedState } from '@/shared/hooks/use-synced-state';
import {
  composeTextWidgetToolbarHandlers,
  composeTitleHandlers,
  composeToolbarHandlers,
} from '@/shared/utils/combine-handlers';
import { MenuItemSection } from '@/types';

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
                                      {widgetProps.widgetType === 'text' ? (
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
                                                renderToolbar: composeTextWidgetToolbarHandlers(
                                                  widgetProps?.styleOptions?.header?.renderToolbar,
                                                  (defaultToolbar) =>
                                                    addWidgetContextMenu(
                                                      columnIndex,
                                                      rowIndex,
                                                      subcell.widgetId,
                                                    )(() => {}, <>{defaultToolbar}</>),
                                                ),
                                              },
                                            },
                                          }}
                                        />
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
