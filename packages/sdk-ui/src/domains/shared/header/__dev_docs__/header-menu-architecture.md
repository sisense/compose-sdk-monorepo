# Unified Header Menu — Architecture

A single, framework-agnostic model for configuring the **menu** of a component header — the list
behind the "⋮" button. It is the sibling of the unified header **items** model
([`header-architecture.md`](./header-architecture.md)): items configure what sits _in_ the header
row, this configures what sits _inside the header's menu_.

Today it powers the **Widget** header menu (`WidgetProps.config.header.menu`, public since
SNS-130723). FilterTile and Dashboard are planned to adopt the same core.

> Source: `src/domains/shared/header/resolve-header-menu-items.ts`,
> `src/domains/widgets/shared/widget-header/`

---

## 1. Mental model

A header menu is a **single ordered list of menu items** rendered in one popover.

- **Every entry is a menu item** of a declared **kind** (`type`), identified by a stable **`id`** and
  carrying a **`caption`**. Today: `action` (runs `onClick`) and `submenu` (opens nested `items`).
  More kinds — a named inline `group`, a boolean `toggle`, a `divider` — join the union additively
  (§4, M5).
- **Built-in items and user items live in the same list, built-ins first.** Built-ins are
  contributed by the features that own them (rename, duplicate, delete, export…) and always lead
  the menu; user items from `config.header.menu.items` follow.
- Built-in item ids are **reserved** and exposed publicly as `WidgetHeaderMenuTargets`. They are
  what makes the built-in/user boundary computable from one flat list (§3), and they are the anchors
  user items will target once relative positioning lands (§4, M2).
- **One resolution seam.** Every header menu funnels through `resolveHeaderMenuItems(config)`, so
  ordering and visibility rules stay identical across components. Ordering features are added
  _inside_ that function, never per component.

```text
┌ widget header ──────────────────────────────────────────────┐
│ Title                          [ info ] [ ⋮ ]               │
└──────────────────────────────────────────┬──────────────────┘
                                           ▼
                              ┌ header menu ─────────────┐
                              │ Rename widget   ← built-in│
                              │ Duplicate widget          │
                              │ Download            ▸     │
                              │   CSV File                │
                              │   Excel File        ▸     │
                              │ Custom Item        ← user │
                              └───────────────────────────┘
```

### Injecting vs. modifying

- **`config.header.menu.items`** can only **add new** items — the safe, common case.
- **`config.header.menu.enabled: false`** suppresses the whole menu button, built-ins included.
- **Modifying or removing individual built-in items** is an advanced operation reserved for
  `onBeforeRender` (§4, M3). It is deliberately not expressible through `items`.

This mirrors the header-items rule exactly: _add-only `items` + one explicit transform hook for
everything else_.

---

## 2. The data model

Same split as header items: a shared **internal** model plus **per-component public types**. The
per-component types let each component document its own defaults and, later, narrow
`position.target` to its own reserved ids.

### Internal (`shared/header/resolve-header-menu-items.ts`, `shared/types/menu-item.ts`)

```ts
// Each kind states itself via `type` — see "Kinds" below.
interface MenuItemBase {
  id: string;
  caption: string;
}
interface MenuActionItem extends MenuItemBase {
  type: 'action';
  onClick: () => void;
}
interface MenuSubmenuItem extends MenuItemBase {
  type: 'submenu';
  items: MenuItem[];
}
type MenuItem = MenuActionItem | MenuSubmenuItem;

const isMenuSubmenuItem = (item: MenuItem): item is MenuSubmenuItem => item.type === 'submenu';

interface HeaderMenuConfig {
  enabled?: boolean; // defaults to true
  items?: MenuItem[];
}

// The seam. Today: visibility + empty-submenu pruning. Tomorrow: ordering + transform (§4).
const resolveHeaderMenuItems = (config?: HeaderMenuConfig): MenuItem[] =>
  config?.enabled === false ? [] : withoutEmptySubmenus(config?.items ?? []);
```

### Kinds: why a discriminated union

Three kinds are planned, and two of them are **structurally identical**:

| kind             | shape                      | renders as                                    |
| ---------------- | -------------------------- | --------------------------------------------- |
| action           | `{ id, caption, onClick }` | a clickable row                               |
| submenu          | `{ id, caption, items }`   | a row that opens a nested popover             |
| group _(future)_ | `{ id, caption, items }`   | a non-clickable heading with its items inline |

Submenu and group cannot be told apart by shape, so structural discrimination is a dead end and the
kind is stated explicitly in `type`. That also means the renderer switches on intent instead of
sniffing which fields happen to be present — before the union it branched on `subItems`, so an item
carrying both `onClick` and `items` silently lost its handler and an item carrying neither rendered a
row that only closed the menu.

Three design points, each verified against `tsc --strict` rather than assumed:

1. **An untagged union does not scale here.** It can be made exclusive with `items?: never` /
   `onClick?: never` (and that does reject both invalid states, even for non-literal assignment), but
   it cannot express a third kind that shares a shape with an existing one. A tag can.
2. **The tag is required on every member.** Making it optional on `action` would keep the common case
   terser at the price of a documented "default kind" rule and `switch (item.type ?? 'action')` in
   every consumer — including the planned `onBeforeRender`, which hands users mixed lists.
3. **Emptiness is a runtime rule, not a type rule.** "A submenu has at least one item" would need
   `[MenuItem, ...MenuItem[]]`, which makes `Array.filter` results unassignable and would break
   `onBeforeRender` ergonomics. `resolveHeaderMenuItems` prunes empty submenus (recursively) instead,
   so a submenu that renders always has something in it.

`WidgetHeaderMenuItemBase` mirrors `MenuItemBase` publicly and is where the roadmap's shared fields
(`position`, `disabled`, `icon`) land once for every kind.

Naming follows the repo's union convention — members keep the base noun and insert the variant before
it, as in `PivotTableSelectableDrilldownOptions`. Note the vocabulary: **submenu** is the nested
popover, **group** is reserved for the future named inline group (§4, M5). The legacy render layer
calls the latter a _section_ (`MenuItemSection.sectionTitle`); that name stays internal.

### Public per-component (`widgets/shared/widget-header/widget-header-config.ts`)

```ts
interface WidgetHeaderMenuItemBase {
  id: string; // built-in ids are reserved
  caption: string;
}
interface WidgetHeaderMenuActionItem extends WidgetHeaderMenuItemBase {
  type: 'action';
  onClick: () => void;
}
interface WidgetHeaderMenuSubmenuItem extends WidgetHeaderMenuItemBase {
  type: 'submenu';
  items: WidgetHeaderMenuItem[];
}
type WidgetHeaderMenuItem = WidgetHeaderMenuActionItem | WidgetHeaderMenuSubmenuItem;

interface WidgetHeaderMenuConfig {
  enabled?: boolean;
  items?: WidgetHeaderMenuItem[];
}

interface WidgetHeaderConfig {
  title?: WidgetHeaderTitleConfig; // @alpha
  menu?: WidgetHeaderMenuConfig; // public
}

// Public, and load-bearing: the reserved ids that define the built-in block (§3).
const WidgetHeaderMenuTargets = {
  RenameWidget: 'widget-header-menu-rename-widget',
  /* …see the table in §3… */
} as const;
type WidgetHeaderMenuTarget =
  (typeof WidgetHeaderMenuTargets)[keyof typeof WidgetHeaderMenuTargets];
```

`WidgetHeaderMenuItem` is **structurally assignable** to the internal `MenuItem`, so the widget
passes config straight through with no casts. A future `FilterTileHeaderMenuItem` /
`DashboardHeaderMenuItem` follows the same pattern.

> **Why not export `MenuItem` itself?** The name is far too generic for a public surface, and
> `MenuItemSection` — an unrelated shape used by data-point context menus — is already public.
> Per-component types also keep the door open for narrowing `position.target` per component.

---

## 3. Where built-in items come from today

Built-ins are added by their owning feature via `withMenuItemInHeaderConfig` / `withHeaderMenuItem`
(`widgets/helpers/header-menu-utils.ts`), which insert into `config.header.menu.items`. Ids are
centralized — and public — in `widgets/shared/widget-header/widget-header-menu-targets.ts`.

| `WidgetHeaderMenuTargets` key | id                                              | Contributed by                      | Shown when                      |
| ----------------------------- | ----------------------------------------------- | ----------------------------------- | ------------------------------- |
| `RenameWidget`                | `widget-header-menu-rename-widget`              | `use-title-renaming`                | `header.title.editing.enabled`  |
| `DuplicateWidget`             | `widget-header-menu-duplicate-widget`           | `use-duplicate-widget-menu-item`    | dashboard duplication enabled   |
| `DeleteWidget`                | `widget-header-menu-delete-widget`              | `editable-layout`                   | dashboard edit mode             |
| `DistributeEqualWidth`        | `widget-header-menu-layout-equal-width`         | `editable-layout`                   | dashboard edit mode             |
| `Download`                    | `widget-header-menu-download`                   | csv/excel download hooks            | either export action enabled    |
| `DownloadCsv`                 | `widget-header-menu-download-csv`               | `use-with-csv-download-menu-item`   | `actions.downloadCsv.enabled`   |
| `DownloadExcel`               | `widget-header-menu-download-excel`             | `use-with-excel-download-menu-item` | `actions.downloadExcel.enabled` |
| `DownloadExcelRepeatRows`     | `widget-header-menu-download-excel-repeat-rows` | `use-with-excel-download-menu-item` | as above                        |
| `DownloadExcelMergeRows`      | `widget-header-menu-download-excel-merge-rows`  | `use-with-excel-download-menu-item` | as above                        |

These string values are now part of the public API surface and must not change. Always reference the
constants (source and tests alike) rather than the literals.

### Ordering: the built-in block

Built-ins and user items share one flat array, so "built-ins first" is enforced at insertion time by
`withBuiltInMenuItem(items, builtInItem)`:

```ts
[...items.filter(isBuiltIn), builtInItem, ...items.filter((item) => !isBuiltIn(item))];
```

`isBuiltIn` tests membership in `WidgetHeaderMenuTargets` — which is exactly why the reserved-id rule
is load-bearing rather than merely advisory. The result:

- **Built-ins keep their contribution order** — duplicate → delete → distribute → rename → download,
  following the order in which the owning hooks/components run.
- **User items always trail**, regardless of whether they were in `config` before any built-in was
  added.
- This matches the FilterTile, which already puts its built-in lock item first
  (`[lockItem, ...userItems]` in `use-filter-tile-menu-items`), so `position: 'auto'` can mean the
  same thing for both components in M2.

One gap remains for M2: **id collisions are unvalidated.** A user item that reuses a reserved id is
treated as a built-in by `isBuiltIn` (and, for `Download`, silently participates in the export-group
merge). M2 adds the validation header items already have — `console.error` + skip on a built-in
collision, throw on a duplicate user id.

---

## 4. Roadmap

Each milestone is **purely additive** to the interface shipped in M1 — see §5.

### M1 — Widget header menu, GA _(done, SNS-130723)_

- `WidgetProps.config.header.menu` replaces `config.header.toolbar.menu`; the `toolbar` level is
  removed with no alias.
- `menu` is public, both item kinds included; `header.title` stays `@alpha`.
- Menu items are an **exclusive union** of action | group, so the invalid states the renderer used to
  swallow are now compile errors (§2).
- Built-in ids centralized **and made public** as `WidgetHeaderMenuTargets` / `WidgetHeaderMenuTarget`.
- Built-ins always lead the menu, user items follow (`withBuiltInMenuItem`, §3) — aligning Widget with
  the FilterTile.
- Single resolution seam `resolveHeaderMenuItems`; menu rendering detached from
  `WidgetHeaderToolbar` into `WidgetHeaderMenu` (the toolbar is now only what
  `styleOptions.header.renderToolbar` can replace).

### M2 — `position`

Add relative placement, exactly mirroring header items:

```ts
type WidgetHeaderMenuItemPosition =
  | { type: 'auto' } // default — preserves M1 order
  | { type: 'before'; target: WidgetHeaderMenuTarget | string }
  | { type: 'after'; target: WidgetHeaderMenuTarget | string }
  | { type: 'first' }
  | { type: 'last' };

interface WidgetHeaderMenuItem {
  /* …M1 fields… */
  position?: WidgetHeaderMenuItemPosition;
}
```

Prerequisites, in order:

1. **Separate the built-in skeleton from user items** — the id-based boundary of §3 is enough to keep
   built-ins first, but not to place a user item _between_ two built-ins. Feature hooks stop
   inserting into `config.header.menu.items` and instead return built-ins that
   `resolveHeaderMenuItems` receives as its own argument
   (`resolveHeaderMenuItems(builtInItems, config)`), matching `resolveHeaderItems(builtInItems, config)`.
2. **Hidden anchors** — a built-in the current config does not render stays in the skeleton with
   `hidden: true` so `before`/`after` targeting it still resolves, then is dropped before render.
3. **Validation** — built-in id collision → `console.error` + skip; duplicate user id → throw;
   unknown target → `console.error` + drop.
4. **Nested targeting** — `target` may address an item inside a group (e.g. adding an item under
   `Download`). Resolution walks the tree; the id space is flat, so ids must be unique across
   levels.

`WidgetHeaderMenuTargets` is already public, so no new export is needed — `position.target` simply
starts accepting `WidgetHeaderMenuTarget | string`.

### M3 — `onBeforeRender`

```ts
interface WidgetHeaderMenuConfig {
  /* …M1/M2 fields… */
  onBeforeRender?: (
    items: ReadonlyArray<WidgetResolvedHeaderMenuItem>,
  ) => WidgetResolvedHeaderMenuItem[];
}
```

Receives the fully ordered list (built-in + user, `position` applied, hidden anchors dropped) and
returns the final list — the only way to modify, reorder, or remove built-in items. Runs inside
`resolveHeaderMenuItems`, after ordering. A duplicate id introduced by the transform throws.

### M4 — FilterTile & Dashboard adopt the same core

- `FilterTileConfig.header.menu` already has the target shape; move it onto
  `resolveHeaderMenuItems`, add `enabled`, and reconcile its built-in-first ordering with the
  widget's `auto` semantics.
- The dashboard header menu is currently `MenuItemSection[]` fed to `useDashboardHeaderMenuItem`.
  Converge it onto the same item model so `DashboardConfig.header.menu` can be configured like the
  widget's.

### M5 — More item kinds

Each joins the union without touching the existing members, because `type` already discriminates:

```ts
interface WidgetHeaderMenuGroupItem extends WidgetHeaderMenuItemBase {
  type: 'group';
  /** Listed inline beneath a non-clickable heading. Groups do not nest. */
  items: (WidgetHeaderMenuActionItem | WidgetHeaderMenuSubmenuItem | WidgetHeaderMenuToggleItem)[];
}

interface WidgetHeaderMenuToggleItem extends WidgetHeaderMenuItemBase {
  type: 'toggle';
  /** Current state, owned by the host. */
  checked: boolean;
  onChange: (checked: boolean) => void;
}

interface WidgetHeaderMenuDividerItem {
  type: 'divider'; // no id/caption — does not extend the base
}
```

Notes on each:

- **`group`** — the renderer already supports it structurally: a group maps to its own
  `MenuItemSection` with `sectionTitle`, which
  [`menu-section.tsx`](../../../../shared/components/menu/context-menu/menu-section.tsx) renders as a
  non-clickable `ListSubheader`. Its current styling is a grey band with a bottom border, so shipping
  this needs a restyle (shifted-left grey label), not new architecture. Groups do not nest; submenus
  may contain groups, since `SectionItem.subItems` is already `MenuItemSection[]`.
- **`toggle`** — must be its own kind rather than a flag on `action`: it carries `checked` plus
  `onChange(next)`, so the handler signature differs from `onClick`. Controlled rather than
  uncontrolled, matching how the host already owns widget state through `WidgetProps`. If single-select
  ever follows, prefer `checkbox`/`radio` over `toggle` so the pair reads consistently.
- **`divider`** — the case that proves the tag was necessary: no distinguishing field at all.

Plus additive optional fields on `WidgetHeaderMenuItemBase`: `icon`, `disabled`, `destructive`
styling, keyboard shortcut hints. `disabled` is already plumbed through `SectionItem.disabled`.

### M6 — Plugins & Modules API

The same seam is the integration point for non-end-user contributors: plugins (which will modify
component props before render) and the modules API both supply `config.header.menu`. Because every
contributor funnels through `resolveHeaderMenuItems`, they inherit identical positioning,
validation, and ordering semantics. See
[`plugin-system-technical-design.md`](../../../../infra/plugins/__dev-docs__/plugin-system-technical-design.md)
§4.5.

### M7 — Angular & Vue ports

`config.header.menu` flows through the shared `WidgetProps` type, so the wrappers need no per-field
work today. `position`/`onBeforeRender` carry function-valued fields, which need the usual wrapper
treatment (and are not expressible in dashboard DTOs — see the `WidgetConfigJSON` subset in
`analytics-composer/nlq-v3-translator/types.ts`, which intentionally keeps only `menu.enabled`).

---

## 5. Forward-compatibility contract

Why nothing in M2–M6 breaks an M1 config:

| Future feature             | Change to the M1 interface                                     | Breaking? |
| -------------------------- | -------------------------------------------------------------- | --------- |
| `position` on items        | new **optional** field on `WidgetHeaderMenuItemBase`           | no        |
| `onBeforeRender`           | new **optional** field on `WidgetHeaderMenuConfig`             | no        |
| `position.target` union    | widening `string` to `WidgetHeaderMenuTarget \| string`        | no        |
| Built-in skeleton split    | internal only — config shape untouched                         | no        |
| Ordering validation        | new `console.error` paths for configs that are already bugs    | no        |
| Icons/disabled             | new **optional** fields on `WidgetHeaderMenuItemBase`          | no        |
| New kinds (group, toggle…) | new union member with its own `type`; existing kinds untouched | no        |
| FilterTile/Dashboard adopt | new config locations on other components                       | no        |

Four invariants keep that table true, and all four are load-bearing:

- **`id` is required on every item.** Without it there is nothing for `position.target` to address
  and no way for `onBeforeRender` to identify an item. This is why `id` is mandatory even though the
  M1 renderer only uses it as a React key.
- **Built-in ids are reserved and frozen.** They are the boundary marker for the built-in block (§3)
  and the future `position` anchors, so their string values are a public contract from M1 onward.
- **`auto` is the default position and means "current M1 order"** — built-ins in contribution order,
  then user items. Introducing `position` must not move any existing item.
- **Every kind carries a `type`.** New kinds are additive precisely because no existing member has to
  be re-discriminated when one arrives — including kinds that share a shape with an existing member
  (`group` vs `submenu`) or carry no fields at all (`divider`).

---

## 6. Why this shape

- **Mirroring header items** means one mental model for the whole header: add-only `items`, one
  transform hook, stable built-in target ids, a pure resolver.
- **One flat resolver seam** keeps ordering rules from drifting per component, which is exactly what
  happened before it existed (widget vs. FilterTile ordering, duplicated
  "enabled && items.length" checks in `widget-header-toolbar` and `text-widget`).
- **Per-component public types over a shared `MenuItem`** keeps names meaningful in docs and lets
  each component narrow its own target ids later.
- **`enabled` separate from an empty `items`** distinguishes "the host turned the menu off" from
  "there is nothing to show", which matters once built-ins can appear without user config.
- **Deferring `position`/`onBeforeRender`** avoids shipping fields that do nothing. The interface is
  extensible to them; declaring them before they work would be worse than not having them.
