Skip the data query until the required data panel inputs are filled.

Without this guard, `useExecuteQuery` fires immediately on mount with empty `dataOptions` and shows a confusing "No data" message before the user has assigned any columns in the data panel.

---

## Basic guard

```tsx
const { dimensions, measures } = extractDimensionsAndMeasures(
  props.dataOptions
);

const { data, isLoading, isError } = useExecuteQuery({
  dataSource: props.dataSource,
  dimensions,
  measures,
  filters: props.filters,
  highlights: props.highlights,
  enabled: (props.dataOptions.category?.length ?? 0) > 0,
});
```

## Multi-input guard

When multiple inputs are required before the query is meaningful:

```tsx
const hasCategory = (props.dataOptions.category?.length ?? 0) > 0;
const hasValue = (props.dataOptions.value?.length ?? 0) > 0;

const { data, isLoading, isError } = useExecuteQuery({
  dataSource: props.dataSource,
  dimensions,
  measures,
  filters: props.filters,
  highlights: props.highlights,
  enabled: hasCategory && hasValue,
});
```

## Generic length-based guard

When you do not care which specific inputs are filled — only that _some_ dimensions and measures are present:

```tsx
const { dimensions, measures } = extractDimensionsAndMeasures(
  props.dataOptions
);

const { data, isLoading, isError } = useExecuteQuery({
  dataSource: props.dataSource,
  dimensions,
  measures,
  filters: props.filters,
  highlights: props.highlights,
  enabled: dimensions.length > 0 && measures.length > 0,
});
```

---

## Show a "drop data here" prompt instead of "No data"

Check `enabled` **before** calling the hook, render the drop prompt when it is false, and call the hook unconditionally (React hooks cannot be called conditionally):

```tsx
export const Visualization: CustomVisualization<VisualizationProps> = (props) => {
  const hasRequiredData = (props.dataOptions.category?.length ?? 0) > 0;

  const { dimensions, measures } = useMemo(
    () => extractDimensionsAndMeasures(props.dataOptions),
    [props.dataOptions],
  );

  const { data: rawData, isLoading, isError } = useExecuteQuery({
    dataSource: props.dataSource,
    dimensions,
    measures,
    filters: props.filters,
    highlights: props.highlights,
    enabled: hasRequiredData,
  });

  const data = useMemo(
    () => (rawData ? formatDataSet(rawData, props.dataOptions) : rawData),
    [rawData, props.dataOptions],
  );

  // Guard order matters — see note below
  if (!hasRequiredData) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#aaa',
          fontSize: 13,
          gap: 8,
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 28 }}>⊕</span>
        <span>Assign a dimension to <strong>Category</strong> to start</span>
      </div>
    );
  }

  if (isLoading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (isError || !data || data.rows.length === 0)
    return <div style={{ padding: 16 }}>No data</div>;

  return (/* your chart */);
};
```

## Guard order matters

Always check `!hasRequiredData` **before** `isLoading`. When `enabled: false`, `isLoading` is also `false` — checking `isLoading` first causes a brief flash of the loading state on mount before `hasRequiredData` is evaluated.

Correct order:

```
1. !hasRequiredData → drop prompt   (enabled is false, query never fires)
2. isLoading        → loading state
3. isError || !data → error / no data
4. render chart
```

---

## Query result shape

`data` from `useExecuteQuery` is a `QueryResultData` object:

- `data.columns` — `[{ name, type }]`; order is always `[...dimensions, ...measures]`
- `data.rows[i][j].data` — raw value (string or number)
- `data.rows[i][j].text` — formatted string; populated by `formatDataSet`; may be `null` — use `cell.text ?? String(cell.data)` for display

Measure columns always follow dimension columns. Use `dimensions.length + i` (from `extractDimensionsAndMeasures`) as the measure column offset — `dataOptions.category.length + i` breaks silently when other dimension inputs (e.g. `breakBy`) are also assigned.

See `.claude/docs/data-fetching.md` for full patterns including multi-series and highlights rendering.
