import { ReactNode } from 'react';

/**
 * Size configuration for a header item, in pixels.
 */
export interface HeaderItemSize {
  /** Fixed width (px). Falls back to the component's default item size. */
  width?: number;
  /** Fixed height (px). Falls back to the component's default item size. */
  height?: number;
}

/**
 * Props passed to a header item component when it is rendered.
 */
export interface HeaderItemComponentProps {
  /** The size resolved for the item by the header layout, with defaults applied. */
  size: {
    /** Fixed width (px). */
    width: number;
    /** Fixed height (px). */
    height: number;
  };
}

/**
 * A React component that renders the content of a header item.
 */
export type HeaderItemComponent = (props: HeaderItemComponentProps) => ReactNode;

/**
 * Internal layout behavior for built-in items whose width is not a fixed pixel value:
 * - `content` — natural content width, never shrinks (built-in action buttons/menu).
 * - `truncate` — natural content width that may shrink/ellipsize (the title).
 * - `grow` — flexible width that absorbs the remaining space (the center spacer).
 *
 * Set only on built-in items; external (user-provided) items never carry it.
 */
export type HeaderItemFill = 'content' | 'truncate' | 'grow';

/**
 * Describes where a header item is placed relative to the other items.
 */
export type HeaderItemPosition =
  | { type: 'auto' }
  | { type: 'before'; target: string }
  | { type: 'after'; target: string }
  | { type: 'first' }
  | { type: 'last' };

/**
 * A single configurable item in a component header (title, button, menu, …).
 */
export interface HeaderItem {
  /** Unique identifier of the item. */
  id: string;
  /** Component that renders the content of the item. */
  component: HeaderItemComponent;
  /** Where to place the item. Defaults to `{ type: 'auto' }`. */
  position?: HeaderItemPosition;
  /** Size configuration for the item. Each unspecified dimension falls back to the default. */
  size?: HeaderItemSize;
  /** Internal CSS fill behavior (built-ins only). */
  fill?: HeaderItemFill;
  /**
   * Anchor-only flag (built-ins only). A hidden item takes part in `before`/`after` ordering as a
   * stable anchor, but is removed before `onBeforeRender` and never rendered. This lets external
   * items target a built-in (e.g. the filter toggle) by id even when the current configuration
   * hides it, so positioning stays stable as built-ins appear/disappear. External items never set
   * this — they are always rendered.
   */
  hidden?: boolean;
}

/**
 * A header item after the built-in and user items have been merged and ordered. Same shape as
 * {@link HeaderItem} but without `position`, which has already been applied.
 */
export type ResolvedHeaderItem = Omit<HeaderItem, 'position'>;

/**
 * Transforms the fully ordered list of header items right before rendering.
 *
 * @internal
 */
export type HeaderItemsTransform = (
  items: ReadonlyArray<ResolvedHeaderItem>,
) => ResolvedHeaderItem[];

/**
 * Internal header configuration consumed by the resolver. Components expose their own public config
 * type (e.g. `DashboardHeaderConfig`) that is structurally assignable to this.
 */
export interface HeaderConfig {
  /** Custom items to inject into the header. */
  items?: HeaderItem[];
  /**
   * Advanced hook to inspect and rewrite the full, ordered list of header items (built-in + user)
   * immediately before rendering. The only way to modify or remove built-in items.
   */
  onBeforeRender?: HeaderItemsTransform;
}
