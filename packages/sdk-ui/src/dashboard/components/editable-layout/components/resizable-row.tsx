import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { DndContext, DragMoveEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import styled from '@emotion/styled';

import { useSyncedState } from '@/common/hooks/use-synced-state';
import {
  RESIZE_LINE_SIZE,
  Z_INDEX_RESIZE_OVERLAY,
} from '@/dashboard/components/editable-layout/const';

import { DraggableLine } from './draggable-line';

const Container = styled.div<{
  height: number;
  isDragging: boolean;
}>`
  position: relative;
  height: ${({ height }) => `${height}px`};
  overflow: ${({ isDragging }) => (isDragging ? 'hidden' : 'visible')};
`;

const Overlay = styled.div`
  position: absolute;
  z-index: ${Z_INDEX_RESIZE_OVERLAY};
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #c8e5f8;
  cursor: row-resize;
`;

/**
 * Props for the ResizableRow component
 *
 * @internal
 */
type ResizableRowProps = {
  /**
   * The child elements to render inside the resizable row
   */
  children: ReactNode;
  /**
   * The unique identifier
   */
  id: string;
  /**
   * The height of the resizable row
   */
  height: number;
  /**
   * The minimum height of the resizable row
   */
  minHeight: number;
  /**
   * The maximum height of the resizable row
   */
  maxHeight: number;
  /**
   * The callback function to call when the height changes
   */
  onHeightChange: (height: number) => void;
};

/**
 * Renders a resizable row component that allows for row resizing.
 *
 * @internal
 */
export const ResizableRow = ({
  children,
  id,
  height,
  minHeight,
  maxHeight,
  onHeightChange,
}: ResizableRowProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [shouldCallOnHeightChange, setShouldCallOnHeightChange] = useState(false);
  const [internalHeight, setInternalHeight] = useSyncedState(height + RESIZE_LINE_SIZE);

  const minY = useMemo(
    () => Math.min(minHeight + RESIZE_LINE_SIZE - height, 0),
    [minHeight, height],
  );
  const maxY = useMemo(
    () => Math.max(maxHeight + RESIZE_LINE_SIZE - height, 0),
    [maxHeight, height],
  );

  useEffect(() => {
    if (shouldCallOnHeightChange) {
      setShouldCallOnHeightChange(false);
      onHeightChange(internalHeight - RESIZE_LINE_SIZE);
    }
  }, [internalHeight, shouldCallOnHeightChange, onHeightChange]);

  const onDragMove = useCallback(
    (event: DragMoveEvent) => {
      const { delta } = event;
      const y = Math.max(minY, Math.min(maxY, delta.y));
      setInternalHeight(Math.round(height + y + RESIZE_LINE_SIZE));
    },
    [minY, maxY, height, setInternalHeight],
  );

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    setShouldCallOnHeightChange(true);
  }, [setIsDragging, setShouldCallOnHeightChange]);

  return (
    <Container height={internalHeight} isDragging={isDragging} data-testid={`resizable-row-${id}`}>
      {children}
      {isDragging && <Overlay />}
      <DndContext
        onDragStart={() => setIsDragging(true)}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <DraggableLine id={id} orientation="horizontal" ariaLabel={`row-resize-handle`} />
      </DndContext>
    </Container>
  );
};
