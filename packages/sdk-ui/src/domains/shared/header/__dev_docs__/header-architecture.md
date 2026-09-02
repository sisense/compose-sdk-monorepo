# Unified Header Items — Architecture

A single, framework-agnostic model for configuring the items shown in a component header
(title, buttons, menu, …). It lets end users **inject** new header items, and — through
`onBeforeRender` — **modify or remove** the built-in ones. Today it powers the **Dashboard** and
**Widget** headers; FilterTile is planned to adopt the same core.

> Source: `src/domains/shared/header/`
> Future sizing direction (measured allocator): see [`future-sizing.md`](./future-sizing.md).
> The sibling model for what goes _inside_ a header's menu: see
> [`header-menu-architecture.md`](./header-menu-architecture.md).

---

## 1. Mental model

A header is a **single ordered list of items** rendered in one flex row.

- **Everything is a header item, including the title and a center spacer.** The title is a normal
  item with the id `DashboardHeaderTargets.Title`; the spacer has `DashboardHeaderTargets.Spacer`.
- Each item has a stable **`id`**, a **`component`** to draw, an optional **`position`**, and an
  optional **`size`** (fixed pixels).
- **Spacers absorb the free width; the title never does.** The title takes its natural content
  width and is the only item that shrinks (ellipsizing) under pressure, so `after: Title` always
  lands right next to the title text and action items keep their size. How many spacers there are is
  a per-component decision: the dashboard has one **center spacer** after the title; the widget has
  **one on each side of the title** (§6), which is how it positions the title left / center / right.
- **A spacer that isn't absorbing anything is still a real item.** It renders as a zero-width cell
  rather than being dropped, so a `before`/`after` position anchored to it resolves to the same spot
  whatever the current alignment is.
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

(That is the dashboard's row; the widget's, with its second spacer, is in §6.)

### Injecting vs. modifying

- **`config.header.items`** can only **add new** items. Reusing a built-in id (including a hidden
  one) **logs a `console.error` and ignores that item** — built-ins can't be overridden via
  `items`. Duplicating another custom id **throws** (a clear authoring bug). Both rules keep
  injection predictable and prevent accidental breakage of built-in behavior.
- **The component's own features contribute through that same `items` array**, marked with
  `asBuiltInHeaderItem`, which stamps a module-private `Symbol` key that is not spellable in the
  public item type. The marking is what lets a contribution claim a reserved id; a consumer's item still can't. One
  channel for everything that lands in a header means a component needs no private config surface for
  its own features (§6).
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

### Public per-component types (`dashboard-header-config.ts`)

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

`WidgetHeaderItem` / `WidgetHeaderConfig` (§6) follow the same pattern with their own target ids and
size defaults; a future `FilterTileHeaderItem` (etc.) would too.

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

## 6. Widget integration

The widget header applies the same model with one governing idea: **the header owns layout, features
own content.** Nothing about a title, an info button or a menu is built into the header — each is a
feature, and a widget's header is the set of features that widget has.

### Principles

- **A widget composes what it has, and never disables what it lacks.** A filter control has no query
  result to describe, so it never creates an info button; a text widget has no title. There is no
  switch to turn a default off, which means adding a feature never obliges other widgets to opt out
  of it.
- **One feature, one hook, one shape.** Each feature is a hook of the form
  `(headerConfig, params?) => headerConfig`, so a widget's header reads as a chain of the features it
  uses, and a reader sees the whole set at the call site.
- **One channel in.** Everything that lands in a header travels through `config.header.items`. What
  an item _is_ decides how it is placed: a **marked** item (§1) claims a reserved slot — whether the
  widget composed it or an outside feature contributed it by transforming widget props — while an
  unmarked item is the consumer's and is positioned by its `position`.
- **A slot table, not declaration order, decides where things go.** It also supplies each item's
  `fill`: a feature says what its item draws, never how wide it sits. Consequently a marked item must
  claim a registered slot — anything else is an authoring bug and throws.
- **An empty slot is still an anchor.** A slot nothing filled is built and then dropped before
  render, so `before: Menu` resolves the same whether or not this widget has a menu.
- **The header's own items are pure layout.** It builds exactly two: the spacers on either side of
  the title. Which one absorbs the free width _is_ the title alignment, so the header needs no
  alignment concept beyond them.

### Shape

```text
a widget                                   the header
  useWidgetHeader<Feature>(config, …)        spacers  (layout, from titleAlignment)
  … one line per feature it has             +
  ────────────────────────────────────►      marked items → their slots
        headerConfig                         unmarked items → their `position`
                                             → onBeforeRender → render
```

Slots left to right: the leading icons, the alignment spacer, the title, the growing spacer, then the
trailing actions. `WidgetContainer` takes one header prop and the widget passes it the end of its
chain; the header receives no other content.

The features live in `widget-header/features/` (one file each, with its tests); the slot table and
the spacers sit beside them. Items contributed from outside a widget — a JTD icon, the editable
layout's drag icon, a clear-selection button — live with the feature that owns them and reach the
header through the same `items` array.

---

## 7. Plugins & Modules API

Header customization is also the seam for non-end-user integrations. Both the **plugin system**
(which will be able to modify component props before render) and the **modules API** can contribute to a
header by supplying the same `config.header` shape — `items` to add and/or `onBeforeRender` to
modify the resolved list. Because every contributor funnels through `resolveHeaderItems`, they all
get identical positioning, validation, and ordering semantics for free. (The concrete wiring into
the plugin/modules pipelines lands in a later milestone; the model is already designed for it.)

---

## 8. Extending to other components

1. Define a `*HeaderTargets` constant with the component's built-in item ids (include a `Spacer`).
2. Build the built-in items: the title (`fill: 'truncate'`), the spacer(s), then the action items
   (`fill: 'content'` for icon buttons). One spacer after the title is enough when the title is
   always leading (the dashboard); add a second one before it when the component positions its title
   (the widget, §6) — an idle spacer stays as a zero-width `fill: 'content'` item so it remains an
   anchor. Give every action item its own id: one item per thing the user can see, never a wrapper
   around several. Mark conditionally-shown built-ins `hidden: !shouldShow` rather than omitting
   them, so they remain valid positioning anchors.
3. Make each item its own feature — one file, one hook of the shape
   `(headerConfig, params?) => headerConfig` (§6) — and let each component compose the features it
   has rather than switching off the ones it lacks. Features
   outside the component contribute their items through the public `items` array, marked with
   `asBuiltInHeaderItem`, and place them by a **slot table** of reserved ids (the widget's
   `WIDGET_HEADER_SLOTS`) rather than by declaration order. Never a render callback, and never a
   private config channel: the component then needs no knowledge of what a feature's item draws, and
   every item stays addressable by id.
4. Add component-specific `*HeaderItem` / `*HeaderItemPosition` / `*HeaderConfig` types
   (keeping `position.target` as `string`, documenting `*HeaderTargets` as the built-in anchors)
   and expose `header?: …Config` on the component config.
5. Render via `useResolvedHeaderItems(builtIns, config.header, { autoAnchorId: <spacer id> })`
   and `<HeaderItemsRenderer />`.
6. Let every item — the component's own and the features' — travel through the config's `items`
   array, marked as built-in. Not a render callback, and not a second prop: one channel is what keeps
   every item addressable by id and reachable from `onBeforeRender`.

Roadmap: **M1 Dashboard (done)** → **M2 Widget (done)** → M3 FilterTile → M4 plugin/modules wiring
→ M5 advanced sizing ([`future-sizing.md`](./future-sizing.md)). The dashboard's and the widget's
items are both ported to Angular and Vue; a port is one framework-flavored item/config type pair
plus the props translation that swaps the components.

The header **menu** has its own parallel roadmap — see
[`header-menu-architecture.md`](./header-menu-architecture.md) §4.

---

## 9. Why this shape

- **One flat list** mirrors how Widget/FilterTile already lay out (leading title + trailing
  actions), so the model fits all three without per-component layout concepts.
- **Spacers absorb the free width, never the title** keeps positional intuition matching the visual
  result (`after: Title` really is next to the title text) and keeps the action group right-aligned
  regardless of the title. Alignment is then just _which spacer grows_, so it needs no separate
  concept — and an idle spacer stays a zero-width item, so positions anchored to it don't move.
- **One item per visible thing** (no toolbar wrapper) is what makes every part of a header
  addressable by id — enough on its own that no render-callback slot has to live alongside the
  model.
- **Public width = fixed pixels; internal `fill` for title/spacer** keeps the authored API tiny
  while still supporting the two CSS behaviors built-ins need.
- **Add-only `items` + `onBeforeRender` for built-ins** makes the common case (inject) safe, while
  keeping the full power (modify/remove/reorder) behind one explicit hook shared by end users,
  plugins, and the modules API.
- **A component composes the items it has, instead of disabling the ones it lacks** keeps every
  widget's header honest with one less thing to remember: adding an item feature never obliges other
  widgets to opt out of it, and a slot left empty is still an anchor.
- **One channel, with a marking instead of a private config** keeps the public shape as the only
  shape: a feature's item and a user's item are the same kind of thing, so they get the same
  positioning, validation and `onBeforeRender` treatment, and the header stays ignorant of what its
  features draw. A slot table, not declaration order, is what makes that safe.
- **Pure resolver** keeps ordering logic unit-testable and side-effect-free.
