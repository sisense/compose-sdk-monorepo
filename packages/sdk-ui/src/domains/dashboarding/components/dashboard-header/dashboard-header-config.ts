import { ReactNode } from 'react';

import { DashboardHeaderTarget } from './dashboard-header-targets';

/**
 * Size of a custom dashboard header item, in pixels.
 */
export interface DashboardHeaderItemSize {
  /**
   * Fixed width of the item, in pixels.
   *
   * If omitted, it falls back to the default dashboard header item size of `28px`.
   *
   * @default 28
   */
  width?: number;
  /**
   * Fixed height of the item, in pixels.
   *
   * If omitted, it falls back to the default dashboard header item size of `28px`.
   *
   * @default 28
   */
  height?: number;
}

/**
 * Props passed to a {@link DashboardHeaderItemComponent} when it is rendered.
 */
export interface DashboardHeaderItemComponentProps {
  /** The size resolved for the item by the header layout, with defaults applied. */
  size: {
    /**
     * Fixed width of the item, in pixels.
     */
    width: number;
    /**
     * Fixed height of the item, in pixels.
     */
    height: number;
  };
}

/**
 * A React component that renders the content of a custom dashboard header item.
 */
export type DashboardHeaderItemComponent = (props: DashboardHeaderItemComponentProps) => ReactNode;

/**
 * Position of a custom dashboard header item relative to the other items.
 *
 * - `auto` (default) — automatic placement.
 * - `before` / `after` — placed immediately before/after the item with the given `target` id.
 *   Pass a {@link DashboardHeaderTargets} constant to anchor to a built-in item (works even when
 *   that built-in is currently hidden), or any custom item id to anchor to another injected item.
 * - `first` / `last` — placed at the very start/end of the header.
 */
export type DashboardHeaderItemPosition =
  | { type: 'auto' }
  | { type: 'before'; target: DashboardHeaderTarget | string }
  | { type: 'after'; target: DashboardHeaderTarget | string }
  | { type: 'first' }
  | { type: 'last' };

/**
 * A custom item to inject into the dashboard header.
 */
export interface DashboardHeaderItem {
  /**
   * Unique identifier of the item.
   *
   * Must not match a built-in dashboard header item id (see {@link DashboardHeaderTargets}).
   */
  id: string;
  /**
   * Component that renders the content of the item.
   */
  component: DashboardHeaderItemComponent;
  /**
   * Placement of the item.
   *
   * Defaults to `{ type: 'auto' }` (after the center spacer).
   */
  position?: DashboardHeaderItemPosition;
  /**
   * Size of the item.
   */
  size?: DashboardHeaderItemSize;
}

/**
 * A dashboard header item after the built-in and custom items have been ordered (position applied).
 *
 * This is the shape passed to {@link DashboardHeaderConfig.onBeforeRender}.
 */
export type DashboardResolvedHeaderItem = Omit<DashboardHeaderItem, 'position'>;

/**
 * Transforms the fully ordered list of dashboard header items right before rendering.
 */
export type DashboardHeaderItemsTransform = (
  items: ReadonlyArray<DashboardResolvedHeaderItem>,
) => DashboardResolvedHeaderItem[];

/**
 * Configuration for the dashboard header items.
 */
export interface DashboardHeaderConfig {
  /**
   * Boolean flag that determines whether the dashboard header is visible.
   *
   * If not specified, the default value is `true`.
   */
  visible?: boolean;
  /**
   * Custom items to inject into the header.
   *
   * Each item's `id` must not match a built-in item id (see {@link DashboardHeaderTargets}).
   */
  items?: DashboardHeaderItem[];
  /**
   * Advanced callback to inspect and rewrite the full, ordered list of header items (built-in +
   * custom) right before rendering. The only way to modify or remove built-in items.
   */
  onBeforeRender?: DashboardHeaderItemsTransform;
}
