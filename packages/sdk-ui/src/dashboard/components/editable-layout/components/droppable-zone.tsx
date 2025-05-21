import { EditableLayoutDropData } from '@/dashboard/components/editable-layout/types';
import { useDroppable } from '@dnd-kit/core';
import styled from '@emotion/styled';

const Zone = styled.div<{ highlighted: boolean }>`
  position: absolute;
  z-index: 10;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: #9b9bd7;
  transition: opacity 0.3s ease;
  opacity: ${({ highlighted }) => (highlighted ? 0.7 : 0)};
`;

/**
 * Props for the DroppableZone component
 *
 * @internal
 */
type DroppableZoneProps = {
  /**
   * The unique identifier for the droppable zone
   */
  id: string;
  /**
   * The data for the droppable zone
   */
  data: EditableLayoutDropData;
};

/**
 * Renders a droppable zone component that allows drop operations.
 *
 * @internal
 */
export const DroppableZone = ({ id, data }: DroppableZoneProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `DroppableZone/${id}`,
    data,
  });
  return <Zone highlighted={isOver} ref={setNodeRef} />;
};
