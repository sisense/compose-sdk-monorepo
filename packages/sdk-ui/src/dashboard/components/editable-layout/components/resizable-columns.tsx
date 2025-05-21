import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { DndContext, DragMoveEvent } from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { useSyncedState } from '@/common/hooks/use-synced-state';
import { RESIZE_LINE_SIZE, Z_INDEX_RESIZE_OVERLAY } from '../const';
import { DraggableLine } from './draggable-line';

const Container = styled.div<{ width: number[] }>`
  display: grid;
  grid-template-columns: ${({ width }) => width.map((w) => `${w}%`).join(' ')};
  width: 100%;
  min-height: 100%;
`;

const Column = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 100%;
  padding-left: ${RESIZE_LINE_SIZE}px;
  &:first-of-type {
    padding-left: 0;
  }
`;

const Overlay = styled.div`
  position: absolute;
  z-index: ${Z_INDEX_RESIZE_OVERLAY};
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #c8e5f8;
  cursor: col-resize;
`;

/**
 * Props for the ResizableColumns component
 *
 * @internal
 */
interface ResizableColumnsProps {
  /**
   * The child elements to render inside the resizable columns
   */
  children: ReactNode;
  /**
   * The widths of the columns (in percentage)
   */
  widths: number[];
  /**
   * The minimum width of the columns (in percentage)
   */
  minColWidth: number;
  /**
   * The callback function to call when the widths change
   */
  onWidthsChange: (widths: number[]) => void;
}

/**
 * Renders a resizable columns component that allows for column resizing.
 *
 * @internal
 */
export const ResizableColumns = ({
  children,
  widths,
  minColWidth,
  onWidthsChange,
}: ResizableColumnsProps) => {
  const [totalWidth, setTotalWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const [shouldTriggerOnWidthsChange, setShouldTriggerOnWidthsChange] = useState(false);
  const [internalWidths, setInternalWidths] = useSyncedState<number[]>(widths);
  const [currentlyResizingColumnIndex, setCurrentlyResizingColumnIndex] = useState<number | null>(
    null,
  );

  const onDragMoveHandler = useCallback(
    (event: DragMoveEvent, columnIndex: number) => {
      const x = event.delta.x;
      const coefficient = totalWidth / 100;
      const clampedX = Math.min(
        Math.max(x, minColWidth * coefficient - widths[columnIndex] * coefficient),
        widths[columnIndex + 1] * coefficient - minColWidth * coefficient,
      );
      setInternalWidths(() =>
        widths.map((width, index) => {
          const delta = clampedX / coefficient;
          if (columnIndex === index) {
            return width + delta;
          }
          if (columnIndex + 1 === index) {
            return width - delta;
          }
          return width;
        }),
      );
    },
    [widths, totalWidth, minColWidth, setInternalWidths],
  );

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setTotalWidth(entry.contentRect.width);
      }
    });
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (shouldTriggerOnWidthsChange) {
      onWidthsChange(internalWidths);
      setShouldTriggerOnWidthsChange(false);
    }
  }, [shouldTriggerOnWidthsChange, onWidthsChange, internalWidths]);

  return (
    <Container ref={containerRef} width={internalWidths}>
      {!Array.isArray(children)
        ? children
        : children.map((child, columnIndex) => {
            return (
              <Column key={columnIndex}>
                {child}
                {(currentlyResizingColumnIndex === columnIndex ||
                  currentlyResizingColumnIndex === columnIndex - 1) && <Overlay />}
                <DndContext
                  modifiers={[restrictToHorizontalAxis]}
                  onDragStart={() => {
                    setCurrentlyResizingColumnIndex(columnIndex);
                  }}
                  onDragMove={(event) => onDragMoveHandler(event, columnIndex)}
                  onDragEnd={() => {
                    setShouldTriggerOnWidthsChange(true);
                    setCurrentlyResizingColumnIndex(null);
                  }}
                >
                  {columnIndex !== children.length - 1 && (
                    <DraggableLine orientation="vertical" id={`${columnIndex}`} />
                  )}
                </DndContext>
              </Column>
            );
          })}
    </Container>
  );
};
