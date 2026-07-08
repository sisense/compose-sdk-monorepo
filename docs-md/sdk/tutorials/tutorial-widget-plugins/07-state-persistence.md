---
title: 7 | State Persistence
---

# State Persistence

Lessons 5 and 6 made your widget configurable and interactive. But by default, anything a user changes _inside_ the rendered widget — the current page of a table, a selected tab, a sort toggle — is lost on the next page reload. This lesson shows how to make that runtime state **survive reloads** by persisting it back to your Sisense instance.

## Two Kinds of Persistable State

A custom widget can persist two separate slices of state, and choosing the right one matters:

| Slice           | Holds                                                              | Conceptually          | Examples                                          |
| --------------- | ----------------------------------------------------------------- | --------------------- | ------------------------------------------------- |
| `styleOptions`  | Widget-level configuration — the same bag the design panel edits  | _Design_ / appearance | rows per page, color scheme, sort direction       |
| `customOptions` | Arbitrary plugin-specific runtime state, separate from appearance | _Session_ / interaction | last opened page, selected tab, expanded row IDs  |

A simple test: **would this setting belong in the design panel?** If yes (it shapes how the widget looks for everyone), persist it to `styleOptions`. If it's the result of a user navigating or interacting at view time, persist it to `customOptions`.

```text
Does this state need to survive a page reload?
├── YES → persist it
│         ├── Configuration that shapes appearance (rows, theme, sort) → styleOptions
│         └── User-driven session state (current page, selected tab)   → customOptions
│
└── NO  → plain useState — no persistence needed
          ├── Transient UI state (hover, tooltip open, drag-in-progress)
          └── Derived state (recomputed from props on every render)
```

## The `onChange` Callback

The SDK injects an `onChange` callback into your visualization's props when — and only when — the widget is rendered inside a [`Dashboard`](../../modules/sdk-ui/dashboards/function.Dashboard.md). Calling it requests that a slice of state be saved:

```tsx
// Persist a style option
props.onChange?.({ styleOptions: { rowsPerPage: 20 } });

// Persist custom runtime state
props.onChange?.({ customOptions: { lastOpenedPage: 3 } });
```

Three things to internalize about this callback:

1. **It's optional — always call it with `?.`.** Outside a dashboard (in the dev preview, or a standalone widget), `onChange` is `undefined`. Optional chaining makes the same component work in both contexts: it simply no-ops when persistence isn't available, so there's no separate code path to maintain.

2. **You pass a partial patch, not the whole object.** Send only the keys that changed. They're **deep-merged** into the saved state: nested objects merge recursively, while arrays and primitives are replaced wholesale. You can't _delete_ a key by merging — overwrite it with an explicit value instead.

   ```tsx
   // styleOptions is currently { rowsPerPage: 10, headerColor: '#1976d2' }
   props.onChange?.({ styleOptions: { rowsPerPage: 20 } });
   // → saved styleOptions becomes { rowsPerPage: 20, headerColor: '#1976d2' }
   //   headerColor is preserved — you only sent the key you changed
   ```

3. **The update is applied optimistically.** Inside a dashboard, the change is reflected immediately (your component re-renders with the new value via props) and saved to your Sisense instance shortly after. Rapid successive changes within a short window are batched into a single save, so you don't need to throttle ordinary interactions yourself.

## Typing `customOptions`

[`CustomVisualizationProps`](../../modules/sdk-ui/plugin-system/interface.CustomVisualizationProps.md) accepts a **fourth** type parameter, `CustomOptions`, that types your `customOptions` bag (and, by extension, the `customOptions` patch you pass to `onChange`):

```tsx
CustomVisualizationProps<DataOptions, StyleOptions, DataPoint, CustomOptions>;
```

| Parameter      | Default                  | Description                                          |
| -------------- | ------------------------ | ---------------------------------------------------- |
| `DataOptions`  | `GenericDataOptions`     | Shape of data options matching data panel inputs     |
| `StyleOptions` | `CustomVisualizationStyleOptions` | Shape of style options from the design panel |
| `DataPoint`    | `AbstractDataPointWithEntries` | Shape of data points in event handlers         |
| `CustomOptions` | `Record<string, unknown>` | Shape of plugin-specific runtime state (not data- or style-related) |

Declare both shapes in `src/types.ts` alongside your existing types:

```tsx
import type {
  CustomVisualizationProps,
  CustomVisualizationStyleOptions,
} from '@sisense/sdk-ui';

export interface StyleOptions extends CustomVisualizationStyleOptions {
  rowsPerPage?: 5 | 10 | 15 | 20;
  // ...other design-time options
}

// Plugin-specific runtime state, persisted via onChange({ customOptions })
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

Now `props.customOptions` is typed as `CustomOptions`, and `onChange?.({ customOptions: { lastOpenedPage: 3 } })` is type-checked against it.

## Bridging Props and Local State with `useSyncedState`

There's a subtlety. Your component needs **local** state so the UI responds instantly to a click — but the canonical value also arrives through **props** (`customOptions.lastOpenedPage`), which updates after the optimistic apply and on every reload. Wiring these together with raw `useState` + `useEffect` is easy to get wrong: you can echo prop-driven updates back into a save call and create a feedback loop.

`useSyncedState` from `@sisense/sdk-ui` solves exactly this. It behaves like `useState`, but also:

- **initializes** from a value you derive from props,
- **re-syncs** the local state when that value changes externally (deep-equality checked, so a reload or an optimistic update flows in), and
- fires an `onLocalStateChange` callback **only when you change the value locally** through its setter — never when it re-syncs from props. That asymmetry is what prevents the feedback loop.

```tsx
import { useSyncedState } from '@sisense/sdk-ui';

const [page, setPage] = useSyncedState(props.customOptions?.lastOpenedPage ?? 0, {
  // Fires only on local setPage(...) calls — not when the prop re-syncs.
  onLocalStateChange: (next) => props.onChange?.({ customOptions: { lastOpenedPage: next } }),
});
```

`setPage` updates the visible state _and_ requests persistence in one call. When the saved value comes back through props (or on reload), `useSyncedState` quietly adopts it without re-triggering `onChange`.

## Putting It Together

Here's a paginated table that persists **both** slices: `rowsPerPage` to `styleOptions` (configuration) and the current page to `customOptions` (session state).

```tsx
import type { CustomVisualization } from '@sisense/sdk-ui';
import { useExecuteCustomWidgetQuery, useSyncedState } from '@sisense/sdk-ui';

import type { VisualizationProps } from '../types';

export const PaginatedTable: CustomVisualization<VisualizationProps> = (props) => {
  const { data, isLoading, isError } = useExecuteCustomWidgetQuery(props);

  // Configuration → styleOptions. Kept in local state too, so the selector is
  // responsive before the saved value round-trips back through props.
  const [rowsPerPage, setRowsPerPage] = useSyncedState(props.styleOptions?.rowsPerPage ?? 10, {
    onLocalStateChange: (next) => props.onChange?.({ styleOptions: { rowsPerPage: next } }),
  });

  // Session state → customOptions. The user returns to the same page after a reload.
  const [page, setPage] = useSyncedState(props.customOptions?.lastOpenedPage ?? 0, {
    onLocalStateChange: (next) => props.onChange?.({ customOptions: { lastOpenedPage: next } }),
  });

  if (isLoading) return <div>Loading…</div>;
  if (isError || !data) return <div>No data available.</div>;

  const totalPages = Math.max(1, Math.ceil(data.rows.length / rowsPerPage));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = data.rows.slice(safePage * rowsPerPage, (safePage + 1) * rowsPerPage);

  return (
    <div>
      <table>
        {/* ...render pageRows... */}
      </table>

      <div>
        <select
          aria-label="Rows per page"
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value) as 5 | 10 | 15 | 20);
            setPage(0); // changing page size invalidates the current page
          }}
        >
          {[5, 10, 15, 20].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <button disabled={safePage === 0} onClick={() => setPage((p) => p - 1)}>
          ‹
        </button>
        <button disabled={safePage >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
          ›
        </button>
      </div>
    </div>
  );
};
```

Reload the dashboard and the table reopens on the same page, at the same page size. In the dev preview (no dashboard host), the selectors still work — they just don't persist, because `onChange` is `undefined`.

> **Seeding the dev preview.** Because there's no dashboard to inject `customOptions`, set a starting value in `src/dev-preview-props.ts` so your component has something to read while developing:
>
> ```tsx
> export const devPreviewProps: VisualizationProps = {
>   // ...dataSource, dataOptions, styleOptions, filters, highlights...
>   customOptions: { lastOpenedPage: 0 },
> };
> ```

## Visualization `onChange` vs. Design Panel `onChange`

Both the design panel ([Lesson 5](./05-design-panel.md)) and the visualization receive an `onChange` prop, and both ultimately persist `styleOptions` — but the two have **different signatures**, and mixing them up is a common mistake:

| Surface                         | Fires when                          | Argument shape                                                      | Call style                                   |
| ------------------------------- | ----------------------------------- | ------------------------------------------------------------------ | -------------------------------------------- |
| **Design panel** ([`DesignPanelProps`](../../modules/sdk-ui/interfaces/interface.DesignPanelProps.md)) | User edits in the editor sidebar    | The **full** `StyleOptions` object                                  | `onChange({ ...styleOptions, key: value })`  |
| **Visualization** ([`CustomVisualizationProps`](../../modules/sdk-ui/plugin-system/interface.CustomVisualizationProps.md)) | User interacts in the rendered widget | A **partial patch**: `{ styleOptions?, customOptions? }`            | `onChange?.({ styleOptions: { key: value } })` |

In short:

- The **design panel** is the design-time editor — it always replaces the whole `styleOptions` object (spread the existing options, set the changed key), and it only deals with `styleOptions`.
- The **visualization** persists view-time interactions — it sends a partial patch of just what changed, can target `customOptions` as well as `styleOptions`, and is optional (`onChange?.`) because it's absent outside a dashboard.

Both surfaces pair naturally with `useSyncedState`; they differ only in what `onLocalStateChange` forwards:

```tsx
// Design panel: forward the whole object (onChange takes full StyleOptions)
useSyncedState<StyleOptions>(mergedOptions, { onLocalStateChange: onChange });

// Visualization: wrap the changed key in a patch (onChange takes a partial update)
useSyncedState(props.styleOptions?.rowsPerPage ?? 10, {
  onLocalStateChange: (next) => props.onChange?.({ styleOptions: { rowsPerPage: next } }),
});
```

## Best Practices

1. **Persist only what's serializable.** Saved state round-trips as JSON to your Sisense instance. Store plain values — numbers, strings, booleans, and plain objects/arrays of those. Never persist functions, class instances, `Date` objects, or DOM nodes.

2. **Keep `customOptions` small and stable.** It's session state, not a cache. Store identifiers and indices (a page number, a set of selected IDs), not large derived datasets you can recompute from the query result.

3. **Don't persist transient or derived state.** Hover state, tooltip visibility, and anything you recompute from props on every render belong in plain `useState` — persisting them adds save traffic for state that shouldn't outlive the interaction.

4. **Debounce noisy inputs before persisting.** Free-typing a text field or dragging a color picker fires many updates. Debounce the value, then call `onChange` once it settles, so you're not requesting a save on every keystroke. (The SDK batches saves over a short window, but debouncing at the source keeps your local state changes intentional too.)

5. **Always read the persisted value back through props.** Seed `useSyncedState` from `props.styleOptions?.…` / `props.customOptions?.…` rather than from a one-time default, so a reload — or another client's change — flows back into your component.

## Using an AI Agent

Tell your AI agent what state should stick, in plain language:

- **"Persist the current page across reloads"** — adds a `CustomOptions` type with the field, threads the fourth type parameter through `CustomVisualizationProps`, and rewires the page state to `useSyncedState` + `onChange?.({ customOptions: … })`.
- **"Make rows-per-page a saved setting"** — moves the value into `StyleOptions`, persists it from the visualization via `onChange?.({ styleOptions: … })`, and (optionally) adds a matching control to the design panel.
- **"Why isn't my widget remembering its state?"** — checks that you're calling `onChange` (not just `setState`), reading the value back from props, and testing inside a dashboard rather than the standalone dev preview.

---

**Tutorial complete.** [Back to overview](./index.md)
