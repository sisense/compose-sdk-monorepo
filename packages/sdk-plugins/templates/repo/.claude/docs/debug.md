Diagnose common plugin issues by reading all source files and checking for known problems. Report every issue found with the file, code location, and fix.

---

## What to read

Read these files before checking anything:

- `src/index.tsx`
- `src/types.ts`
- `src/components/Visualization.tsx`
- `src/components/DesignPanel.tsx`
- `src/dev-preview-props.ts`
- `package.json`

---

## Checks

### Check 1 — styleOptions accessed without defaults

`styleOptions` is `{}` on first render. Accessing any property without a default returns `undefined` and can cause blank renders or crashes.

**Look for:** `props.styleOptions.X` or `styleOptions.X` where the access is NOT guarded by `?.X` + `?? default`.

```ts
// BAD — crashes when styleOptions is undefined, or returns undefined on first render
const color = props.styleOptions.color;

// GOOD
const color = props.styleOptions?.color ?? '#333';
```

---

### Check 2 — Missing conditional query guard

If the data hook fires before the user assigns any columns in the data panel, the widget shows a confusing "No data" message on mount.

**Look for:** `useExecuteQuery({...})` with no `enabled` field, AND inputs in src/index.tsx with `minItems: 0` or no `minItems` set.

```ts
// MISSING GUARD — query fires immediately on mount with empty dataOptions
const { dimensions, measures } = extractDimensionsAndMeasures(props.dataOptions);
const { data } = useExecuteQuery({ dataSource, dimensions, measures, filters, highlights });

// GOOD
const { data } = useExecuteQuery({
  dataSource,
  dimensions,
  measures,
  filters,
  highlights,
  enabled: dimensions.length > 0,
});
```

---

### Check 3 — highlights not passed to useExecuteQuery

`highlights` must be passed explicitly to `useExecuteQuery`. Omitting it means cross-widget highlight-mode filters are silently ignored — all rows appear at full opacity regardless of other widgets' selections.

**Look for:** `useExecuteQuery({...})` calls. Verify `highlights: props.highlights` is present.

```ts
// WRONG — cross-filter highlights from other widgets are ignored
useExecuteQuery({ dataSource, dimensions, measures, filters });

// CORRECT
useExecuteQuery({
  dataSource,
  dimensions,
  measures,
  filters,
  highlights: props.highlights,
});
```

---

### Check 4 — Missing `attribute` in data point entries for cross-filtering outgoing

The SDK cannot build a member filter without the `attribute` field. Cross-filtering click events silently do nothing without it.

**Look for:** Objects with `entries:` containing dimension values. Check that each dimension entry has `attribute: col.column as Attribute`.

```ts
// BAD — SDK can't build the filter
{ dataOption: col, value: 'foo', displayValue: 'foo' }

// GOOD
{ dataOption: col, value: 'foo', displayValue: 'foo', attribute: col.column as Attribute }
```

Also check that `e.nativeEvent` (not the React `SyntheticEvent`) is passed to the handler:

```ts
onClick={(e) => onDataPointClick?.(buildDataPoint(i), e.nativeEvent)}  // ✓
```

---

### Check 5 — Wrong column index when accessing measures

`data.rows[i]` always follows `[...dimensions, ...measures]` ordering, regardless of key order in `dataOptions`. If there are two dimension inputs and code accesses `row[1]` expecting a measure, it gets the second dimension instead.

**Look for:** Hardcoded row indices like `row[1].data`, `row[2].data`, etc. If there are multiple dimension inputs in src/index.tsx, hardcoded indices are likely wrong.

```ts
// FRAGILE — breaks silently if a second dimension input is added
const value = row[1].data as number;

// CORRECT — survives adding more dimensions
const { dimensions } = extractDimensionsAndMeasures(dataOptions);
const value = row[dimensions.length].data as number; // first measure
```

---

### Check 6 — Input name mismatch between types.ts and index.tsx

The `name` in `dataPanel.config.inputs` (src/index.tsx) and the keys in `DataOptions` (src/types.ts) must be identical strings. A mismatch causes TypeScript errors or silent runtime failures where data options are undefined.

**Check:** List the `name` values from the inputs array in src/index.tsx. List the keys of the `DataOptions` type in src/types.ts. They must match exactly (case-sensitive).

---

### Check 7 — SVG `id` collisions in D3 or raw SVG

SVG `id` attributes are document-scoped. Two instances of the widget on the same dashboard will collide on any `<defs>` element (gradients, markers, clip-paths, filters), breaking one of the widgets.

**Look for:** String literals in `id=` attributes inside SVG elements (e.g. `id="arrowhead"`, `id="gradient"`).

```tsx
// BAD — two widget instances share the same ID
<marker id="arrowhead" ...>

// GOOD
const uid = useId();
<marker id={`${uid}-arrowhead`} ...>
```

---

### Check 8 — Stale closure in imperative event handlers

Libraries like Plotly and D3 register event handlers through their own API inside `useEffect`. These handlers close over props at registration time. If props change (new filters, new data), the handlers still see the old values.

**Look for:** `.on('click', ...)`, `.on('plotly_click', ...)`, or `selection.on('click', ...)` inside `useEffect` that reference `props`, `onDataPointClick`, or `onDataPointContextMenu` directly from the outer scope (not via a ref).

```ts
// BAD — handler sees stale props after re-render
useEffect(() => {
  el.on('plotly_click', () => props.onDataPointClick?.(dataPoint, e));
}, [data]);

// GOOD — propsRef always points to latest props
const propsRef = useRef(props);
propsRef.current = props;
useEffect(() => {
  el.on('plotly_click', () =>
    propsRef.current.onDataPointClick?.(dataPoint, e)
  );
}, [data]);
```

---

### Check 9 — Container has zero height

The widget container fills its allocated space, but only if your root element propagates that height. A `<div>` with no explicit height collapses to zero and the widget appears blank.

**Look for:** The root JSX element returned by Visualization. Check it has `style={{ height: '100%' }}` (or equivalent CSS class).

---

### Check 10 — Unguarded access on optional inputs

An input with `minItems: 0` or no `minItems` may have zero columns assigned. Accessing `dataOptions.inputName[0]` without a guard crashes on mount before the user has assigned any columns in the data panel.

**Look for:** `props.dataOptions.X[0]` or `dataOptions.X[0]` (non-optional indexing) where X has no minItems requirement.

```ts
// BAD — crashes when no column is assigned
const col = props.dataOptions.category[0];

// GOOD
const col = props.dataOptions.category?.[0];
if (!col) return <EmptyState />;
```

---

### Check 11 — React-only library in cross-framework build

Some npm packages use React-specific APIs (Context, `ReactDOM.render`, portals) that are incompatible with the Preact bridge used for the Angular/Vue host build. The React build works fine; the Angular/Vue host throws at runtime.

**Look for:** Libraries in `package.json` dependencies that import from `react-dom` or use React Context directly. Check `node_modules/<library>/package.json` for `peerDependencies: { "react-dom": "..." }`.

If found: check if the library provides a Preact-compatible shim, or replace it with a framework-agnostic alternative.

---

## Report format

After all checks, output:

```markdown
## Debug report — [N] issue(s) found

### Issues

**[Issue title]** — `src/components/Visualization.tsx` ~line N
Problem: [what is wrong]
Fix: [exact change to make]

---

### No issues found for

✓ [Issue title]
✓ [Issue title]
```

If zero issues are found, say so clearly and suggest running `/check` for TypeScript type errors and lint issues, which this command does not cover.
