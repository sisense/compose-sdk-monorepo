import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import styled from '@emotion/styled';
import { EditableLayoutDragData } from '@/dashboard/components/editable-layout/types';
import { Z_INDEX_ACTIVE_DRAGGABLE } from '@/dashboard/components/editable-layout/const';

const Wrapper = styled.div<{
  transform?: string | null;
  zIndex: number;
}>`
  transform: ${({ transform }) => transform || 'none'};
  z-index: ${({ zIndex }) => zIndex};
  cursor: move;
  position: relative;
`;

const Overlay = styled.div`
  position: absolute;
  z-index: 10;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
  children: React.ReactNode;
};

/**
 * Renders a draggable widget wrapper component that allows for drag and drop operations.
 *
 * @internal
 */
export const DraggableWidgetWrapper = ({ id, data, children }: DraggableWidgetWrapperProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `DraggableWidgetWrapper/${id}`,
    data,
  });
  return (
    <Wrapper
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      transform={CSS.Translate.toString(transform)}
      zIndex={transform ? Z_INDEX_ACTIVE_DRAGGABLE : 10}
    >
      {children}
      <Overlay />
    </Wrapper>
  );
};
