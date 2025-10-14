import { DragStartEvent } from '@dnd-kit/core';

import {
  EditableLayoutDragData,
  EditableLayoutDropData,
} from '@/dashboard/components/editable-layout/types';

export const isEditableLayoutDragData = (data: any | undefined): data is EditableLayoutDragData => {
  return data !== undefined && 'widgetId' in data && 'columnIndex' in data && 'rowIndex' in data;
};

export const isEditableLayoutDropData = (data: any): data is EditableLayoutDropData => {
  return data && 'type' in data && 'columnIndex' in data;
};

export const getDraggingWidgetId = (event: DragStartEvent): string | null => {
  if (isEditableLayoutDragData(event.active.data.current)) {
    return event.active.data.current.widgetId;
  }
  return null;
};
