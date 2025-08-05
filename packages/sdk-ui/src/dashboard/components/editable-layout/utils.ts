import {
  EditableLayoutDragData,
  EditableLayoutDropData,
} from '@/dashboard/components/editable-layout/types';
import { DragStartEvent } from '@dnd-kit/core';
import { RenderTitleHandler, RenderToolbarHandler, TextWidgetRenderToolbarHandler } from '@/types';

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

/**
 * Compose multiple RenderToolbarHandler functions into one.
 * Each handler gets a chance to modify the toolbar.
 * If it returns `null`, the previous toolbar is passed to the next handler.
 */
export function composeToolbarHandlers(
  ...handlers: (RenderToolbarHandler | undefined)[]
): RenderToolbarHandler {
  return (onRefresh, defaultToolbar) => {
    return handlers.reduce((currentToolbar, handler) => {
      if (!handler) return currentToolbar;
      return handler(onRefresh, currentToolbar) ?? currentToolbar;
    }, defaultToolbar);
  };
}

/**
 * Compose multiple TextWidgetRenderToolbarHandler functions into one.
 * Each handler gets a chance to modify the toolbar.
 * If it returns `null`, the previous toolbar is passed to the next handler.
 */
export function composeTextWidgetToolbarHandlers(
  ...handlers: (TextWidgetRenderToolbarHandler | undefined)[]
): TextWidgetRenderToolbarHandler {
  return (defaultToolbar) => {
    return handlers.reduce((currentToolbar, handler) => {
      if (!handler) return currentToolbar;
      return handler(currentToolbar) ?? currentToolbar;
    }, defaultToolbar);
  };
}

/**
 * Compose multiple RenderTitleHandler functions into one.
 * Each handler gets a chance to modify the title.
 * If it returns `null`, the previous tile is passed to the next handler.
 */
export function composeTitleHandlers(
  ...handlers: (RenderTitleHandler | undefined)[]
): RenderTitleHandler {
  return (defaultTitle) => {
    return handlers.reduce((currentTitle, handler) => {
      if (!handler) return currentTitle;
      const result = handler(currentTitle);
      return result !== null ? result : currentTitle;
    }, defaultTitle);
  };
}
