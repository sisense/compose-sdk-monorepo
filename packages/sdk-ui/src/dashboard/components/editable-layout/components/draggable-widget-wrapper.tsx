import { ReactNode, useCallback } from 'react';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import { DragHandleIcon } from '@/common/icons/drag-handle-icon';
import { Z_INDEX_ACTIVE_DRAGGABLE } from '@/dashboard/components/editable-layout/const';
import { EditableLayoutDragData } from '@/dashboard/components/editable-layout/types';
import styled from '@/styled';

const Wrapper = styled.div<{
  transform?: string | null;
  zIndex: number;
}>`
  transform: ${({ transform }) => transform || 'none'};
  z-index: ${({ zIndex }) => zIndex};
  position: relative;
`;

const DragHandleWrapper = styled.div`
  cursor: move;
  display: flex;
  width: 100%;
  min-height: 20px;
  align-items: center;
  svg {
    margin-right: 4px;
  }

  & > div {
    width: 100%;
    height: 100%;
  }
`;

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
   * The child elements to render inside the wrapper
   */
  children: (withDragHandle: (element: ReactNode) => ReactNode) => ReactNode;
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
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `DraggableWidgetWrapper/${id}`,
    data,
  });

  const shouldShowDragHandleIcon = dragHandleOptions?.icon?.visible ?? true;
  const withDragHandle = useCallback(
    (element: ReactNode) => (
      <DragHandleWrapper {...listeners}>
        {shouldShowDragHandleIcon && (
          <DragHandleIcon aria-label="drag-handle" color={dragHandleOptions?.icon?.color} />
        )}
        <div>{element}</div>
      </DragHandleWrapper>
    ),
    [listeners, dragHandleOptions, shouldShowDragHandleIcon],
  );

  return (
    <Wrapper
      ref={setNodeRef}
      {...attributes}
      transform={CSS.Translate.toString(transform)}
      zIndex={transform ? Z_INDEX_ACTIVE_DRAGGABLE : 10}
      data-testid={`draggable-widget-${id}`}
    >
      {children(withDragHandle)}
    </Wrapper>
  );
};
