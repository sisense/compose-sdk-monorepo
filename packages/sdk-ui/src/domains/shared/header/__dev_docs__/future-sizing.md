# Future direction: measured header sizing

> Status: **proposal / not implemented.** The shipped implementation supports only fixed-pixel
> public widths plus the internal `fill` (`content`/`grow`) for the title and spacer
> (see [`header-architecture.md`](./header-architecture.md)). This document captures a stronger
> sizing model for when the needs below become real.

## Motivating needs

1. **Fixed width** — an item is exactly N px.
2. **Range width** — an item lives in `[min, max]`; under width pressure it shrinks toward `min`,
   never below.
3. **Content-based width (title)** — width follows the rendered content, shrinking/ellipsizing.
4. **Discrete small/big** — some buttons have two (or more) widths and pick the largest that fits.
5. **Overflow / hide** — when the header is too narrow, the least-important items are dropped
   (ideally into an overflow `…` menu).
6. The header item component should receive its **resolved pixel size**.

## Why CSS isn't enough

| Need                    | CSS flex alone?                               | Needs measured width in JS? |
| ----------------------- | --------------------------------------------- | --------------------------- |
| Fixed / range / content | ✅ (`flex`, `min/max-width`, `flex:0 1 auto`) | no                          |
| Discrete small/big      | ❌                                            | **yes**                     |
| Hide least-important    | ❌                                            | **yes**                     |

Needs 1–3 are already covered by CSS (that's what `fill` + a future fixed/range mapping do). Needs
4 and 5 have no robust pure-CSS solution — both require knowing the **available width** and the
**items' footprints** in JS. Once you measure for those, computing exact pixels for everyone is
free, which also satisfies need 6. So the simplest design that covers all five is a single
**measured allocator** as one source of truth (not a CSS-shrink + JS-decision hybrid, which means
two competing layout authorities).

## Core idea: normalize every item to one constraint, then run a pure allocator

Public (terse) sizing sugar:

```ts
type HeaderItemWidth =
  | number // fixed
  | 'content' // intrinsic (title); measured
  | { min?: number; max?: number } // range
  | { steps: number[] }; // discrete widths, e.g. [24, 120] = small/big
// + orthogonal overflow control on the item:
//   collapsible?: boolean          // may be dropped when there's no room (default false)
//   collapseOrder?: number         // who drops first (optional; default = trailing-first)
```

Everything normalizes to one internal shape the allocator understands:

```ts
interface WidthConstraint {
  id: string;
  minPx: number; // fixed→N, range→min, content→measuredMin (0/ellipsis), steps→min(steps)
  preferredPx: number; // fixed→N, range→max, content→measuredNatural, steps→max(steps)
  snap?: number[]; // steps only
  collapsible: boolean;
  collapseOrder: number;
}
```

Only `'content'` items need DOM **measurement** (their natural width); everything else is numeric.
That confines measurement to the title (and any future content items).

### The allocator (pure, the whole "brain")

```text
allocateHeaderWidths(constraints, availableWidth) -> { widths: Map<id,px>, hidden: id[] }

1. DROP:  while Σ minPx(visible) > available and a collapsible item remains:
             drop the next collapsible item (by collapseOrder)        // → overflow/hidden
2. GROW:  give everyone minPx; walk in order handing each up to (preferredPx − minPx) from the budget.
3. SNAP:  for `steps` items, round the grant DOWN to the largest step that fits; return the freed px.
4. SINK:  leftover budget is absorbed by the spacer (the one flex:1 item).
```

Deterministic, O(n), no DOM, trivially unit-testable with a table of cases (fits / shrinks / snaps
/ drops). Greedy-by-order is the simpler, predictable choice; proportional can be added later
without changing the interface.

### How it answers each need

1. **Fixed** → `minPx = preferredPx = N`.
2. **Range** → grows to `max`, shrinks no lower than `min`.
3. **Title** → measured natural width as `preferredPx`, small `minPx` so it ellipsizes; included in
   the allocation so the allocator knows the title's footprint when deciding what to hide.
4. **Small/big** → `steps`; SNAP picks the largest fitting step; the component gets the chosen px.
5. **Hide** → `collapsible` opt-in + `collapseOrder`; dropped ids returned in `hidden[]` for an
   overflow `…` item to render.
6. **Resolved px** → every visible item gets a concrete pixel width, passed via `props.size`.

## Architecture (5 thin layers)

```text
shared/header/
  sizing/
    types.ts                  # HeaderItemWidth (public) + WidthConstraint (internal)
    normalize-constraints.ts  # spec (+ measurements) -> WidthConstraint[]   (pure)
    allocate-header-widths.ts # the allocator above                          (pure, heavily tested)
    allocate-header-widths.test.ts
  use-header-layout.ts        # ResizeObserver(container) + refs/scrollWidth(content items)
                              #   -> normalize -> allocate -> resolved px      (only DOM/effect code)
  header-items-renderer.tsx   # applies resolved px; passes px via props.size; routes hidden → overflow
```

- `props.size` becomes resolved pixels only.
- The spacer stays the single `flex:1` slack sink; the allocator doesn't compute it.
- Measurement is one `ResizeObserver` on the row + `scrollWidth` reads for content items, inside a
  `useLayoutEffect` (measure → allocate → apply, before paint). Re-allocate only when the available
  width or a measured natural width actually changes, to avoid effect loops.

## Phasing

1. **Pure core** — `WidthConstraint` + `allocateHeaderWidths` + tests. No UI change.
2. **Wire measurement** — `useHeaderLayout`, apply resolved px, pass px to components. (Delivers
   fixed/range/content with px-to-component.)
3. **Discrete + overflow** — `{ steps }` snapping, `collapsible`, the built-in overflow `…` item.

## Trade-offs / risks

- Replaces "CSS owns layout" with "JS owns layout" — a real step up in complexity (layout effect +
  observer + a re-render). Justified **only** because needs 4–5 have no clean CSS answer; if those
  never materialize, stay on CSS.
- Measurement is the sharp edge: guard re-allocation against render loops; fall back to CSS-natural
  on first paint until the first measure lands.
- Greedy ordering is predictable but not proportional; fine for headers.
- Lighter alternative for need 4 alone: CSS container queries (`@container`) can flip a button
  small↔big at width breakpoints without JS, but they key off the container width (not the button's
  actual remaining space) and can't do need 5.
