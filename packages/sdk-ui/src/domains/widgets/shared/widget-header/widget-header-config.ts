import { ReactNode } from 'react';

import { WidgetHeaderTarget } from './widget-header-targets.js';

/**
 * Fields shared by every widget header menu item, whichever kind it is.
 */
interface WidgetHeaderMenuItemBase {
  /**
   * Unique identifier of the item within the menu.
   *
   * Must not match the id of a built-in item — see {@link WidgetHeaderMenuTargets}.
   */
  id: string;
  /**
   * Text of the item, as shown in the menu.
   */
  caption: string;
}

/**
 * A widget header menu item that runs an action when clicked.
 */
export interface WidgetHeaderMenuActionItem extends WidgetHeaderMenuItemBase {
  /**
   * Kind of the item.
   */
  type: 'action';
  /**
   * Callback invoked when the item is clicked.
   */
  onClick: () => void;
}

/**
 * A widget header menu item that opens a nested submenu when clicked.
 */
export interface WidgetHeaderMenuSubmenuItem extends WidgetHeaderMenuItemBase {
  /**
   * Kind of the item.
   */
  type: 'submenu';
  /**
   * Items of the nested submenu. Submenus may be nested further.
   *
   * A submenu with no items is not rendered.
   */
  items: WidgetHeaderMenuItem[];
}

/**
 * A single item in the widget header menu, discriminated by its `type`.
 *
 * Items are contributed through {@link WidgetHeaderMenuConfig.items} and are rendered after the
 * built-in items the widget adds itself (for example "Download" or "Rename widget").
 */
export type WidgetHeaderMenuItem = WidgetHeaderMenuActionItem | WidgetHeaderMenuSubmenuItem;

/**
 * Configuration for the widget header menu — the menu opened from the "⋮" button in the widget
 * header.
 */
export interface WidgetHeaderMenuConfig {
  /**
   * Whether the header menu is enabled.
   *
   * When `false`, the menu button is not rendered even if items are available. When enabled, the
   * menu button is rendered as soon as there is at least one item to show.
   *
   * @default true
   */
  enabled?: boolean;
  /**
   * Custom items to add to the header menu, listed after the built-in ones.
   *
   * Each item's `id` must be unique within the menu and must not match the id of a built-in item —
   * see {@link WidgetHeaderMenuTargets}.
   *
   * @example
   * Add a custom item to the widget header menu:
   * ```ts
   * const widgetConfig: WidgetConfig = {
   *   header: {
   *     menu: {
   *       items: [
   *         {
   *           type: 'action',
   *           id: 'open-details',
   *           caption: 'Open details',
   *           onClick: () => openDetails(),
   *         },
   *       ],
   *     },
   *   },
   * };
   * ```
   */
  items?: WidgetHeaderMenuItem[];
}

/**
 * Configuration for the widget title within the header.
 *
 * @alpha
 */
export interface WidgetHeaderTitleConfig {
  /**
   * Configuration for renaming the widget by editing its title in place.
   */
  editing?: {
    /**
     * Whether the widget title editing is enabled.
     *
     * @default false
     */
    enabled?: boolean;
  };
}

/**
 * Size of a custom widget header item, in pixels.
 */
export interface WidgetHeaderItemSize {
  /**
   * Fixed width of the item, in pixels.
   *
   * If omitted, it falls back to the default widget header item size of `28px`.
   *
   * @default 28
   */
  width?: number;
  /**
   * Fixed height of the item, in pixels.
   *
   * If omitted, it falls back to the default widget header item size of `28px`. A taller item grows
   * the whole header row.
   *
   * @default 28
   */
  height?: number;
}

/**
 * Props passed to a {@link WidgetHeaderItemComponent} when it is rendered.
 */
export interface WidgetHeaderItemComponentProps {
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
 * A React component that renders the content of a custom widget header item.
 *
 * @param props - Props for the component, including the item's resolved size.
 * @returns The rendered content of the header item.
 */
export type WidgetHeaderItemComponent = (props: WidgetHeaderItemComponentProps) => ReactNode;

/**
 * Position of a custom widget header item relative to the other items.
 *
 * - `auto` (default) — placed at the start of the trailing group, right after the trailing spacer.
 * - `before` / `after` — placed immediately before/after the item with the given `target` id.
 *   Pass a {@link WidgetHeaderTargets} constant to anchor to a built-in item (works even when that
 *   built-in is currently hidden), or any custom item id to anchor to another injected item.
 * - `first` / `last` — placed at the very start/end of the header.
 */
export type WidgetHeaderItemPosition =
  | { type: 'auto' }
  | { type: 'before'; target: WidgetHeaderTarget | string }
  | { type: 'after'; target: WidgetHeaderTarget | string }
  | { type: 'first' }
  | { type: 'last' };

/**
 * A custom item to inject into the widget header.
 */
export interface WidgetHeaderItem {
  /**
   * Unique identifier of the item.
   *
   * Must not match a built-in widget header item id (see {@link WidgetHeaderTargets}).
   */
  id: string;
  /**
   * Component that renders the content of the item.
   */
  component: WidgetHeaderItemComponent;
  /**
   * Placement of the item.
   *
   * Defaults to `{ type: 'auto' }` (the start of the trailing group, after the trailing spacer).
   */
  position?: WidgetHeaderItemPosition;
  /**
   * Size of the item.
   */
  size?: WidgetHeaderItemSize;
}

/**
 * A widget header item after the built-in and custom items have been ordered (position applied).
 *
 * This is the shape passed to {@link WidgetHeaderConfig.onBeforeRender}.
 */
export type WidgetResolvedHeaderItem = Omit<WidgetHeaderItem, 'position'>;

/**
 * Transforms the fully ordered list of widget header items right before rendering.
 *
 * @param items - The fully ordered list of header items (built-in + custom), immediately before rendering.
 * @returns The list of header items to render.
 */
export type WidgetHeaderItemsTransform = (
  items: ReadonlyArray<WidgetResolvedHeaderItem>,
) => WidgetResolvedHeaderItem[];

/**
 * Configuration for the widget header.
 */
export interface WidgetHeaderConfig {
  /**
   * Configuration for the widget title.
   *
   * @alpha
   */
  title?: WidgetHeaderTitleConfig;
  /**
   * Configuration for the widget header menu.
   */
  menu?: WidgetHeaderMenuConfig;
  /**
   * Custom items to inject into the header row.
   *
   * Each item's `id` must be unique and must not match a built-in item id (see
   * {@link WidgetHeaderTargets}). Items can only be added here — to modify, reorder or remove
   * built-in items use {@link WidgetHeaderConfig.onBeforeRender}.
   *
   * @example
   * Add a custom button to the widget header, right before the "⋮" menu button:
   * ```tsx
   * const widgetConfig: ChartWidgetConfig = {
   *   header: {
   *     items: [
   *       {
   *         id: 'refresh',
   *         position: { type: 'before', target: WidgetHeaderTargets.Menu },
   *         size: { width: 28 },
   *         component: () => <RefreshButton />,
   *       },
   *     ],
   *   },
   * };
   * ```
   */
  items?: WidgetHeaderItem[];
  /**
   * Advanced callback to inspect and rewrite the full, ordered list of header items (built-in +
   * custom) right before rendering. The only way to modify or remove built-in items.
   *
   * @example
   * Hide the built-in info button:
   * ```ts
   * const widgetConfig: ChartWidgetConfig = {
   *   header: {
   *     onBeforeRender: (items) =>
   *       items.filter((item) => item.id !== WidgetHeaderTargets.InfoButton),
   *   },
   * };
   * ```
   */
  onBeforeRender?: WidgetHeaderItemsTransform;
}
