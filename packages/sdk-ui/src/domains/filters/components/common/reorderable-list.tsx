import React, { useCallback, useState } from 'react';

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  restrictToFirstScrollableAncestor,
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import {
  AnimateLayoutChanges,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Transform } from '@dnd-kit/utilities';

import styled from '@/infra/styled';

export interface RenderItemProps {
  index: number;
  withDragHandle: (element: React.ReactNode) => React.ReactNode;
  isDragging: boolean;
  isSorting: boolean;
  id: UniqueIdentifier;
}

export interface ReorderableListProps {
  disabled?: boolean;
  items: UniqueIdentifier[];
  renderItem: (args: RenderItemProps) => React.ReactNode;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

/**
 * Sortable list component
 * Render list of items that could be reordered by drag and drop (vertically)
 *
 * @internal
 */
export const ReorderableList = ({
  disabled = false,
  items,
  renderItem,
  onReorder,
}: ReorderableListProps) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  );
  const getIndex = useCallback((id: UniqueIdentifier) => items.indexOf(id), [items]);
  const activeIndex = activeId != null ? getIndex(activeId) : -1;

  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    if (!active) {
      return;
    }

    setActiveId(active.id);
  }, []);

  const handleDragEnd = useCallback(
    ({ over }: DragEndEvent) => {
      setActiveId(null);

      if (over) {
        const overIndex = getIndex(over.id);
        if (activeIndex !== overIndex) {
          onReorder?.(activeIndex, overIndex);
        }
      }
    },
    [activeIndex, getIndex, onReorder],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  return (
    <DndContext
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges, restrictToFirstScrollableAncestor]}
      collisionDetection={closestCenter}
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((value, index) => (
          <ReorderableItem
            disabled={disabled}
            key={value}
            id={value}
            index={index}
            renderItem={renderItem}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
};

interface ReorderableItemProps {
  animateLayoutChanges?: AnimateLayoutChanges;
  disabled?: boolean;
  id: UniqueIdentifier;
  index: number;
  renderItem: (args: RenderItemProps) => React.ReactNode;
}

const ReorderableItemWrapper = styled.div<{
  isDragging: boolean;
  transform: Transform | null;
  transition?: string;
}>`
  transition: ${({ transition }) => transition || 'all 0.02s ease'};
  position: relative;
  z-index: ${({ isDragging }) => (isDragging ? 101 : 100)};
  transform: ${({ transform }) =>
    transform ? `translate(${transform.x}px, ${transform.y}px)` : 'none'};
`;

const SortableItemHandleWrapper = styled.div<{
  draggable: boolean;
  isDragging: boolean;
}>`
  cursor: ${({ draggable, isDragging }) =>
    draggable ? (isDragging ? 'grabbing' : 'grab') : 'auto'};
`;

export const ReorderableItem = ({ disabled, id, index, renderItem }: ReorderableItemProps) => {
  const {
    attributes,
    isDragging,
    isSorting,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    disabled,
  });

  const withDragHandle = useCallback(
    (element: React.ReactNode) => (
      <SortableItemHandleWrapper
        draggable={!disabled}
        isDragging={isDragging}
        ref={setActivatorNodeRef}
        {...listeners}
      >
        {element}
      </SortableItemHandleWrapper>
    ),
    [listeners, setActivatorNodeRef, isDragging, disabled],
  );

  return (
    <ReorderableItemWrapper
      ref={setNodeRef}
      isDragging={isDragging}
      transform={transform}
      transition={transition}
      {...attributes}
    >
      {renderItem({ index, withDragHandle, isDragging, isSorting, id })}
    </ReorderableItemWrapper>
  );
};
