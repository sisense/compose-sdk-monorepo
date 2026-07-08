# State Persistence

Persist a user's runtime interactions with the rendered widget — current page, selected tab, sort toggle — so they survive a page reload. By default, anything a user changes _inside_ the visualization (not the design panel) is lost on reload. This guide wires that state back to the dashboard so it is saved to the Sisense instance.

This only applies to state the user changes at **view time, inside the rendered widget**. Style options edited in the design panel sidebar already persist (see `.claude/docs/design-panel.md`) — this guide is about the visualization component itself requesting a save.

## Two slices of persistable state

A custom widget can persist two separate things, and picking the right one matters:

| Slice           | Holds                                                          | Use for                                      |
| --------------- | -------------------------------------------------------------- | -------------------------------------------- |
| `styleOptions`  | Widget configuration — the same bag the design panel edits     | rows per page, color scheme, sort direction  |
| `customOptions` | Arbitrary plugin-specific runtime state, separate from styling | current page, selected tab, expanded row IDs |

Rule of thumb: **would this setting belong in the design panel?** If yes (it shapes how the widget looks for everyone), persist it to `styleOptions`. If it is the result of a user navigating or interacting at view time, persist it to `customOptions`.

Do **not** persist transient UI state (hover, tooltip open, drag-in-progress) or derived state (recomputed from props each render) — use plain `useState` for those.

## How it works — the `onChange` callback

The SDK injects an `onChange` callback into your visualization's props **only when the widget is rendered inside a dashboard**. Calling it requests that a slice of state be saved:

```tsx
// Persist a style option (configuration)
props.onChange?.({ styleOptions: { rowsPerPage: 20 } });

// Persist custom runtime state (session)
props.onChange?.({ customOptions: { lastOpenedPage: 3 } });
```

Three rules:

1. **Always call it with `?.`** — in the dev preview or standalone use, `onChange` is `undefined`. Optional chaining makes the same component work in both contexts (it simply no-ops when persistence is unavailable).
2. **Pass a partial patch, not the whole object** — send only the keys that changed. They are **deep-merged** into the saved state: nested objects merge recursively, arrays and primitives replace wholesale. You cannot delete a key by merging — overwrite it with an explicit value.
3. **The update is optimistic** — inside a dashboard the change is reflected immediately (your component re-renders with the new value via props) and saved shortly after. Rapid changes within a short window are batched into a single save.

## The `useSyncedState` bridge

Your component needs **local** state so the UI responds instantly, but the canonical value also arrives through **props** (and updates on reload). Wiring these with raw `useState` + `useEffect` risks echoing prop-driven updates back into a save call (a feedback loop).

`useSyncedState` from `@sisense/sdk-ui` solves this. It is like `useState`, but it also re-syncs from an external value when that value changes, and fires `onLocalStateChange` **only on local setter calls** — never on a prop re-sync. That asymmetry is what prevents the loop.

```tsx
import { useSyncedState } from '@sisense/sdk-ui';

const [page, setPage] = useSyncedState(
  props.customOptions?.lastOpenedPage ?? 0,
  {
    // fires only on local setPage(...) — not when the prop re-syncs on reload
    onLocalStateChange: (next) =>
      props.onChange?.({ customOptions: { lastOpenedPage: next } }),
  }
);
```

`setPage` updates the visible state _and_ requests persistence in one call.

---

## Step 1 — Type the persisted state in `src/types.ts`

`CustomVisualizationProps` takes a **fourth** type parameter, `CustomOptions`, that types the `customOptions` bag. Declare both shapes:

```ts
import type {
  AbstractDataPointWithEntries,
  CustomVisualizationProps,
  CustomVisualizationStyleOptions,
} from '@sisense/sdk-ui';

export interface StyleOptions extends CustomVisualizationStyleOptions {
  rowsPerPage?: 5 | 10 | 15 | 20; // configuration → persisted via styleOptions
  // ...other design-time options
}

// Plugin-specific runtime state → persisted via customOptions
export interface CustomOptions {
  lastOpenedPage?: number;
}

export type VisualizationProps = CustomVisualizationProps<
  DataOptions,
  StyleOptions,
  AbstractDataPointWithEntries,
  CustomOptions
>;
```

All fields must be **JSON-serializable** (no functions, class instances, `Date` objects) — persisted state round-trips as JSON.

## Step 2 — Persist `styleOptions` from the visualization

For configuration the user can also change at view time (e.g. a rows-per-page selector inside the widget):

```tsx
const [rowsPerPage, setRowsPerPage] = useSyncedState(
  props.styleOptions?.rowsPerPage ?? 10,
  {
    onLocalStateChange: (next) =>
      props.onChange?.({ styleOptions: { rowsPerPage: next } }),
  }
);

// in JSX:
<select
  value={rowsPerPage}
  onChange={(e) => setRowsPerPage(Number(e.target.value) as 5 | 10 | 15 | 20)}
>
  {[5, 10, 15, 20].map((n) => (
    <option key={n} value={n}>
      {n}
    </option>
  ))}
</select>;
```

## Step 3 — Persist `customOptions` from the visualization

For user-driven session state (e.g. the current page):

```tsx
const [page, setPage] = useSyncedState(props.customOptions?.lastOpenedPage ?? 0, {
  onLocalStateChange: (next) => props.onChange?.({ customOptions: { lastOpenedPage: next } }),
});

// in JSX:
<button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>‹</button>
<button onClick={() => setPage((p) => p + 1)}>›</button>;
```

## Step 4 — Seed the dev preview in `src/dev-preview-props.ts`

There is no dashboard in the dev preview to inject `customOptions`, so set a starting value yourself — otherwise `props.customOptions` is `undefined` while developing:

```ts
export const devPreviewProps: VisualizationProps = {
  // ...dataSource, dataOptions, filters, highlights...
  styleOptions: { rowsPerPage: 10 },
  customOptions: { lastOpenedPage: 0 },
};
```

In the dev preview the selectors still work — they just don't persist, because `onChange` is `undefined`. Persistence only takes effect when the plugin runs inside a dashboard.

---

## Visualization `onChange` vs. design-panel `onChange`

Both exist and both ultimately persist `styleOptions`, but they have **different signatures** — do not mix them up:

| Surface                                        | Argument shape                                           | Call style                                     |
| ---------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------- |
| **Design panel** (`DesignPanelProps`)          | The **full** `StyleOptions` object                       | `onChange({ ...styleOptions, key: value })`    |
| **Visualization** (`CustomVisualizationProps`) | A **partial patch**: `{ styleOptions?, customOptions? }` | `onChange?.({ styleOptions: { key: value } })` |

The design panel always replaces the whole `styleOptions` object (spread it) and only deals with `styleOptions`. The visualization sends a partial patch of just what changed, can target `customOptions`, and is optional (absent outside a dashboard).

Both pair naturally with `useSyncedState` — they differ only in what `onLocalStateChange` forwards:

```tsx
// Design panel: forward the whole object (onChange takes full StyleOptions)
useSyncedState<StyleOptions>(mergedOptions, { onLocalStateChange: onChange });

// Visualization: wrap the changed key in a patch (onChange takes a partial update)
useSyncedState(props.styleOptions?.rowsPerPage ?? 10, {
  onLocalStateChange: (next) =>
    props.onChange?.({ styleOptions: { rowsPerPage: next } }),
});
```

## Key rules

- **Call `onChange` with `?.`** — it is `undefined` outside a dashboard; never assert it non-null.
- **Send partial patches** — only the keys that changed; they deep-merge into saved state.
- **Read the persisted value back through props** — seed `useSyncedState` from `props.styleOptions?.…` / `props.customOptions?.…`, never from a one-time constant, so a reload flows back in.
- **Keep it serializable and small** — store identifiers and indices in `customOptions`, not large datasets you can recompute.
- **Debounce noisy inputs** (free-typed text, dragged sliders) before calling `onChange`, so you are not requesting a save on every keystroke.
- **`styleOptions` for configuration, `customOptions` for session state** — if it belongs in the design panel, it is `styleOptions`.
