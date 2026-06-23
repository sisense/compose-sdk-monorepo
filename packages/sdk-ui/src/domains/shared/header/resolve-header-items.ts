import { HeaderConfig, HeaderItem, HeaderItemPosition, ResolvedHeaderItem } from './types.js';

/**
 * Options for {@link resolveHeaderItems}.
 */
export interface ResolveHeaderItemsOptions {
  /**
   * Id of the item that `{ type: 'auto' }` items are placed immediately after (the center spacer).
   *
   * If not provided or not present, auto items fall back to the end of the header.
   */
  autoAnchorId?: string;
}

const DEFAULT_POSITION: HeaderItemPosition = { type: 'auto' };

const positionOf = (item: HeaderItem): HeaderItemPosition => item.position ?? DEFAULT_POSITION;

/**
 * Filters out user items whose id collides with a built-in id (logs a `console.error` and skips
 * them — they cannot override built-ins; use `onBeforeRender` for that). Also rejects duplicate
 * ids within the user-provided list.
 *
 * `builtInIds` is the full set of built-in ids (including hidden anchors), so an id stays reserved
 * even when its built-in is currently hidden.
 */
const filterUserItems = (
  builtInIds: ReadonlySet<string>,
  userItems: HeaderItem[],
): HeaderItem[] => {
  const seen = new Set<string>();
  const result: HeaderItem[] = [];
  for (const item of userItems) {
    if (builtInIds.has(item.id)) {
      console.error(
        `Header item id "${item.id}" matches a built-in header item and will be ignored. ` +
          `To modify built-in items, use "onBeforeRender" instead.`,
      );
      continue;
    }
    if (seen.has(item.id)) {
      throw new Error(`Duplicate header item id "${item.id}" in header "items".`);
    }
    seen.add(item.id);
    result.push(item);
  }
  return result;
};

/** Inserts a contiguous block of ids immediately after `anchorId` (or at the end if missing). */
const insertBlockAfter = (order: string[], ids: string[], anchorId?: string): void => {
  if (ids.length === 0) return;
  const anchorIndex = anchorId ? order.indexOf(anchorId) : -1;
  if (anchorIndex === -1) {
    order.push(...ids);
  } else {
    order.splice(anchorIndex + 1, 0, ...ids);
  }
};

interface RelativeGroup {
  type: 'before' | 'after';
  target: string;
  ids: string[];
}

/**
 * Groups `before`/`after` items by `(type, target)`, preserving declaration order both across
 * groups and within each group, so that items sharing an anchor render in the order declared.
 */
const groupRelatives = (userItems: HeaderItem[]): RelativeGroup[] => {
  const groups: RelativeGroup[] = [];
  const byKey = new Map<string, RelativeGroup>();
  userItems.forEach((item) => {
    const position = positionOf(item);
    if (position.type !== 'before' && position.type !== 'after') return;
    const key = `${position.type}:${position.target}`;
    let group = byKey.get(key);
    if (!group) {
      group = { type: position.type, target: position.target, ids: [] };
      byKey.set(key, group);
      groups.push(group);
    }
    group.ids.push(item.id);
  });
  return groups;
};

const idsByPositionType = (userItems: HeaderItem[], type: HeaderItemPosition['type']): string[] =>
  userItems.filter((item) => positionOf(item).type === type).map((item) => item.id);

/**
 * Computes the final id ordering.
 *
 * Built-in items form a stable skeleton in their declared order (including hidden anchors). User
 * items are then placed as ordered blocks: `first` at the start, `last` at the end, `auto` right
 * after the anchor, and `before`/`after` relative to their target. A relative group whose target
 * is itself a yet-to-be placed item is retried until no progress is made.
 *
 * Any item left unresolved has a genuinely unknown target (hidden built-ins resolve, since they
 * are in the skeleton): it is logged via `console.error` and dropped.
 */
const computeOrder = (
  builtInItems: HeaderItem[],
  userItems: HeaderItem[],
  autoAnchorId?: string,
): string[] => {
  const order = builtInItems.map((item) => item.id);

  order.unshift(...idsByPositionType(userItems, 'first'));
  order.push(...idsByPositionType(userItems, 'last'));
  insertBlockAfter(order, idsByPositionType(userItems, 'auto'), autoAnchorId);

  let pending = groupRelatives(userItems);
  let madeProgress = true;
  while (pending.length > 0 && madeProgress) {
    madeProgress = false;
    const stillPending: RelativeGroup[] = [];
    for (const group of pending) {
      const targetIndex = order.indexOf(group.target);
      if (targetIndex === -1) {
        stillPending.push(group);
        continue;
      }
      const insertIndex = group.type === 'before' ? targetIndex : targetIndex + 1;
      order.splice(insertIndex, 0, ...group.ids);
      madeProgress = true;
    }
    pending = stillPending;
  }
  // Unresolvable targets are genuinely unknown ids (hidden built-ins resolve via the skeleton):
  // log an error and skip — the item simply doesn't appear.
  pending.forEach((group) => {
    const itemList = group.ids.map((id) => '"' + id + '"').join(', ');
    console.error(
      `Header item position target "${group.target}" was not found. ` +
        `Item(s) ${itemList} will be ignored.`,
    );
  });

  return order;
};

const toResolved = (item: HeaderItem): ResolvedHeaderItem => ({
  id: item.id,
  component: item.component,
  size: item.size ? { ...item.size } : undefined,
  fill: item.fill,
});

/**
 * Resolves the final, ordered list of header items from the built-in items and the user
 * {@link HeaderConfig}.
 */
export const resolveHeaderItems = (
  builtInItems: HeaderItem[],
  config?: HeaderConfig,
  options?: ResolveHeaderItemsOptions,
): ResolvedHeaderItem[] => {
  const builtInIds = new Set(builtInItems.map((item) => item.id));
  const userItems = filterUserItems(builtInIds, config?.items ?? []);

  const itemsById = new Map<string, HeaderItem>();
  builtInItems.forEach((item) => itemsById.set(item.id, item));
  userItems.forEach((item) => itemsById.set(item.id, item));

  const order = computeOrder(builtInItems, userItems, options?.autoAnchorId);
  const resolved = order
    .map((id) => itemsById.get(id))
    .filter((item): item is HeaderItem => item !== undefined)
    // Hidden built-ins have done their job as anchors; drop them so they neither reach
    // onBeforeRender nor render. Neighboring items keep the positions they just resolved to.
    .filter((item) => !item.hidden)
    .map(toResolved);

  // onBeforeRender works on the public shape; `fill` (internal, built-ins only) is preserved at
  // runtime through spreads and re-read by the renderer.
  const transformed = config?.onBeforeRender ? config.onBeforeRender(resolved) : resolved;

  const seenAfterTransform = new Set<string>();
  transformed.forEach((item) => {
    if (seenAfterTransform.has(item.id)) {
      throw new Error(`Duplicate header item id "${item.id}" after "onBeforeRender".`);
    }
    seenAfterTransform.add(item.id);
  });

  return transformed;
};
