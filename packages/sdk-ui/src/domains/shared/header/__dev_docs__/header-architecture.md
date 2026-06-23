# Unified Header Items — Architecture

A single, framework-agnostic model for configuring the items shown in a component header
(title, buttons, menu, …). It lets end users **inject** new header items, and — through
`onBeforeRender` — **modify or remove** the built-in ones. Today it powers the **Dashboard**
header; Widget and FilterTile are planned to adopt the same core.

> Source: `src/domains/shared/header/`
> Future sizing direction (measured allocator): see [`future-sizing.md`](./future-sizing.md).

---

## 1. Mental model

A header is a **single ordered list of items** rendered in one flex row.

- **Everything is a header item, including the title and a center spacer.** The title is a normal
  item with the id `DashboardHeaderTargets.Title`; the spacer has `DashboardHeaderTargets.Spacer`.
- Each item has a stable **`id`**, a **`component`** to draw, an optional **`position`**, and an
  optional **`size`** (fixed pixels).
- Layout uses a **center spacer**, not a growing title: the title takes its natural content width
  on the left, the spacer grows to fill the middle, and action items sit on the right. So
  `after: Title` lands right next to the title text, and the right group stays right-aligned even
  if the title is removed.
- Built-in items expose their ids as **public target constants** (`DashboardHeaderTargets`). Those
  ids are the anchors that custom items target.
- **Conditionally-shown built-ins stay in the model as hidden anchors.** A built-in that the config
  doesn't currently render (e.g. the filter toggle when its icon is off) is still present in the
  skeleton with `hidden: true`, so `before`/`after` targeting it resolves to a stable spot. Hidden
  items are dropped before `onBeforeRender` and before rendering — they never appear in the DOM and
  the transform never sees them.

```text
[ left ][ Title ][ after:Title ][ ←─── Spacer (grows) ───→ ][ auto ][ EditToggle ][ FilterToggle ][ Menu ]
 first/   content   after:Title                               auto items land    trailing action items
 before:  width                                               right after the
 Title    (ellipsizes)                                        spacer
```

### Injecting vs. modifying

- **`config.header.items`** can only **add new** items. Reusing a built-in id (including a hidden
  one) **logs a `console.error` and ignores that item** — built-ins can't be overridden via
  `items`. Duplicating another custom id **throws** (a clear authoring bug). Both rules keep
  injection predictable and prevent accidental breakage of built-in behavior.
- **Modifying or removing built-in items** is an advanced operation done in
  **`config.header.onBeforeRender`**, which receives the full, already-ordered list (every
  `position` resolved) and returns the final list.

---

## 2. The data model

The shared types are **internal**; each
component (today the dashboard; later Widget/FilterTile) exposes its **own** public item/config
types, which lets each document component-specific defaults (e.g. the dashboard's 28px size) and
narrow `position.target` to its own slot ids.

### Internal types (`shared/header/types.ts`)

```ts
// The single internal item the resolver/renderer operate on. `fill`/`hidden` are built-ins only.
interface HeaderItem {
  id: string;
  component: HeaderItemComponent; // (props: { size }) => ReactNode
  position?: HeaderItemPosition; // target: string
  size?: HeaderItemSize; // { width?: number; height?: number }
  fill?: HeaderItemFill; // 'content' | 'truncate' | 'grow' (built-ins only)
  hidden?: boolean; // anchor-only: orders like a normal item, but dropped before render (built-ins only)
}
type ResolvedHeaderItem = Omit<HeaderItem, 'position'>; // what the renderer renders
type HeaderItemsTransform = (items: ResolvedHeaderItem[]) => ResolvedHeaderItem[];
interface HeaderConfig {
  // non-generic
  items?: HeaderItem[];
  onBeforeRender?: HeaderItemsTransform;
}
```

`fill` (the title is `truncate`, the spacer is `grow`, action buttons/menu are `content`) is
internal CSS sizing that is never exposed to users.

### Public per-component types (`dashboard-header-config.ts`) — `@alpha`

Mirror the internal shapes but: drop `fill`/`hidden`, keep `position.target` as `string` (so an
item can anchor to a built-in **or** to another custom item), and give `size` Dashboard-specific
docs (28px default). `DashboardHeaderTargets` is documented as the source of built-in target ids.
Each public type is **structurally assignable** to its internal counterpart, so the dashboard
passes them straight to the resolver with no casts.

```ts
interface DashboardHeaderItemSize {
  width?: number;
  height?: number;
} // docs: defaults to 28px
type DashboardHeaderItemComponent = (props: { size: DashboardHeaderItemSize }) => ReactNode;

type DashboardHeaderItemPosition =
  | { type: 'auto' }
  | { type: 'before'; target: string } // a DashboardHeaderTargets id or another custom item id
  | { type: 'after'; target: string }
  | { type: 'first' }
  | { type: 'last' };

interface DashboardHeaderItem {
  id: string; // must not match a built-in id (DashboardHeaderTargets), including hidden ones
  component: DashboardHeaderItemComponent;
  position?: DashboardHeaderItemPosition;
  size?: DashboardHeaderItemSize;
}
type DashboardResolvedHeaderItem = Omit<DashboardHeaderItem, 'position'>;

interface DashboardHeaderConfig {
  // non-generic, component-specific
  items?: DashboardHeaderItem[];
  onBeforeRender?: (items: DashboardResolvedHeaderItem[]) => DashboardResolvedHeaderItem[];
}
```

A future `WidgetHeaderItem` / `WidgetHeaderConfig` (etc.) would follow the same pattern with its own
target ids and size defaults.

---

## 3. Resolution pipeline (`resolve-header-items.ts`)

`resolveHeaderItems(builtInItems, config?, { autoAnchorId })` is a **pure function**. Note
`builtInItems` is the **full** skeleton — every built-in, including ones currently `hidden`.

1. **Validate** — a user item that reuses a built-in id (visible or hidden) is logged via
   `console.error` and skipped; a user item that duplicates another user id throws.
2. **Order** — built-ins form a stable skeleton; user items are placed as ordered blocks
   preserving declaration order: `first`/`last` at the ends, `auto` immediately **after**
   `autoAnchorId` (the spacer), `before`/`after` relative to a target (with deferral for targets
   that are themselves being placed). A target pointing at a hidden built-in **resolves** (it's in
   the skeleton); only a genuinely **unknown** target is unresolvable → logged via `console.error`
   and the item is dropped.
3. **Drop hidden anchors** — items flagged `hidden` have served their ordering purpose and are
   removed here, so they reach neither `onBeforeRender` nor the renderer.
4. **`onBeforeRender`** — the fully ordered, visible list is handed to the transform (the only
   place built-in items can be modified or removed). `fill` is preserved at runtime across spreads.
   A duplicate id introduced by the transform throws.

---

## 4. Sizing & layout (`header-item-size.ts`, `header-items-renderer.tsx`)

`HeaderItemsRenderer` renders the resolved list into one flex row. Each item's component is
rendered inside its **own per-item cell** (`HeaderItemCell`), so a component may safely use hooks —
toggling items mounts/unmounts whole cells instead of shifting hook order.

Both dimensions default to a **per-component** value (`resolveHeaderItemSize(size, defaultSize)`):
the framework fallback is `DEFAULT_HEADER_ITEM_SIZE` (`24px`), and each component passes its own via
the renderer's `defaultSize` prop — the **dashboard uses `28px`** (`DASHBOARD_HEADER_ITEM_SIZE`),
and future widgets/filters set their own. The cell CSS is derived from the resolved size and the
internal `fill`:

| input                | CSS                            | Behavior                                                                                                      |
| -------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `fill: 'grow'`       | `flex: 1 1 auto; min-width: 0` | The center spacer; absorbs free space.                                                                        |
| `fill: 'truncate'`   | `flex: 0 1 auto; min-width: 0` | The title; natural width, **shrinks/ellipsizes**.                                                             |
| `fill: 'content'`    | `flex: 0 0 auto`               | Built-in action buttons/menu; natural width, **never shrinks** (a long title can't squeeze/clip their icons). |
| no `fill` (external) | `flex: 0 0 auto; width: Npx`   | Injected items; **fixed pixel width** (provided or defaulted).                                                |

`fill` is **internal** — set only on built-in items. **External (injected) items never carry it**,
so they are always laid out at a fixed pixel width (their `size.width`, or the component default).
Content-based sizing is intentionally **not** offered to external items: requiring a concrete size
now keeps configs forward-compatible with the planned JS-driven `range`/`steps` sizing (see
[`future-sizing.md`](./future-sizing.md)) instead of risking a breaking change later. `height`,
when set, is applied as a fixed pixel height. The component receives the resolved `size` via
`props.size`.

> The richer sizing model (ranges, discrete small/big steps, content measurement, overflow/hide)
> is intentionally deferred — see [`future-sizing.md`](./future-sizing.md).

---

## 5. Dashboard integration (reference implementation)

```text
dashboard.tsx
  builds built-in action items (edit-mode toolbar, edit toggle, filter toggle) as internal HeaderItem,
  each always present with `hidden: !shouldShow` so it can still anchor positioning
  + useDashboardHeaderMenuItem(...)  → the menu item (hidden when there are no menu sections)
  → DashboardContainer (title, headerItems, headerConfig = config.header)
      assembles the unified list: [ createDashboardTitleItem(title), createHeaderSpacerItem(Spacer), ...actions ]
      → DashboardHeader  (pure renderer)
          useResolvedHeaderItems(items, config, { autoAnchorId: DashboardHeaderTargets.Spacer })
          → HeaderItemsRenderer
```

Key files:

- `components/dashboard-header-targets.ts` — `DashboardHeaderTargets` ids + `DashboardHeaderTarget`.
- `components/dashboard-header-config.ts` — `DashboardHeaderItem`, `DashboardHeaderItemPosition`,
  `DashboardHeaderConfig`.
- `components/dashboard-header-title.tsx` — title component + `createDashboardTitleItem(title)`
  (`fill: 'truncate'`).
- `hooks/use-dashboard-header-menu-item.tsx` — builds the menu item (`fill: 'content'`; `hidden`
  when there are no menu sections).
- `components/dashboard-container.tsx` — assembles `[ title, spacer, ...actions ]`; root CSS.
- `components/dashboard-header.tsx` — resolves and renders.
- `types.ts` — `DashboardConfig.header?: DashboardHeaderConfig` (`@alpha`).

### Examples

```ts
// Inject a custom button into the trailing group (default 'auto' → after the spacer):
config.header = { items: [{ id: 'export', component: () => <ExportButton /> }] };

// Add an item to the LEFT of the title:
config.header = {
  items: [{ id: 'back', position: { type: 'first' }, component: () => <BackButton /> }],
};

// Give a custom item a fixed width (pixels):
config.header = {
  items: [{ id: 'clock', size: { width: 80 }, component: () => <Clock /> }],
};

// Anchor a custom item to a built-in that may be hidden right now (resolves either way):
config.header = {
  items: [
    {
      id: 'help',
      position: { type: 'before', target: DashboardHeaderTargets.Menu },
      component: () => <HelpButton />,
    },
  ],
};

// Modify or remove a BUILT-IN item — only via onBeforeRender (hidden anchors are not passed in):
config.header = {
  onBeforeRender: (items) => items.filter((i) => i.id !== DashboardHeaderTargets.Menu),
};
```

---

## 6. Plugins & Modules API

Header customization is also the seam for non-end-user integrations. Both the **plugin system**
(which will be able to modify component props before render) and the **modules API** can contribute to a
header by supplying the same `config.header` shape — `items` to add and/or `onBeforeRender` to
modify the resolved list. Because every contributor funnels through `resolveHeaderItems`, they all
get identical positioning, validation, and ordering semantics for free. (The concrete wiring into
the plugin/modules pipelines lands in a later milestone; the model is already designed for it.)

---

## 7. Extending to other components

1. Define a `*HeaderTargets` constant with the component's built-in item ids (include a `Spacer`).
2. Build the built-in items: title with `fill: 'truncate'`, then `createHeaderSpacerItem(<spacer id>)`,
   then action items (`fill: 'content'` for icon buttons). Mark conditionally-shown built-ins
   `hidden: !shouldShow` rather than omitting them, so they remain valid positioning anchors.
3. Add component-specific `*HeaderItem` / `*HeaderItemPosition` / `*HeaderConfig` types
   (keeping `position.target` as `string`, documenting `*HeaderTargets` as the built-in anchors)
   and expose `header?: …Config` on the component config (tag `@alpha` initially).
4. Render via `useResolvedHeaderItems(builtIns, config.header, { autoAnchorId: <spacer id> })`
   and `<HeaderItemsRenderer />`.

Roadmap: **M1 Dashboard (done)** → M2 Widget → M3 FilterTile → M4 plugin/modules wiring →
M5 advanced sizing ([`future-sizing.md`](./future-sizing.md)) + Angular/Vue ports.

---

## 8. Why this shape

- **One flat list** mirrors how Widget/FilterTile already lay out (leading title + trailing
  actions), so the model fits all three without per-component layout concepts.
- **A center spacer** (not a growing title) keeps positional intuition matching the visual result
  and keeps the right group right-aligned regardless of the title.
- **Public width = fixed pixels; internal `fill` for title/spacer** keeps the authored API tiny
  while still supporting the two CSS behaviors built-ins need.
- **Add-only `items` + `onBeforeRender` for built-ins** makes the common case (inject) safe, while
  keeping the full power (modify/remove/reorder) behind one explicit hook shared by end users,
  plugins, and the modules API.
- **Pure resolver** keeps ordering logic unit-testable and side-effect-free.
