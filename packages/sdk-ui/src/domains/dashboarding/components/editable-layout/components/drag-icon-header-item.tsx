import { ReactNode } from 'react';

import styled from '@emotion/styled';

import { asBuiltInHeaderItem, HeaderItem } from '@/domains/shared/header';
import { WidgetHeaderTargets } from '@/domains/widgets/shared/widget-header/widget-header-targets';
import { DragHandleIcon } from '@/shared/icons/drag-handle-icon';

/**
 * Keeps the 4px gap the drag handle had before it became its own header item: header items sit flush
 * against each other (the row's gap is 0), and the icon reads as attached to what follows it. Padding
 * rather than a margin, so the gap is part of the item's own box and cannot be collapsed away by
 * whatever wraps it.
 */
const DragIconBox = styled.div`
  display: flex;
  align-items: center;
  padding-right: 4px;
`;

/**
 * Builds the built-in drag-icon header item — the widget's primary drag affordance in edit mode.
 *
 * @param options - How to draw the icon and how to make it a drag activator.
 * @param options.color - Color of the icon.
 * @param options.withActivator - Wraps the icon in the layout's drag activator.
 * @returns The header item, marked as a built-in so it may claim its reserved id.
 * @internal
 */
export const createDragIconItem = ({
  color,
  withActivator,
}: {
  color?: string;
  withActivator: (element: ReactNode) => ReactNode;
}): HeaderItem =>
  asBuiltInHeaderItem({
    id: WidgetHeaderTargets.DragIcon,
    component: () =>
      withActivator(
        <DragIconBox>
          <DragHandleIcon aria-label="drag-handle" color={color} />
        </DragIconBox>,
      ),
  });
