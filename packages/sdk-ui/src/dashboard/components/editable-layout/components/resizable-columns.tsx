import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DndContext, DragMoveEvent } from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import styled from '@emotion/styled';

import { useSyncedState } from '@/common/hooks/use-synced-state';

import {
  MAX_COLUMN_WIDTH,
  MIN_COLUMN_WIDTH,
  RESIZE_LINE_SIZE,
  Z_INDEX_RESIZE_OVERLAY,
} from '../const';
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
   * The minimum width of the columns (in pixels)
   */
  minColWidths?: number[];
  /**
   * The maximum width of the columns (in pixels)
   */
  maxColWidths?: number[];
  /**
   * The callback function to call when the widths change
   */
  onWidthsChange: (widths: number[]) => void;
  /**
   * Boolean flag to disable the resize of the columns
   */
  disableResize?: boolean;
}

/**
 * Renders a resizable columns component that allows for column resizing.
 *
 * @internal
 */
export const ResizableColumns = ({
  children,
  widths,
  minColWidths,
  maxColWidths,
  onWidthsChange,
  disableResize = false,
}: ResizableColumnsProps) => {
  const [totalWidth, setTotalWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const [shouldTriggerOnWidthsChange, setShouldTriggerOnWidthsChange] = useState(false);
  const [internalWidths, setInternalWidths] = useSyncedState<number[]>(widths);
  const [currentlyResizingColumnIndex, setCurrentlyResizingColumnIndex] = useState<number | null>(
    null,
  );

  const innerMinColWidths = useMemo(() => {
    const defaultMinWidths = new Array(widths.length).fill(MIN_COLUMN_WIDTH);
    const pixelWidths = minColWidths ?? defaultMinWidths;

    return pixelWidths.map((pixelWidth) => (pixelWidth / totalWidth) * 100);
  }, [minColWidths, widths, totalWidth]);

  const innerMaxColWidths = useMemo(() => {
    const defaultMaxWidths = new Array(widths.length).fill(MAX_COLUMN_WIDTH);
    const pixelWidths = maxColWidths ?? defaultMaxWidths;

    return pixelWidths.map((pixelWidth) => (pixelWidth / totalWidth) * 100);
  }, [maxColWidths, widths, totalWidth]);

  const onDragMoveHandler = useCallback(
    (event: DragMoveEvent, columnIndex: number) => {
      const x = event.delta.x;
      const coefficient = totalWidth / 100;

      // Get the current widths of the two columns being resized (in percentage)
      const currentLeftWidth = widths[columnIndex];
      const currentRightWidth = widths[columnIndex + 1];

      // Get the min and max constraints (already converted to percentages)
      const leftMinWidth = innerMinColWidths[columnIndex];
      const leftMaxWidth = innerMaxColWidths[columnIndex];
      const rightMinWidth = innerMinColWidths[columnIndex + 1];
      const rightMaxWidth = innerMaxColWidths[columnIndex + 1];

      // Calculate the delta in percentage
      const deltaPercent = x / coefficient;

      // Calculate new widths
      let newLeftWidth = currentLeftWidth + deltaPercent;
      let newRightWidth = currentRightWidth - deltaPercent;

      // Apply min/max constraints with coordination between columns
      // If left column hits its minimum, right column should not grow beyond its maximum
      if (newLeftWidth <= leftMinWidth) {
        newLeftWidth = leftMinWidth;
        newRightWidth = Math.min(
          rightMaxWidth,
          currentRightWidth - (leftMinWidth - currentLeftWidth),
        );
      }
      // If right column hits its minimum, left column should not grow beyond its maximum
      else if (newRightWidth <= rightMinWidth) {
        newRightWidth = rightMinWidth;
        newLeftWidth = Math.min(
          leftMaxWidth,
          currentLeftWidth + (currentRightWidth - rightMinWidth),
        );
      }
      // Otherwise apply normal constraints
      else {
        newLeftWidth = Math.max(leftMinWidth, Math.min(leftMaxWidth, newLeftWidth));
        newRightWidth = Math.max(rightMinWidth, Math.min(rightMaxWidth, newRightWidth));
      }

      setInternalWidths(() =>
        widths.map((width, index) => {
          if (columnIndex === index) {
            return Number(newLeftWidth.toFixed(2));
          }
          if (columnIndex + 1 === index) {
            return Number(newRightWidth.toFixed(2));
          }
          return width;
        }),
      );
    },
    [widths, totalWidth, innerMinColWidths, innerMaxColWidths, setInternalWidths],
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
              <Column key={columnIndex} data-testid={`resizable-column-${columnIndex}`}>
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
                    <DraggableLine
                      disabled={disableResize}
                      orientation="vertical"
                      id={`${columnIndex}`}
                      ariaLabel={`column-resize-handle`}
                    />
                  )}
                </DndContext>
              </Column>
            );
          })}
    </Container>
  );
};
