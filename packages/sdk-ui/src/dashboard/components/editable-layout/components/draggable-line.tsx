import { useDraggable } from '@dnd-kit/core';
import styled from '@emotion/styled';
import { RESIZE_LINE_SIZE, Z_INDEX_RESIZE_LINE } from '../const';

const HorizontalLine = styled.div`
  width: 100%;
  height: ${RESIZE_LINE_SIZE}px;
  background-color: #f2f2f2;
  cursor: row-resize;
  position: relative;
  z-index: ${Z_INDEX_RESIZE_LINE};
  position: absolute;
  bottom: 0;
  left: 0;
  transition: transform 0.3s ease;
  &:hover {
    transform: scaleY(2);
  }
`;

const VerticalLine = styled.div`
  position: absolute;
  height: 100%;
  width: ${RESIZE_LINE_SIZE}px;
  background-color: #f2f2f2;
  z-index: ${Z_INDEX_RESIZE_LINE};
  top: 0;
  right: -${RESIZE_LINE_SIZE}px;
  cursor: col-resize;
  transition: all 0.1s ease;
  &:hover {
    transform: scaleX(2);
  }
`;

/**
 * The orientation of the draggable line
 */
type DraggableLineOrientation = 'vertical' | 'horizontal';

/**
 * Props for the DraggableLine component
 */
type DraggableLineProps = {
  /**
   * The unique identifier for the draggable line
   */
  id: string;
  /**
   * The orientation of the draggable line
   */
  orientation?: DraggableLineOrientation;
  /**
   * The aria-label of the draggable line
   */
  ariaLabel?: string;
};

/**
 * Renders a draggable line component that can be used to resize columns or rows
 *
 * @internal
 */
export const DraggableLine = ({
  id,
  orientation = 'horizontal',
  ariaLabel,
}: DraggableLineProps) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id,
  });
  return orientation === 'vertical' ? (
    <VerticalLine ref={setNodeRef} {...listeners} {...attributes} aria-label={ariaLabel} />
  ) : (
    <HorizontalLine ref={setNodeRef} {...listeners} {...attributes} aria-label={ariaLabel} />
  );
};
