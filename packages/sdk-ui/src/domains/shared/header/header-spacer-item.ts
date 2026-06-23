import { HeaderItem } from './types.js';

/**
 * Creates a flexible, empty "spacer" header item.
 *
 * The spacer renders nothing but grows (`fill: 'grow'`) to fill the available width, separating the
 * leading group of items (e.g. the title) from the trailing group (action buttons). It is also the
 * anchor that `{ type: 'auto' }` items are placed after.
 */
export const createHeaderSpacerItem = (id: string): HeaderItem => ({
  id,
  fill: 'grow',
  component: () => null,
});
