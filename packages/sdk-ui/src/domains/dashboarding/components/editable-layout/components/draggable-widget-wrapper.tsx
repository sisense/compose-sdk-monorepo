import { ReactNode, useCallback, useMemo } from 'react';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import styled from '@emotion/styled';

import { Z_INDEX_ACTIVE_DRAGGABLE } from '@/domains/dashboarding/components/editable-layout/const';
import { EditableLayoutDragData } from '@/domains/dashboarding/components/editable-layout/types';

const Wrapper = styled.div<{
  transform?: string | null;
  zIndex: number;
}>`
  transform: ${({ transform }) => transform || 'none'};
  z-index: ${({ zIndex }) => zIndex};
  position: relative;
`;

/**
 * A stretch of the widget header that starts a drag. Every piece of the header's drag area — the drag
 * icon, the JTD icon, the title and the spacers — is wrapped in one of these, so the whole title row
 * is grabbable rather than just the handle icon.
 */
const DragGrabArea = styled.div`
  cursor: move;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  min-width: 0;
`;

/**
 * The drag activators a draggable widget hands to its header.
 *
 * @internal
 */
export interface WidgetDragHandle {
  /** Whether the drag-handle icon should be shown as the header's drag-icon item. */
  iconVisible: boolean;
  /** Color to draw the drag-handle icon in. */
  iconColor?: string;
  /**
   * Wraps the header's primary drag affordance (the drag-icon item). Same grab behavior as
   * {@link WidgetDragHandle.withGrabArea}, plus it registers the element as dnd-kit's activator node.
   */
  withActivator: (element: ReactNode) => ReactNode;
  /** Wraps any other part of the header's drag area, so it starts a drag too. */
  withGrabArea: (element: ReactNode) => ReactNode;
}

/**
 * Props for the DraggableWidgetWrapper component
 *
 * @internal
 */
type DraggableWidgetWrapperProps = {
  /**
   * The unique identifier for the draggable widget wrapper
   */
  id: string;
  /**
   * The data for the draggable widget wrapper
   */
  data: EditableLayoutDragData;
  /**
   * The child elements to render inside the wrapper, given the drag activators to place in the
   * widget header.
   */
  children: (dragHandle: WidgetDragHandle) => ReactNode;
  /**
   * Options for drag handle
   */
  dragHandleOptions?: {
    icon?: {
      visible?: boolean;
      color?: string;
    };
  };
};

/**
 * Renders a draggable widget wrapper component that allows for drag and drop operations.
 *
 * @internal
 */
export const DraggableWidgetWrapper = ({
  id,
  data,
  children,
  dragHandleOptions,
}: DraggableWidgetWrapperProps) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform } = useDraggable({
    id: `DraggableWidgetWrapper/${id}`,
    data,
  });

  const shouldShowDragHandleIcon = dragHandleOptions?.icon?.visible ?? true;
  // The listeners are plain pointer handlers, so every part of the drag area can share them; only the
  // primary affordance takes the activator ref (dnd-kit uses it for the activator's a11y attributes,
  // and falls back to the draggable node when no activator is registered).
  const withActivator = useCallback(
    (element: ReactNode) => (
      <DragGrabArea ref={setActivatorNodeRef} {...listeners}>
        {element}
      </DragGrabArea>
    ),
    [listeners, setActivatorNodeRef],
  );
  const withGrabArea = useCallback(
    (element: ReactNode) => <DragGrabArea {...listeners}>{element}</DragGrabArea>,
    [listeners],
  );
  const dragHandle = useMemo<WidgetDragHandle>(
    () => ({
      iconVisible: shouldShowDragHandleIcon,
      iconColor: dragHandleOptions?.icon?.color,
      withActivator,
      withGrabArea,
    }),
    [shouldShowDragHandleIcon, dragHandleOptions?.icon?.color, withActivator, withGrabArea],
  );

  return (
    <Wrapper
      ref={setNodeRef}
      {...attributes}
      transform={CSS.Translate.toString(transform)}
      zIndex={transform ? Z_INDEX_ACTIVE_DRAGGABLE : 10}
      data-testid={`draggable-widget-${id}`}
    >
      {children(dragHandle)}
    </Wrapper>
  );
};
