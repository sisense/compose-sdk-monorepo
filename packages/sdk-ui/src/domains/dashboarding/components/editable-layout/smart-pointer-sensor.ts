import type { PointerEvent } from 'react';

import { PointerSensor } from '@dnd-kit/core';
import type { PointerSensorOptions } from '@dnd-kit/core';

const NON_DRAGGABLE_SELECTOR =
  'input, textarea, select, button, [contenteditable]:not([contenteditable="false"]), [data-no-dnd]';

/**
 * Returns true when the element or any of its ancestors is a non-draggable control
 * (interactive form element, contenteditable, or explicitly marked with `data-no-dnd`).
 * Used to skip DnD activation when the user interacts with these elements.
 */
function isNonDraggableElement(element: Element | null): boolean {
  if (!element) return false;
  return element.closest(NON_DRAGGABLE_SELECTOR) !== null;
}

/**
 * PointerSensor that skips activation when the event originates from interactive
 * elements (input, textarea, select, button, contenteditable) or elements
 * explicitly marked with the `data-no-dnd` attribute.
 * Prevents DnD from stealing focus and keyboard events from the widget title editor.
 *
 * @internal
 */
export class SmartPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: 'onPointerDown' as const,
      handler: (
        { nativeEvent: event }: PointerEvent,
        { onActivation }: PointerSensorOptions,
      ): boolean => {
        if (!event.isPrimary || event.button !== 0) {
          return false;
        }
        const target = event.target instanceof Element ? event.target : null;
        if (isNonDraggableElement(target)) {
          return false;
        }
        onActivation?.({ event });
        return true;
      },
    },
  ];
}
