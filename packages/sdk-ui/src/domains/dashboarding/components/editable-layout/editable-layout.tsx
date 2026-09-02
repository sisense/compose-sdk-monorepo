import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import styled from '@emotion/styled';
import flow from 'lodash-es/flow';
import isNumber from 'lodash-es/isNumber';
import isUndefined from 'lodash-es/isUndefined';

import {
  DRAG_ACTIVATION_DISTANCE_PX,
  WIDGET_HEADER_HEIGHT,
} from '@/domains/dashboarding/components/editable-layout/const';
import { WidgetsPanelLayout } from '@/domains/dashboarding/dashboard-model';
import { withOptionallyDisabledAutoHeight } from '@/domains/dashboarding/utils';
import { Widget } from '@/domains/widgets/components/widget';
import { WidgetProps } from '@/domains/widgets/components/widget/types';
import {
  withHeaderItems,
  withHeaderItemsTransform,
} from '@/domains/widgets/helpers/header-items-utils';
import { withHeaderMenuItem } from '@/domains/widgets/helpers/header-menu-utils';
import { WidgetHeaderMenuTargets } from '@/domains/widgets/shared/widget-header/widget-header-menu-targets';
import { WidgetHeaderTargets } from '@/domains/widgets/shared/widget-header/widget-header-targets';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { useSyncedState } from '@/shared/hooks/use-synced-state';

import { CellDropOverlay } from './components/cell-drop-overlay';
import { createDragIconItem } from './components/drag-icon-header-item';
import {
  DraggableWidgetWrapper,
  type WidgetDragHandle,
} from './components/draggable-widget-wrapper';
import { EditableLayoutRow } from './components/editable-layout-row';
import { ResizableColumns } from './components/resizable-columns';
import { RowDropOverlay } from './components/row-drop-overlay';
import {
  deleteWidgetFromLayout,
  distributeEqualWidthInRow,
  getColumnMinWidths,
  updateLayoutAfterDragAndDrop,
  updateLayoutWidths,
  updateRowHeight,
} from './helpers';
import { SmartPointerSensor } from './smart-pointer-sensor';
import { getDraggingWidgetId, isEditableLayoutDragData, isEditableLayoutDropData } from './utils';

/**
 * The header items that make up the widget's drag area, left to right: the drag icon, the JTD icon,
 * the title and the spacers on either side of it. The action buttons on the right are left alone.
 */
const DRAGGABLE_HEADER_ITEM_IDS: ReadonlySet<string> = new Set<string>([
  WidgetHeaderTargets.DragIcon,
  WidgetHeaderTargets.JtdIcon,
  WidgetHeaderTargets.TitleAlignmentSpacer,
  WidgetHeaderTargets.Title,
  WidgetHeaderTargets.Spacer,
]);

/**
 * Makes the widget header's title row the drag area.
 *
 * Two contributions: the built-in drag-icon item, and an `onBeforeRender` transform wraps every item of the drag area in a grab area —
 * the drag icon as dnd-kit's activator, the rest as plain grab areas. Wrapping the spacers as well is
 * what keeps the empty part of the row draggable, including for a widget with no title at all.
 *
 * @param dragHandle - The activators provided by the widget's draggable wrapper.
 * @returns A function that turns a widget's header into its drag area.
 */
const withDragHandleInHeader =
  (dragHandle: WidgetDragHandle) =>
  (props: Readonly<WidgetProps>): WidgetProps =>
    flow(
      dragHandle.iconVisible
        ? withHeaderItems([
            createDragIconItem({
              color: dragHandle.iconColor,
              withActivator: dragHandle.withActivator,
            }),
          ])
        : (widget: Readonly<WidgetProps>): WidgetProps => widget,
      withHeaderItemsTransform((items) =>
        items.map((item) =>
          DRAGGABLE_HEADER_ITEM_IDS.has(item.id) && item.id !== WidgetHeaderTargets.DragIcon
            ? {
                ...item,
                component: (itemProps) => dragHandle.withGrabArea(item.component(itemProps)),
              }
            : item,
        ),
      ),
    )(props);

/** Maps a widget's props to a customized version of them. */
type WidgetPropsTransformer = (widget: WidgetProps) => WidgetProps;

/**
 * Composes widget props transformers, dropping the ones a configuration flag switched off.
 *
 * Lets a caller keep one transformer per line and gate a line with `flag && transformer`, instead of
 * threading conditionals through the composition itself.
 *
 * @param transformers - The transformers to compose, in application order, `false` when switched off
 * @returns A transformer applying every enabled transformer in order
 */
const composeWidgetTransformers = (
  ...transformers: readonly (WidgetPropsTransformer | false)[]
): WidgetPropsTransformer =>
  flow(transformers.filter((transformer): transformer is WidgetPropsTransformer => !!transformer));

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

    /**
     * Flag indicating whether the "Delete widget" menu item is offered on each widget header.
     *
     * @default true
     */
    deleteWidgetEnabled?: boolean;
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
  const { showDragHandleIcon = true, deleteWidgetEnabled = true } = useMemo(
    () => config ?? {},
    [config],
  );

  const [isDragging, setIsDragging] = useState(false);
  const [draggingWidgetId, setDraggingWidgetId] = useState<string | null>(null);
  const [internalLayout, setInternalLayout] = useSyncedState<WidgetsPanelLayout>(layout);

  const sensors = useSensors(
    useSensor(SmartPointerSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE_PX },
    }),
    useSensor(KeyboardSensor),
  );

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
        sensors={sensors}
        collisionDetection={(args) => {
          const pointer = pointerWithin(args);
          return pointer.length > 0 ? pointer : rectIntersection(args);
        }}
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
                                {(dragHandle) => (
                                  <>
                                    <Cell
                                      height={isAutoHeightRow ? 'auto' : subcell.height}
                                      isDragging={draggingWidgetId === subcell.widgetId}
                                      isDropping={
                                        isDragging && draggingWidgetId !== subcell.widgetId
                                      }
                                    >
                                      {(() => {
                                        const customizedProps = composeWidgetTransformers(
                                          deleteWidgetEnabled &&
                                            withHeaderMenuItem({
                                              type: 'action',
                                              id: WidgetHeaderMenuTargets.DeleteWidget,
                                              caption: t('widgetHeader.menu.deleteWidget'),
                                              onClick: () =>
                                                onCellDelete(
                                                  columnIndex,
                                                  rowIndex,
                                                  subcell.widgetId,
                                                ),
                                            }),
                                          withHeaderMenuItem({
                                            type: 'action',
                                            id: WidgetHeaderMenuTargets.DistributeEqualWidth,
                                            caption: t('widgetHeader.menu.distributeEqualWidth'),
                                            onClick: () =>
                                              onCellDistributeEqualWidth(columnIndex, rowIndex),
                                          }),
                                          withDragHandleInHeader(dragHandle),
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
