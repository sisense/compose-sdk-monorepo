---
type: Component
title: Dashboard header
description: The dashboard header bar — its config type, built-in item targets, the ordering/transform algorithm shared with widget headers, and the `dashboardHelpers` namespace including `withHeaderItem`.
resource: packages/sdk-ui/src/domains/dashboarding/components/dashboard-header
tags: [sdk-ui, dashboarding, component]
---

## Purpose

The header is a pure renderer over an ordered list of `HeaderItem`s: `Dashboard` supplies the built-ins, `DashboardContainer` prepends title and spacer, the shared resolver merges the user's `config.header.items` and applies `onBeforeRender`. This doc also covers `dashboard-helpers.ts` (`withHeaderItem` and the public `dashboardHelpers` namespace) and `hooks/use-dashboard-header-menu-item.tsx`, which build header items outside this folder.

## Entry point

| What                           | Where                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Component (not exported)       | `DashboardHeader` — `packages/sdk-ui/src/domains/dashboarding/components/dashboard-header/dashboard-header.tsx:46`                                                                                                                                                                                                                                        |
| Config types (public)          | `DashboardHeaderConfig` `:108`, `DashboardHeaderItem` `:68`, `DashboardHeaderItemPosition` `:58`, `DashboardHeaderItemSize` `:8`, `DashboardHeaderItemComponent` `:47`, `DashboardHeaderItemComponentProps` `:30`, `DashboardResolvedHeaderItem` `:96`, `DashboardHeaderItemsTransform` `:101` — `components/dashboard-header/dashboard-header-config.ts` |
| Targets (public)               | `DashboardHeaderTargets` `:9`, `DashboardHeaderTarget` `:27` — `components/dashboard-header/dashboard-header-targets.ts`                                                                                                                                                                                                                                  |
| Title item                     | `createDashboardTitleItem` `:41`, `DashboardHeaderTitle` `:28` (not exported) — `components/dashboard-header/dashboard-header-title.tsx`                                                                                                                                                                                                                  |
| Layout constants               | `DASHBOARD_HEADER_HEIGHT = 48`, `DASHBOARD_HEADER_ITEM_SIZE = 28`, `DASHBOARD_HEADER_ITEMS_GAP = 10` — `components/dashboard-header/constants.ts:9,14,19`                                                                                                                                                                                                 |
| Menu item hook (not exported)  | `useDashboardHeaderMenuItem` — `packages/sdk-ui/src/domains/dashboarding/hooks/use-dashboard-header-menu-item.tsx:16`                                                                                                                                                                                                                                     |
| Transformer (@sisenseInternal) | `withHeaderItem` — `packages/sdk-ui/src/domains/dashboarding/dashboard-helpers.ts:355`; `modules/sisense-internal/public-api/sisense-internal.ts:99`                                                                                                                                                                                                      |
| Namespace (public)             | `dashboardHelpers` — `export * as` at `packages/sdk-ui/src/public-api/public.ts:338`                                                                                                                                                                                                                                                                      |
| Shared resolver                | `resolveHeaderItems` — `packages/sdk-ui/src/domains/shared/header/resolve-header-items.ts:155`; `HeaderItem` — `shared/header/types.ts:54`                                                                                                                                                                                                                |

## Contract

### Targets (`dashboard-header-targets.ts:9-22`, verbatim)

```ts
export const DashboardHeaderTargets = {
  Title: 'dashboard-header-title',
  Spacer: 'dashboard-header-spacer',
  EditModeToolbar: 'dashboard-header-edit-mode-toolbar',
  EditToggle: 'dashboard-header-edit-toggle',
  FilterToggle: 'dashboard-header-filter-toggle',
  Menu: 'dashboard-header-menu',
} as const;
```

### Config (`dashboard-header-config.ts`)

```ts
interface DashboardHeaderConfig {
  visible?: boolean; // default true (resolved by isDashboardHeaderVisible)
  items?: DashboardHeaderItem[]; // ids must not collide with DashboardHeaderTargets
  onBeforeRender?: (
    items: ReadonlyArray<DashboardResolvedHeaderItem>,
  ) => DashboardResolvedHeaderItem[];
}
interface DashboardHeaderItem {
  id: string;
  component: DashboardHeaderItemComponent; // (props: DashboardHeaderItemComponentProps) => ReactNode
  position?: DashboardHeaderItemPosition;
  size?: DashboardHeaderItemSize;
}
type DashboardHeaderItemPosition =
  | { type: 'auto' }
  | { type: 'first' }
  | { type: 'last' }
  | { type: 'before'; target: DashboardHeaderTarget | string }
  | { type: 'after'; target: DashboardHeaderTarget | string };
```

### Rendering order

1. Skeleton, in declared order: `[Title, Spacer, EditModeToolbar, EditToggle, FilterToggle, Menu]` — title + spacer from `dashboard-container.tsx:95-102`, the rest from `dashboard.tsx:345-348`. Built-ins carry `fill` (`'truncate'` title, `'grow'` spacer, `'content'` buttons) and may be `hidden: true` anchors (`shared/header/types.ts:39`, `:72`).
2. User items (`resolve-header-items.ts:103-142`): `first` prepended, `last` appended, `auto` inserted right after the spacer (`autoAnchorId: DashboardHeaderTargets.Spacer`, `dashboard-header.tsx:50`), then `before`/`after` groups placed relative to their target, retried until no progress; groups with an unknown target are `console.error`-ed and dropped (`:133-139`).
3. Hidden built-ins are removed (`:173`), `onBeforeRender` runs on the remaining public shape (`:178`), duplicate ids after the transform throw (`:183`).
4. `HeaderItemsRenderer` lays the result out as one flex row (`data-testid="header-items-row"`, `shared/header/header-items-renderer.tsx:58`); each cell is `data-testid="csdk-<item id>"` (`shared/header/header-item-cell.tsx:14`, `:39`).

User item ids that match a built-in are `console.error`-ed and skipped (`:34-40`); duplicate ids within `items` throw (`:42`).

### `dashboardHelpers` namespace (`dashboard-helpers.ts`)

| Export                                                                                        | Line                                       | Level            |
| --------------------------------------------------------------------------------------------- | ------------------------------------------ | ---------------- |
| `replaceFilters`, `addFilter`, `addFilters`, `replaceFilter`, `removeFilter`, `removeFilters` | `:32`, `:55`, `:75`, `:98`, `:126`, `:147` | public           |
| `applyJtdConfig(dashboard, widgetOid, config)`, `applyJtdConfigs(dashboard, record)`          | `:187`, `:290`                             | public           |
| `withHeaderItem(item)(dashboard)` — appends to `config.header.items`                          | `:355`                                     | @sisenseInternal |

All return a new `DashboardProps`; the filter helpers delegate to `@/domains/filters/helpers` transformers (`:4-10`).

## How it connects

- `Dashboard` builds `editModeToolbarItem` (`dashboard.tsx:216`), `editToggleItem` (`:293`), `filterToggleItem` (`:321`) and `menuItem` via `useDashboardHeaderMenuItem(headerToolbarMenuItemSections)` (`:226`); the menu item is `hidden` when there are no sections (`use-dashboard-header-menu-item.tsx:42`) — currently only the edit-mode "columns" section (`dashboard.tsx:180-211`).
- `DashboardContainer` renders the header only when `isDashboardHeaderVisible(config)` (`dashboard-container.tsx:80`, `:107`) and passes `headerConfig = composedConfig?.header` (`dashboard.tsx:365`) — i.e. after module customizations, which is what makes `withHeaderItem` work from a [Dashboard module](./dashboard-module.md) customization.
- Theme: background/text/divider from `theme.dashboard.toolbar.*` (`dashboard-header.tsx:19-25`); toggle buttons take `themeSettings.dashboard.toolbar.primaryTextColor` (`dashboard.tsx:304`, `:331`).
- Same resolver powers widget headers (`WidgetHeaderTargets`, `public.ts:160`) — keep behaviour changes in `shared/header`, not here.

## Invariants and traps

1. Built-in items must always be present — hidden, never omitted — so `before`/`after` targets stay valid as config changes (`dashboard.tsx:213-215`; `edit toggle hidden rule :299`, `filter toggle :327`). A hidden built-in never reaches `onBeforeRender`, so `onBeforeRender` cannot un-hide the filter toggle; enable it via config instead.
2. `DashboardConfig.header` gets no defaults (`constants.ts:11`); `header.visible` undefined falls back to deprecated `toolbar.visible`, warning once per session (`utils.ts:16-25`, `:37-49`).
3. The title is the only item allowed to shrink (`fill: 'truncate'`, `dashboard-header-title.tsx:41-45`); the container uses `width: 0; min-width: 100%` so a long title ellipsizes instead of widening the dashboard (`dashboard-header.tsx:30-36`).
4. `withHeaderItem` appends — a customization applied on every render must therefore guard against adding the same id twice (see [useComposedDashboard](./composed-dashboard.md) trap 3).
5. `DashboardHeaderItemPosition.target` accepts any `string`, so a typo is a runtime `console.error` + dropped item, not a type error (`dashboard-header-config.ts:60-61`).
6. `applyJtdConfig(s)` silently drop unknown widget ids with a `console.warn` (`dashboard-helpers.ts:195`, `:311`) rather than throwing.

## Related

- [Dashboard and DashboardById](./dashboard-components.md) - where the built-in items are created
- [Dashboard module](./dashboard-module.md) - customizations that inject header items with `withHeaderItem`
- [Jump to dashboard](./jump-to-dashboard.md) - `JumpToDashboardConfig` consumed by `applyJtdConfig(s)`
- [Editable layout](./editable-layout.md) - the edit-mode toolbar rendered in the `EditModeToolbar` slot
- [Filters](../sdk-data/filters.md) - `Filter` operands of the filter helpers
