import { HeaderItem, HeaderItemFill } from '@/domains/shared/header';

import { WidgetHeaderTarget, WidgetHeaderTargets } from './widget-header-targets.js';

/**
 * A slot in the widget header: a reserved id, and the layout behavior the header gives whatever fills
 * it.
 */
interface WidgetHeaderSlot {
  /** The reserved id of the slot. */
  id: WidgetHeaderTarget;
  /**
   * Internal fill for the slot's cell. Fixed here rather than by whoever contributes the item, so
   * the header keeps sole ownership of its layout: a feature supplies content, never a width
   * behavior — the title is `truncate` (the one item that shrinks) because the header says so, not
   * because the title feature asked. `undefined` means the item brings its own fill, which only the
   * header's own spacers do (theirs comes from the title alignment).
   */
  fill?: HeaderItemFill;
}

/**
 * Every slot of the widget header, in the order they appear left to right.
 *
 * This is the header's single source of truth for ordering. It is what lets a reserved id stay a
 * valid `before`/`after` anchor even when nothing filled it: an empty slot is still built (as a
 * hidden anchor), so `before: Menu` resolves the same whether or not the widget has a menu.
 */
const WIDGET_HEADER_SLOTS: readonly WidgetHeaderSlot[] = [
  { id: WidgetHeaderTargets.DragIcon, fill: 'content' },
  { id: WidgetHeaderTargets.JtdIcon, fill: 'content' },
  // The spacers are the header's own items and carry the alignment-driven fill themselves.
  { id: WidgetHeaderTargets.TitleAlignmentSpacer },
  { id: WidgetHeaderTargets.Title, fill: 'truncate' },
  { id: WidgetHeaderTargets.Spacer },
  { id: WidgetHeaderTargets.ClearSelectionButton, fill: 'content' },
  { id: WidgetHeaderTargets.InfoButton, fill: 'content' },
  { id: WidgetHeaderTargets.NarrativeToggle, fill: 'content' },
  { id: WidgetHeaderTargets.Menu, fill: 'content' },
];

/** The reserved ids, for telling a slot-filling item from an ordinary one. */
const RESERVED_IDS: ReadonlySet<string> = new Set<string>(
  WIDGET_HEADER_SLOTS.map((slot) => slot.id),
);

/** An empty slot: it orders like a normal item, but is dropped before rendering. */
const createEmptySlotItem = (id: string): HeaderItem => ({
  id,
  hidden: true,
  component: () => null,
});

/**
 * Builds the widget header's skeleton: one item per slot of {@link WIDGET_HEADER_SLOTS}, in that
 * order.
 *
 * A slot is filled by the header's own item for it if there is one (only the spacers are the
 * header's own — everything with content is contributed), otherwise by a contributed item claiming
 * that id, otherwise by a hidden anchor. Contributed items get the slot's `fill`, so a feature
 * decides *what* its item draws and the header decides how wide it sits.
 *
 * Both ways a contribution can be wrong are authoring bugs in SDK code — a marked item is only ever
 * created by `asBuiltInHeaderItem`, never by a consumer — so both **throw** rather than degrade:
 * every built-in item has to claim a slot registered here, and the header's own spacer slots cannot
 * be taken over (use `onBeforeRender` to change those).
 *
 * @param ownItems - The items the header builds itself: the two alignment spacers.
 * @param contributedItems - The widget's own items plus those contributed through
 * `config.header.items`.
 * @throws When a contributed item claims an unregistered id, or one the header owns.
 * @returns The full, ordered skeleton, including hidden anchors for the empty slots.
 * @internal
 */
export const buildWidgetHeaderSkeleton = (
  ownItems: readonly HeaderItem[],
  contributedItems: readonly HeaderItem[] = [],
): HeaderItem[] => {
  const ownById = new Map(ownItems.map((item) => [item.id, item]));
  const contributedById = new Map<string, HeaderItem>();

  contributedItems.forEach((item) => {
    if (!RESERVED_IDS.has(item.id)) {
      throw new Error(
        `Built-in widget header item "${item.id}" has no slot. Every built-in item must claim an id ` +
          `registered in WIDGET_HEADER_SLOTS (see WidgetHeaderTargets).`,
      );
    }
    if (ownById.has(item.id)) {
      throw new Error(
        `Built-in widget header item "${item.id}" is owned by the widget header and cannot be ` +
          `contributed. Use "onBeforeRender" to change it.`,
      );
    }
    if (contributedById.has(item.id)) {
      throw new Error(`Duplicate built-in widget header item "${item.id}".`);
    }
    contributedById.set(item.id, item);
  });

  return WIDGET_HEADER_SLOTS.map(({ id, fill }) => {
    const own = ownById.get(id);
    if (own) return own;
    const contributed = contributedById.get(id);
    return contributed ? { ...contributed, fill } : createEmptySlotItem(id);
  });
};
