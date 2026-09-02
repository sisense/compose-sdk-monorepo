import { HeaderItem } from './types.js';

/**
 * Marks a header item as built-in. A symbol so it cannot be spelled in a public config object: the
 * public item type has no such member, and setting it requires importing this module.
 */
const BUILT_IN_HEADER_ITEM = Symbol('builtInHeaderItem');

/**
 * Marks an item as one of a component's built-in header items.
 *
 * Built-in items are contributed through the same public `config.header.items` array as user items,
 * which keeps one channel for everything that lands in a header. The marking is what separates the
 * two: only a marked item may claim a **reserved** id (a `*HeaderTargets` slot), and only marked
 * items are placed by the component's own slot order instead of by `position`. A user item that
 * claims a reserved id is still rejected.
 *
 * The mark survives object spreads, so a feature can build its item in stages and mark it once.
 *
 * @param item - The item to mark.
 * @returns The same item, marked as built-in.
 * @internal
 */
export const asBuiltInHeaderItem = <T extends HeaderItem>(item: T): T => ({
  ...item,
  [BUILT_IN_HEADER_ITEM]: true,
});

/**
 * Whether an item was marked with {@link asBuiltInHeaderItem}.
 *
 * @param item - The item to test.
 * @returns `true` when the item is a component-contributed built-in.
 * @internal
 */
export const isBuiltInHeaderItem = (item: HeaderItem): boolean => BUILT_IN_HEADER_ITEM in item;

/**
 * Splits a header `items` array into the component-contributed built-ins and the user's own items.
 *
 * @param items - The items from `config.header.items`.
 * @returns The marked built-in items and the unmarked user items, each in declaration order.
 * @internal
 */
export const partitionBuiltInHeaderItems = (
  items: readonly HeaderItem[] = [],
): { builtInItems: HeaderItem[]; userItems: HeaderItem[] } => ({
  builtInItems: items.filter(isBuiltInHeaderItem),
  userItems: items.filter((item) => !isBuiltInHeaderItem(item)),
});
