import { useDraggable } from '@dnd-kit/core';
import { css } from '@emotion/react';

import styled from '@/infra/styled';

import { RESIZE_LINE_SIZE, Z_INDEX_RESIZE_LINE } from '../const.js';

const HorizontalLine = styled.div<{ disabled?: boolean }>`
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
  ${({ disabled }) =>
    disabled &&
    css`
      pointer-events: none;
    `}
  &:hover {
    transform: scaleY(2);
  }
`;

const VerticalLine = styled.div<{ disabled?: boolean }>`
  position: absolute;
  height: 100%;
  width: ${RESIZE_LINE_SIZE}px;
  background-color: #f2f2f2;
  z-index: ${Z_INDEX_RESIZE_LINE};
  top: 0;
  right: -${RESIZE_LINE_SIZE}px;
  cursor: col-resize;
  transition: all 0.1s ease;
  ${({ disabled }) =>
    disabled &&
    css`
      pointer-events: none;
    `}
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
  /**
   * Boolean flag to disable the draggable line
   */
  disabled?: boolean;
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
  disabled = false,
}: DraggableLineProps) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id,
  });
  return orientation === 'vertical' ? (
    <VerticalLine
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      aria-label={ariaLabel}
      disabled={disabled}
    />
  ) : (
    <HorizontalLine
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      aria-label={ariaLabel}
      disabled={disabled}
    />
  );
};
